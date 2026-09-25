import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-web';
import type { Metric } from 'web-vitals';

import { resolveConfig, type TelemetryConfig } from '../src/telemetry/options';
import {
  flushOnHide,
  init,
  RedactingSpanProcessor,
  redactUrl,
  webVitalAttributes,
} from '../src/telemetry/sdk';

// Vitest resolves the OpenTelemetry packages to their Node builds, whose OTLP
// transport is node:http. The exporter is replaced by one that keeps what it
// is given, and the batch processor records its options, so these tests see
// what the browser build would send and how it is configured. The real
// browser path is exercised by the browser test under tests/visual.
const sink = vi.hoisted(() => ({
  url: '',
  spans: [] as unknown[],
  batchConfig: undefined as unknown,
}));

vi.mock('@opentelemetry/exporter-trace-otlp-http', () => ({
  OTLPTraceExporter: class {
    constructor(options: { url: string }) {
      sink.url = options.url;
    }
    export(spans: unknown[], done: (result: { code: number }) => void) {
      sink.spans.push(...spans);
      done({ code: 0 });
    }
    forceFlush() {
      return Promise.resolve();
    }
    shutdown() {
      return Promise.resolve();
    }
  },
}));

vi.mock('@opentelemetry/sdk-trace-web', async (importOriginal) => {
  const sdk = await importOriginal<typeof import('@opentelemetry/sdk-trace-web')>();
  class BatchSpanProcessor extends sdk.BatchSpanProcessor {
    constructor(...args: ConstructorParameters<typeof sdk.BatchSpanProcessor>) {
      super(...args);
      sink.batchConfig = args[1];
    }
  }
  return { ...sdk, BatchSpanProcessor };
});

// web-vitals is replaced by reporters the tests drive. Like the library, the
// CLS reporter finalizes from a capture-phase visibilitychange listener on
// window; that ordering is what the flush has to respect.
const vitals = vi.hoisted(() => ({ report: {} as Record<string, (metric: unknown) => void>, hides: 0 }));

vi.mock('web-vitals', () => {
  const reporter = (name: string, finalizeOnHide: boolean) => (cb: (metric: unknown) => void) => {
    vitals.report[name] = cb;
    if (!finalizeOnHide) return;
    addEventListener(
      'visibilitychange',
      () => {
        // Each hide finalizes a distinct CLS instance, so a test can tell
        // this hide's report from one a previous hide left in the queue.
        if (document.visibilityState === 'hidden') cb({ ...metric(name, 0.05), id: `v6-${name}-${++vitals.hides}` });
      },
      true,
    );
  };
  return {
    onLCP: reporter('LCP', false),
    onINP: reporter('INP', false),
    onCLS: reporter('CLS', true),
    onFCP: reporter('FCP', false),
    onTTFB: reporter('TTFB', false),
  };
});

function metric(name: string, value: number): Metric {
  return {
    name,
    value,
    delta: value,
    id: `v6-${name}`,
    rating: 'good',
    entries: [],
    navigationType: 'navigate',
    navigationId: 1,
  } as unknown as Metric;
}

const requests: Array<{ url: string; init: RequestInit }> = [];
let config: TelemetryConfig;
let visibility: DocumentVisibilityState = 'visible';

beforeAll(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
      requests.push({ url: typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, init });
      return new Response('{}', { status: 200 });
    }),
  );
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });

  const resolved = resolveConfig({ service: 'example-web', version: '1.2.3', environment: 'test' }, window.location);
  if (typeof resolved === 'string') throw new Error(resolved);
  config = resolved;
  init(config);
});

beforeEach(() => {
  requests.length = 0;
  sink.spans.length = 0;
  visibility = 'visible';
});

function hide() {
  visibility = 'hidden';
  document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
  visibility = 'visible';
}

function spans(): ReadableSpan[] {
  return sink.spans as ReadableSpan[];
}

function urls(): string[] {
  return spans().map((s) => String(s.attributes['http.url'] ?? ''));
}

function traceparent(url: string): string | null {
  const href = new URL(url, location.href).href;
  const request = requests.find((r) => new URL(r.url, location.href).href === href);
  if (!request) throw new Error(`no request to ${url}`);
  return new Headers(request.init.headers).get('traceparent');
}

