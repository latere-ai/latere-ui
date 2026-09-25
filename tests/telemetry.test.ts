import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveConfig, sampleRatio, type TelemetryConfig } from '../src/telemetry/options';

// The SDK chunk is replaced by a stub that counts how often it is imported,
// so the tests can see exactly when startTelemetry pulls it in. doMock after
// resetModules registers the factory afresh for every test.
const sdk = {
  imports: 0,
  fail: undefined as undefined | 'import' | 'init',
  configs: [] as unknown[],
};

function mockSdk() {
  vi.doMock('../src/telemetry/sdk', () => {
    sdk.imports++;
    if (sdk.fail === 'import') throw new Error('chunk failed to load');
    return {
      init: (config: unknown) => {
        if (sdk.fail === 'init') throw new Error('sdk failed to start');
        sdk.configs.push(config);
      },
    };
  });
}

// A writable view of the globals the scheduler reads, so tests can install
// and remove them.
const idleWindow = window as unknown as { requestIdleCallback?: unknown };
const loadingDocument = document as unknown as { readyState?: string };

let idle: Array<() => void>;
let requestIdle: ReturnType<typeof vi.fn>;
let debug: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.resetModules();
  mockSdk();
  sdk.imports = 0;
  sdk.fail = undefined;
  sdk.configs = [];
  idle = [];
  requestIdle = vi.fn((cb: IdleRequestCallback) => {
    idle.push(() => cb({ didTimeout: false, timeRemaining: () => 50 }));
    return idle.length;
  });
  idleWindow.requestIdleCallback = requestIdle;
  debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  delete idleWindow.requestIdleCallback;
  // Drop per-test overrides so the document reads its own state again.
  delete loadingDocument.readyState;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Each test gets a fresh module, so the once-per-page guard starts unset.
async function freshStart() {
  return (await import('../src/telemetry/index')).startTelemetry;
}

function runIdle() {
  for (const fn of idle.splice(0)) fn();
}

describe('startTelemetry', () => {
  it('does not import the SDK until the page is idle', async () => {
    const start = await freshStart();
    start({ service: 'example-web', version: '1.2.3', environment: 'production' });

    expect(requestIdle).toHaveBeenCalledTimes(1);
    expect(requestIdle.mock.calls[0][1]).toEqual({ timeout: expect.any(Number) });
    await Promise.resolve();
    expect(sdk.imports).toBe(0);

    runIdle();
    await vi.waitFor(() => expect(sdk.configs).toHaveLength(1));
    expect(sdk.imports).toBe(1);
    expect(sdk.configs[0]).toMatchObject({
      service: 'example-web',
      version: '1.2.3',
      environment: 'production',
      tracesUrl: 'http://localhost:3000/v1/telemetry/v1/traces',
    });
    expect(debug).not.toHaveBeenCalled();
  });

  it('waits for the load event before scheduling', async () => {
    Object.defineProperty(document, 'readyState', { configurable: true, value: 'interactive' });
    const start = await freshStart();
    start({ service: 'example-web' });
    expect(requestIdle).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('load'));
    expect(requestIdle).toHaveBeenCalledTimes(1);
    expect(sdk.imports).toBe(0);
  });

  it('falls back to a timer where idle callbacks are unavailable', async () => {
    delete idleWindow.requestIdleCallback;
    vi.useFakeTimers();
    const start = await freshStart();
    start({ service: 'example-web' });

    vi.advanceTimersByTime(999);
    await Promise.resolve();
    expect(sdk.imports).toBe(0);

    vi.advanceTimersByTime(1);
    vi.useRealTimers();
    await vi.waitFor(() => expect(sdk.configs).toHaveLength(1));
  });

  it('ignores every call after the first', async () => {
    const start = await freshStart();
    start({ service: 'first-web' });
    start({ service: 'second-web' });
    start({ service: 'third-web', endpoint: '/other' });

    expect(requestIdle).toHaveBeenCalledTimes(1);
    runIdle();
    await vi.waitFor(() => expect(sdk.configs).toHaveLength(1));
    expect(sdk.configs[0]).toMatchObject({ service: 'first-web' });
  });

  it('refuses an endpoint on another origin', async () => {
    const start = await freshStart();
    start({ service: 'example-web', endpoint: 'https://collector.example/v1/telemetry' });

    expect(requestIdle).not.toHaveBeenCalled();
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it('records nothing without a service and lets a valid call start afterwards', async () => {
    const start = await freshStart();
    expect(() => start({ service: '' })).not.toThrow();
    expect(() => start({ service: '   ' })).not.toThrow();
    expect(() => start({} as never)).not.toThrow();
    expect(() => start(undefined as never)).not.toThrow();
    expect(requestIdle).not.toHaveBeenCalled();

    start({ service: 'example-web' });
    expect(requestIdle).toHaveBeenCalledTimes(1);
  });

  it('never throws when the SDK chunk fails to load', async () => {
    sdk.fail = 'import';
    const start = await freshStart();
    expect(() => start({ service: 'example-web' })).not.toThrow();

    runIdle();
    await vi.waitFor(() => expect(debug).toHaveBeenCalledTimes(1));
    expect(sdk.configs).toHaveLength(0);
  });

  it('never throws when the SDK fails to start', async () => {
    sdk.fail = 'init';
    const start = await freshStart();
    start({ service: 'example-web' });

    runIdle();
    await vi.waitFor(() => expect(debug).toHaveBeenCalledTimes(1));
    expect(sdk.imports).toBe(1);
  });

  it('never throws when scheduling fails', async () => {
    idleWindow.requestIdleCallback = () => {
      throw new Error('idle callbacks blocked');
    };
    const start = await freshStart();
    expect(() => start({ service: 'example-web' })).not.toThrow();
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it('downloads nothing on a page load outside the sample', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.6);
    const start = await freshStart();
    start({ service: 'example-web', sampleRatio: 0.5 });
    start({ service: 'example-web', sampleRatio: 1 });

    expect(requestIdle).not.toHaveBeenCalled();
    expect(sdk.imports).toBe(0);
  });

  it('loads on a page load inside the sample', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.4);
    const start = await freshStart();
    start({ service: 'example-web', sampleRatio: 0.5 });
    expect(requestIdle).toHaveBeenCalledTimes(1);
  });

  it('never loads with a sample ratio of zero', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const start = await freshStart();
    start({ service: 'example-web', sampleRatio: 0 });
    expect(requestIdle).not.toHaveBeenCalled();
  });
});

