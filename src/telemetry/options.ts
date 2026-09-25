// Option handling for latere-ui/telemetry. Pure functions with no SDK imports,
// so the entry that pulls them in stays around a kilobyte and the rules can be
// tested without a browser SDK.

/** Options for {@link startTelemetry}. */
export interface TelemetryOptions {
  /** `service.name` for the browser spans, by convention `<product>-web`. */
  service: string;
  /**
   * Path prefix of the same-origin relay (`otel.TelemetryProxy`), default
   * `/v1/telemetry`. Traces are posted to `{endpoint}/v1/traces`.
   */
  endpoint?: string;
  /** `service.version` resource attribute. */
  version?: string;
  /** `deployment.environment.name` resource attribute. */
  environment?: string;
  /**
   * Share of page loads that record telemetry, from 0 to 1, default 1. Drawn
   * once per page load before the SDK is requested, so an unsampled page
   * downloads nothing.
   */
  sampleRatio?: number;
}

/** Resolved settings handed to the lazily loaded SDK chunk. */
export interface TelemetryConfig {
  service: string;
  version?: string;
  environment?: string;
  /** Absolute OTLP/HTTP traces URL on the page's origin. */
  tracesUrl: string;
  /** Matches every request to the relay, so the exporter is not traced. */
  ignore: RegExp;
}

/** The relay prefix `otel.TelemetryProxy` is conventionally mounted on. */
export const DEFAULT_ENDPOINT = '/v1/telemetry';

/**
 * resolveConfig validates options against the page's location. It returns
 * the settings for the SDK chunk, or a reason when the options cannot be
 * used: an empty service, an unparseable endpoint, or an endpoint on another
 * origin, which would send spans somewhere other than the application's own
 * relay.
 */
export function resolveConfig(
  options: TelemetryOptions,
  location: { href: string; origin: string },
): TelemetryConfig | string {
  const service = typeof options?.service === 'string' ? options.service.trim() : '';
  if (!service) return 'service is required';

  let url: URL;
  try {
    url = new URL(options.endpoint || DEFAULT_ENDPOINT, location.href);
  } catch {
    return `endpoint ${JSON.stringify(options.endpoint)} is not a URL`;
  }
  if (url.origin !== location.origin) return 'endpoint must be on the page origin';

  // Query and fragment are not part of a relay prefix; a trailing slash is
  // dropped so "/v1/telemetry" and "/v1/telemetry/" name the same route.
  const base = url.origin + url.pathname.replace(/\/+$/, '');
  return {
    service,
    version: nonEmpty(options.version),
    environment: nonEmpty(options.environment),
    tracesUrl: `${base}/v1/traces`,
    ignore: new RegExp(`^${escapeRegExp(base)}(?:[/?#]|$)`),
  };
}

/**
 * sampleRatio normalizes the option to [0, 1]. A missing or non-finite value
 * means every page load records.
 */
export function sampleRatio(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

function nonEmpty(value: string | undefined): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
