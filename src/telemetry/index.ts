// latere-ui/telemetry: browser telemetry for any Latere frontend in one call.
//
// The page pays for this module only: option checks, a sampling draw and a
// scheduler. The OpenTelemetry SDK, its instrumentations and web-vitals live
// behind the dynamic import in load(), so a bundler with code splitting emits
// them as their own chunk, requested after the page has loaded and gone idle.
// Spans go to the application's same-origin relay (otel.TelemetryProxy from
// latere.ai/x/pkg/otel), which holds the collector credentials.

import { resolveConfig, sampleRatio, type TelemetryConfig, type TelemetryOptions } from './options';

export type { TelemetryOptions } from './options';

// idleTimeoutMs bounds how long a busy page can hold the SDK back once it has
// loaded; fallbackDelayMs stands in for an idle callback in browsers without
// requestIdleCallback.
const idleTimeoutMs = 5000;
const fallbackDelayMs = 1000;

let started = false;

/**
 * startTelemetry starts browser tracing and Core Web Vitals reporting against
 * the relay at `options.endpoint` (default `/v1/telemetry`).
 *
 * It returns immediately and never throws: the SDK is loaded after the page's
 * `load` event, when the browser is idle, and any failure is reported with a
 * single `console.debug`. The first valid call wins; later calls do nothing.
 * Outside a browser (server rendering, Node tests) it does nothing.
 */
export function startTelemetry(options: TelemetryOptions): void {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (started) return;
    const config = resolveConfig(options, window.location);
    if (typeof config === 'string') {
      debug(config);
      return;
    }
    started = true;
    // Drawn before anything is requested, so an unsampled page downloads
    // nothing and a sampled page records all of its spans.
    if (Math.random() >= sampleRatio(options.sampleRatio)) return;
    afterLoadWhenIdle(() => load(config));
  } catch (err) {
    debug(err);
  }
}

function load(config: TelemetryConfig): void {
  import('./sdk')
    .then(({ init }) => init(config))
    .catch(debug);
}

// afterLoadWhenIdle runs fn once the document has finished loading and the
// main thread is idle, so the SDK download neither competes with the page's
// own resources nor delays its load event.
function afterLoadWhenIdle(fn: () => void): void {
  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(fn, { timeout: idleTimeoutMs });
    } else {
      setTimeout(fn, fallbackDelayMs);
    }
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
}

function debug(reason: unknown): void {
  console.debug('latere-ui/telemetry: disabled:', reason);
}
