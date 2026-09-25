---
title: latere-ui/telemetry, one browser telemetry entry for every frontend
status: complete
depends_on: []
affects:
  - src/telemetry/index.ts (new)
  - src/telemetry/options.ts (new)
  - src/telemetry/sdk.ts (new)
  - tests/telemetry*.test.ts (new)
  - tests/visual/telemetry.spec.ts, telemetry.html, telemetry-page.ts (new)
  - tests/visual/vite.config.ts (prebundled SDK packages)
  - package.json (exports "./telemetry", dependencies)
  - bun.lock
  - docs/api-guide.md (Browser telemetry section)
  - README.md (import table)
  - CHANGELOG.md (Unreleased)
effort: medium
trigger: product frontends each carry an identical copy of the OpenTelemetry browser setup, and a static-site reader is about to add a fifth; the server half is already a shared relay, the browser half should be one call too
created: 2026-09-25
updated: 2026-09-25
author: changkun
dispatched_task_id: null
---

# latere-ui/telemetry

## Overview

Browser telemetry has two halves. The server half is shared: a Go service
mounts `otel.TelemetryProxy` from `latere.ai/x/pkg/otel` on its own origin,
and the relay forwards OTLP/HTTP payloads to the collector with the
collector's credentials added server side. The browser half is not: four
product frontends carry the same `telemetry.ts`, each wiring a tracer
provider, an OTLP exporter and three instrumentations by hand.

This spec replaces those copies with a framework-neutral subpath,
`latere-ui/telemetry`, whose one function starts browser telemetry against
the relay. It adds Core Web Vitals, which none of the copies record, and
keeps the OpenTelemetry SDK off the page's critical path.

## Contract

```ts
import { startTelemetry } from 'latere-ui/telemetry';

startTelemetry({ service: 'example-web' });
```

```ts
interface TelemetryOptions {
  service: string;       // service.name, "<product>-web"
  endpoint?: string;     // relay prefix, default "/v1/telemetry"
  version?: string;      // service.version
  environment?: string;  // deployment.environment.name
  sampleRatio?: number;  // share of page loads that record, default 1
}

function startTelemetry(options: TelemetryOptions): void;
```

- **Returns nothing and never throws.** Every failure (invalid options, a
  chunk that fails to load, an SDK that fails to start) ends in at most one
  `console.debug` line. Telemetry is never a reason for a page to break.
- **Idempotent.** The first call that passes validation wins; later calls
  are no-ops. A host can call it from a component that mounts more than
  once.
- **Browser only.** Without `window` and `document` (server rendering,
  Node tests) the call returns immediately and loads nothing.
- **Same origin only.** `endpoint` is resolved against the page's location.
  A value on another origin is refused, so spans only ever leave through the
  application's own relay.
- **Invalid options are no-ops.** An empty `service` or a cross-origin
  `endpoint` logs one debug line and records nothing. A `sampleRatio`
  outside `[0, 1]` is clamped; a non-finite value means 1.

## Pairing with the relay

The module speaks only to `otel.TelemetryProxy`:

```go
mux.Handle("POST /v1/telemetry/", otel.TelemetryProxy("/v1/telemetry"))
```

| Browser | Relay |
|---|---|
| `endpoint` (default `/v1/telemetry`) | the prefix passed to `TelemetryProxy` |
| exports to `{endpoint}/v1/traces` | forwards to `{collector}/v1/traces` |
| no credentials, no cookies required | adds `OTEL_EXPORTER_OTLP_HEADERS` server side |
| honors `Retry-After` on `429` | answers `429` when the byte budget is spent |
| drops spans after bounded retries | caps each request at 1 MiB |

The exporter is the OTLP/HTTP JSON trace exporter. A trailing slash on
`endpoint` is ignored. When the relay has no collector configured it answers
`503` and the exporter drops the batch quietly. Only call `startTelemetry`
where the relay is mounted; elsewhere every batch is a failed request in the
browser's network log.