describe('browser SDK', () => {
  it('exports to the traces URL under the endpoint', () => {
    expect(sink.url).toBe('http://localhost:3000/v1/telemetry/v1/traces');
  });

  it('leaves flushing on hide to its own listener', () => {
    expect(sink.batchConfig).toEqual({ disableAutoFlushOnDocumentHide: true });
  });

  it('exports HTTP spans with the resource attributes and without query strings or fragments', async () => {
    await (await fetch('/api/items?token=secret#section')).text();

    await vi.waitFor(
      () => {
        hide();
        expect(urls()).toContain('http://localhost:3000/api/items');
      },
      { timeout: 4000, interval: 100 },
    );

    const span = spans().find((s) => s.attributes['http.url'] === 'http://localhost:3000/api/items')!;
    expect(span.resource.attributes).toMatchObject({
      'service.name': 'example-web',
      'service.version': '1.2.3',
      'deployment.environment.name': 'test',
    });
    expect(urls().some((u) => /[?#]/.test(u))).toBe(false);
  });

  it('does not trace requests to the relay', async () => {
    await (await fetch(config.tracesUrl, { method: 'POST', body: '{}' })).text();
    await (await fetch('/api/after-relay')).text();

    await vi.waitFor(
      () => {
        hide();
        expect(urls()).toContain('http://localhost:3000/api/after-relay');
      },
      { timeout: 4000, interval: 100 },
    );
    expect(urls().some((u) => u.includes('/v1/telemetry'))).toBe(false);
  });

  it('sends traceparent to the page origin only', async () => {
    await (await fetch('/api/same-origin')).text();
    await (await fetch('https://third-party.example/pixel')).text();

    expect(traceparent('/api/same-origin')).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-0[01]$/);
    expect(traceparent('https://third-party.example/pixel')).toBeNull();
  });

  it('flushes the web vitals a hide finalizes with that same hide', async () => {
    hide();
    const id = `v6-CLS-${vitals.hides}`;

    await vi.waitFor(() => expect(spans().some((s) => s.attributes['browser.web_vital.id'] === id)).toBe(true));
    const cls = spans().find((s) => s.attributes['browser.web_vital.id'] === id)!;
    expect(cls.name).toBe('browser.web_vital');
    expect(cls.attributes).toMatchObject({
      'browser.web_vital.name': 'cls',
      'browser.web_vital.value': 0.05,
      'browser.web_vital.rating': 'good',
      'url.path': '/',
    });
    expect(cls.instrumentationScope.name).toBe('latere-ui/telemetry');
  });

  it('flushes on pagehide', async () => {
    vitals.report.FCP(metric('FCP', 812));
    window.dispatchEvent(new Event('pagehide'));

    await vi.waitFor(() =>
      expect(spans().some((s) => s.attributes['browser.web_vital.name'] === 'fcp')).toBe(true),
    );
  });

  it('holds spans until the page is hidden', async () => {
    vitals.report.TTFB(metric('TTFB', 120));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(spans()).toHaveLength(0);
  });

  it('keeps a malformed vital report out of the reporting listener', () => {
    expect(() => vitals.report.LCP({})).not.toThrow();
  });
});

describe('webVitalAttributes', () => {
  it('uses the browser.web_vital attribute keys', () => {
    expect(webVitalAttributes({ ...metric('INP', 96), delta: 16, navigationType: 'back-forward-cache' })).toEqual({
      'browser.web_vital.name': 'inp',
      'browser.web_vital.value': 96,
      'browser.web_vital.delta': 16,
      'browser.web_vital.id': 'v6-INP',
      'browser.web_vital.rating': 'good',
      'browser.web_vital.navigation_type': 'back-forward-cache',
      'url.path': '/',
    });
  });
});

describe('redactUrl', () => {
  it('cuts the query string and fragment', () => {
    expect(redactUrl('https://app.example/a/b?code=1&state=2')).toBe('https://app.example/a/b');
    expect(redactUrl('https://app.example/a#token=x')).toBe('https://app.example/a');
    expect(redactUrl('https://app.example/a#x?y')).toBe('https://app.example/a');
    expect(redactUrl('https://app.example/a')).toBe('https://app.example/a');
  });
});

describe('RedactingSpanProcessor', () => {
  it('redacts URL attributes before the next processor and delegates the rest', async () => {
    const next = {
      onStart: vi.fn(),
      onEnd: vi.fn(),
      forceFlush: vi.fn(async () => {}),
      shutdown: vi.fn(async () => {}),
    };
    const processor = new RedactingSpanProcessor(next);
    const span = { attributes: { 'http.url': '/a?x=1', 'url.full': '/b#y', 'http.method': 'GET', count: 3 } };

    processor.onStart(span as never, {} as never);
    processor.onEnd(span as never);
    await processor.forceFlush();
    await processor.shutdown();

    expect(next.onStart).toHaveBeenCalledTimes(1);
    expect(next.onEnd).toHaveBeenCalledWith(span);
    expect(span.attributes).toEqual({ 'http.url': '/a', 'url.full': '/b', 'http.method': 'GET', count: 3 });
    expect(next.forceFlush).toHaveBeenCalledTimes(1);
    expect(next.shutdown).toHaveBeenCalledTimes(1);
  });
});

describe('flushOnHide', () => {
  it('swallows a failed flush', async () => {
    const flush = vi.fn(() => Promise.reject(new Error('offline')));
    flushOnHide(flush);
    window.dispatchEvent(new Event('pagehide'));
    await Promise.resolve();
    expect(flush).toHaveBeenCalled();
  });
});