describe('resolveConfig', () => {
  const page = { href: 'https://app.example/docs/page?q=1', origin: 'https://app.example' };

  function resolved(endpoint?: string): TelemetryConfig {
    const config = resolveConfig({ service: 'example-web', endpoint }, page);
    if (typeof config === 'string') throw new Error(config);
    return config;
  }

  it('posts traces under the default relay prefix', () => {
    expect(resolved().tracesUrl).toBe('https://app.example/v1/telemetry/v1/traces');
  });

  it('derives the traces URL from a custom endpoint', () => {
    expect(resolved('/relay').tracesUrl).toBe('https://app.example/relay/v1/traces');
    expect(resolved('/relay/').tracesUrl).toBe('https://app.example/relay/v1/traces');
    expect(resolved('https://app.example/relay').tracesUrl).toBe('https://app.example/relay/v1/traces');
    expect(resolved('relay').tracesUrl).toBe('https://app.example/docs/relay/v1/traces');
  });

  it('ignores every request to the endpoint and nothing that only shares its prefix', () => {
    const { ignore, tracesUrl } = resolved('/v1/telemetry');
    expect(ignore.test(tracesUrl)).toBe(true);
    expect(ignore.test('https://app.example/v1/telemetry')).toBe(true);
    expect(ignore.test('https://app.example/v1/telemetry/v1/logs')).toBe(true);
    expect(ignore.test('https://app.example/v1/telemetry?x=1')).toBe(true);

    expect(ignore.test('https://app.example/v1/telemetryx/v1/traces')).toBe(false);
    expect(ignore.test('https://app.example/api/v1/telemetry/v1/traces')).toBe(false);
    expect(ignore.test('https://other.example/v1/telemetry/v1/traces')).toBe(false);
  });

  it('matches the endpoint literally', () => {
    const { ignore } = resolved('/v1/tele.metry');
    expect(ignore.test('https://app.example/v1/tele.metry/v1/traces')).toBe(true);
    expect(ignore.test('https://app.example/v1/teleXmetry/v1/traces')).toBe(false);
  });

  it('keeps only non-empty resource attributes', () => {
    const config = resolveConfig({ service: ' example-web ', version: ' ', environment: 'staging' }, page);
    expect(config).toMatchObject({ service: 'example-web', environment: 'staging' });
    expect((config as TelemetryConfig).version).toBeUndefined();
  });

  it('explains why options cannot be used', () => {
    expect(resolveConfig({ service: '' }, page)).toEqual(expect.any(String));
    expect(resolveConfig({ service: 'example-web', endpoint: 'https://other.example/t' }, page)).toEqual(
      expect.any(String),
    );
    expect(resolveConfig({ service: 'example-web', endpoint: 'http://[bad' }, page)).toEqual(expect.any(String));
  });
});

describe('sampleRatio', () => {
  it('defaults to every page load and clamps to [0, 1]', () => {
    expect(sampleRatio(undefined)).toBe(1);
    expect(sampleRatio(Number.NaN)).toBe(1);
    expect(sampleRatio(Number.POSITIVE_INFINITY)).toBe(1);
    expect(sampleRatio(0.25)).toBe(0.25);
    expect(sampleRatio(-1)).toBe(0);
    expect(sampleRatio(2)).toBe(1);
  });
});