## What it records

One trace pipeline, three instrumentations and one reporter:

| Source | Spans |
|---|---|
| Document load | `documentLoad` with `documentFetch` and one `resourceFetch` per subresource, from Navigation and Resource Timing |
| Fetch | one span per `fetch()` call |
| XMLHttpRequest | one span per request |
| Core Web Vitals | one `browser.web_vital` span per reported LCP, INP, CLS, FCP and TTFB value |

Requests to the relay itself are excluded from the Fetch and XHR
instrumentations by an ignore pattern built from the resolved endpoint
(`^{origin}{endpoint}(/|?|#|$)`), so the exporter never traces its own
uploads. The trace context header (`traceparent`) is injected on same-origin
requests only: no `propagateTraceHeaderCorsUrls` is configured, so browser
spans join the application's backend traces and no header reaches a third
party.

Resource attributes: `service.name`, and `service.version` and
`deployment.environment.name` when given. HTTP spans keep the attribute
names the instrumentations emit by default (`http.url`, `http.method`,
`http.status_code`), which are the names dashboards built on the existing
copies read.

### Web vitals

Values come from Google's `web-vitals` library, which reports each metric
when it is final (LCP after the first input or on hide, CLS and INP on hide,
FCP and TTFB once).

The semantic conventions define `browser.web_vital` as an **event**, a log
record, with attributes `browser.web_vital.name` (`lcp`, `inp`, `cls`, `fcp`,
`ttfb`), `browser.web_vital.value`, `browser.web_vital.delta`,
`browser.web_vital.id`, `browser.web_vital.rating` (`good`,
`needs-improvement`, `poor`) and `browser.web_vital.navigation_type`. The
published JavaScript package exports the event name but not yet the
attribute keys.

This module carries each report on a zero-duration **span** named
`browser.web_vital` with exactly those attribute keys, plus `url.path`.
Emitting a log record would need a logger provider and a second exporter in
the lazy chunk, and a logs pipeline behind the relay, to deliver five numbers
per page. Because the name and keys already follow the convention, moving to
events later changes the transport and nothing a query filters on. The keys
are local constants until the conventions package publishes them.

## Privacy

- **No cookies and no identifiers.** The module sets no cookie, reads no
  storage, and attaches no user, account, session or device identifier. The
  relay is anonymous by construction.
- **URLs are the only page data**, and only their path. Before a span is
  queued, the query string and fragment are cut from `http.url` and
  `url.full`, so tokens, codes and search terms carried in URLs are not
  exported. Web vital spans carry `url.path` only.
- **Same origin only.** Spans leave through the application's relay and
  `traceparent` is sent to the application's own origin only.
- The instrumentations record the browser's user agent string
  (`http.user_agent`), which identifies a browser build, not a person.

## Loading strategy and size

`startTelemetry` is the only code on the page's critical path: option
validation, a sampling draw and a scheduler, about 1 KB gzipped. The SDK,
the instrumentations and `web-vitals` sit behind one dynamic `import()`, so
any bundler with code splitting emits them as a separate chunk: 92 KB
minified, 28 KB gzipped, measured with `bun build --minify --splitting`.

The chunk is requested after the page's `load` event, in an idle callback
(`requestIdleCallback` with a timeout, or a short `setTimeout` where idle
callbacks are unavailable). Waiting for `load` keeps the download from
competing with the page's own resources or delaying the `load` event.

Deferral loses nothing the page already did:

- the document load instrumentation reads Navigation and Resource Timing
  after `load`, whenever it is enabled;
- `web-vitals` observes with `buffered: true`, so LCP, FCP, CLS and TTFB
  entries recorded before the chunk arrived are still delivered;
- fetch and XHR calls made before the chunk arrived are not traced.

A page that is closed before the idle callback runs records nothing.

`sampleRatio` is drawn once per page load, **before** the chunk is
requested: an unsampled page downloads nothing, and a sampled page records
all of its spans. A per-trace sampler would still download the SDK on every
page and would keep a random subset of one page's spans.

