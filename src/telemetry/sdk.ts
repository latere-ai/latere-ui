// The lazily loaded half of latere-ui/telemetry: the OpenTelemetry web SDK,
// the document load, fetch and XHR instrumentations, and Core Web Vitals.
// Only index.ts imports this module, and only through a dynamic import.

import type { Context } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  WebTracerProvider,
  type BatchSpanProcessorBrowserConfig,
  type ReadableSpan,
  type Span,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-web';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_URL_PATH,
} from '@opentelemetry/semantic-conventions';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

import type { TelemetryConfig } from './options';

// Instrumentation scope of the web vital spans.
const scope = 'latere-ui/telemetry';

// The browser.web_vital event and its attribute keys, as the OpenTelemetry
// semantic conventions registry defines them. The conventions package
// exports the event name but not these keys yet, so they are spelled here.
export const WEB_VITAL = 'browser.web_vital';
export const ATTR_WEB_VITAL_NAME = 'browser.web_vital.name';
export const ATTR_WEB_VITAL_VALUE = 'browser.web_vital.value';
export const ATTR_WEB_VITAL_DELTA = 'browser.web_vital.delta';
export const ATTR_WEB_VITAL_ID = 'browser.web_vital.id';
export const ATTR_WEB_VITAL_RATING = 'browser.web_vital.rating';
export const ATTR_WEB_VITAL_NAVIGATION_TYPE = 'browser.web_vital.navigation_type';

// URL-valued span attributes the instrumentations set: http.url under the
// default HTTP conventions, url.full under the stable ones.
const urlAttributes = ['http.url', 'url.full'];

/**
 * init starts the tracer provider, the instrumentations and the web vitals
 * reporter, and flushes queued spans when the page is hidden.
 */
export function init(config: TelemetryConfig): void {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.service,
    ...(config.version ? { [ATTR_SERVICE_VERSION]: config.version } : {}),
    ...(config.environment ? { [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: config.environment } : {}),
  });
  // The processor's own hide listener is disabled: it would flush before
  // web-vitals reports its final values on the same event. flushOnHide below
  // replaces it. The typings declare the Node constructor, which takes a
  // BufferConfig; a typed variable carries the browser-only option past the
  // excess property check without a cast.
  const batchConfig: BatchSpanProcessorBrowserConfig = { disableAutoFlushOnDocumentHide: true };
  const batch = new BatchSpanProcessor(new OTLPTraceExporter({ url: config.tracesUrl }), batchConfig);
  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [new RedactingSpanProcessor(batch)],
  });
  // Registers the W3C trace context propagator the fetch and XHR
  // instrumentations inject with, and the default StackContextManager.
  provider.register();

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new DocumentLoadInstrumentation(),
      // No propagateTraceHeaderCorsUrls: traceparent is only added to
      // same-origin requests, so no third party receives it.
      new FetchInstrumentation({ ignoreUrls: [config.ignore] }),
      new XMLHttpRequestInstrumentation({ ignoreUrls: [config.ignore] }),
    ],
  });

  const tracer = provider.getTracer(scope);
  const report = (metric: Metric) => {
    try {
      tracer.startSpan(WEB_VITAL, { attributes: webVitalAttributes(metric) }).end();
    } catch {
      // A failed report costs that one value; it must not surface in the
      // page's listener that web-vitals reports from.
    }
  };
  onLCP(report);
  onINP(report);
  onCLS(report);
  onFCP(report);
  onTTFB(report);

  flushOnHide(() => provider.forceFlush());
}

/** webVitalAttributes maps a web-vitals report to browser.web_vital attributes. */
export function webVitalAttributes(metric: Metric): Record<string, string | number> {
  return {
    [ATTR_WEB_VITAL_NAME]: metric.name.toLowerCase(),
    [ATTR_WEB_VITAL_VALUE]: metric.value,
    [ATTR_WEB_VITAL_DELTA]: metric.delta,
    [ATTR_WEB_VITAL_ID]: metric.id,
    [ATTR_WEB_VITAL_RATING]: metric.rating,
    [ATTR_WEB_VITAL_NAVIGATION_TYPE]: metric.navigationType,
    [ATTR_URL_PATH]: location.pathname,
  };
}

/**
 * flushOnHide calls flush when the page is hidden or unloaded.
 *
 * The listeners sit on window in the bubble phase, and are added after
 * web-vitals has started: web-vitals finalizes LCP, CLS and INP from
 * capture-phase listeners on the same visibilitychange, so the final values
 * are queued before this flush runs. The exporter sends with keepalive, so
 * the request outlives the page.
 */
export function flushOnHide(flush: () => Promise<void>): void {
  const run = () => {
    flush().catch(() => {
      // An export that fails on the way out has nowhere to be reported.
    });
  };
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') run();
  });
  // pagehide covers browsers that do not fire visibilitychange on unload.
  window.addEventListener('pagehide', run);
}

/**
 * redactUrl cuts the query string and fragment from a URL. Tokens, codes and
 * search terms travel there, and the path is all a performance query needs.
 */
export function redactUrl(value: string): string {
  const cut = value.search(/[?#]/);
  return cut === -1 ? value : value.slice(0, cut);
}

/**
 * RedactingSpanProcessor cuts query strings and fragments from URL
 * attributes as each span ends, before the batch processor queues it.
 */
export class RedactingSpanProcessor implements SpanProcessor {
  constructor(private readonly next: SpanProcessor) {}

  onStart(span: Span, parentContext: Context): void {
    this.next.onStart(span, parentContext);
  }

  onEnd(span: ReadableSpan): void {
    for (const key of urlAttributes) {
      const value = span.attributes[key];
      if (typeof value === 'string') span.attributes[key] = redactUrl(value);
    }
    this.next.onEnd(span);
  }

  forceFlush(): Promise<void> {
    return this.next.forceFlush();
  }

  shutdown(): Promise<void> {
    return this.next.shutdown();
  }
}