### Context manager

The SDK default, `StackContextManager`, is used. The zone context manager
exists to carry an active span across asynchronous boundaries, which matters
when a parent span (a user interaction, a manual span) must survive an
`await`. None of the instrumentations here start such a parent: the fetch
and XHR spans are roots, and `traceparent` is injected synchronously when
the request starts. Dropping it removes `zone.js`, which also patches the
page's timers, promises and event listeners.

### Flush on hide

The batch processor's own hide listener is disabled. The module registers
its flush after starting `web-vitals`, on `window` in the bubble phase, for
`visibilitychange` to hidden and for `pagehide`. `web-vitals` finalizes
LCP, CLS and INP from capture-phase listeners on the same event, so the
final vitals are queued before the flush runs. The exporter sends with
`fetch` and `keepalive`, which lets the request outlive the page within the
browser's 64 KiB keepalive budget.

## Dependencies

The SDK packages and `web-vitals` are `dependencies` of `latere-ui`, so a
consumer adds nothing. They are pinned exactly to one release set: the
`0.2xx` experimental packages pin `@opentelemetry/core`,
`@opentelemetry/sdk-trace-web` and `@opentelemetry/resources` to an exact
stable version, and any other version beside them installs and bundles a
second SDK. Packages outside the telemetry subpath never import them, so a
Vue or React host that does not call `startTelemetry` ships none of it.

## Migration of the existing copies

Each product frontend that carries its own `telemetry.ts`:

1. Bumps `latere-ui` to the release that ships this entry.
2. Replaces its `initTelemetry('<name>')` call with
   `startTelemetry({ service: '<product>-web' })`, keeping the guard it
   already has (production build, deployment mode) around the call.
3. Deletes `telemetry.ts` and removes the `@opentelemetry/*` packages and
   `zone.js` from its own `package.json`.
4. Keeps its server's `TelemetryProxy` mount unchanged.

Effects to expect: the SDK leaves the entry chunk even where it was
imported eagerly; Web Vitals spans appear; query strings disappear from
`http.url`; and a product whose service name does not follow
`<product>-web` (for example one ending in `-spa`) changes name, so any
dashboard filtered on the old name is updated with it.

## Acceptance

- `latere-ui/telemetry` exports `startTelemetry` and `TelemetryOptions`;
  `latere-ui` and `latere-ui/react` do not import it.
- Without `window`/`document` the call is a no-op that loads nothing.
- A second call does not schedule a second load.
- The SDK chunk is not imported before `load` and the idle callback.
- A failing chunk import or SDK start never throws into the host and logs at
  most one debug line.
- The exporter URL is `{resolved endpoint}/v1/traces`; the ignore pattern
  matches the endpoint and nothing that merely shares its prefix.
- An unsampled page never imports the chunk; a cross-origin endpoint is
  refused.
- Exported HTTP spans carry no query string or fragment; same-origin
  requests carry `traceparent` and cross-origin requests do not.
- Web vitals reported on hide are included in the flush triggered by the
  same hide.

## Verification

- Unit tests for the entry: no import before `load` and the idle callback,
  the timer fallback, one load per page, the sampling draw, refused options,
  and a failing chunk or SDK start that ends in one debug line. A separate
  test runs the entry without a DOM.
- Unit tests for the SDK half against a recording exporter: the traces URL,
  the disabled built-in hide flush, resource attributes, redacted URLs, the
  relay excluded from tracing, `traceparent` on same-origin requests only,
  and a web vital finalized by a hide leaving with that same hide.
- `tests/visual/telemetry.spec.ts` loads a static page in Chromium and checks
  that the chunk is requested after `loadEventEnd`, that an application
  request carries `traceparent`, and that a hide delivers `documentLoad`,
  fetch and `browser.web_vital` spans (FCP, TTFB, LCP, CLS) to the relay
  route with the expected resource and without query strings.
