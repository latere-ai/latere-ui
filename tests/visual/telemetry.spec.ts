import { test, expect, type Request } from '@playwright/test';

// Browser telemetry end to end in Chromium: the SDK chunk arrives only after
// the load event, and a hide delivers document load, fetch and web vital
// spans to the same-origin relay, which the route below stands in for.

type OtlpValue = { stringValue?: string; doubleValue?: number; intValue?: string | number };
type OtlpAttributes = Array<{ key: string; value: OtlpValue }>;
interface OtlpSpan {
  name: string;
  attributes: OtlpAttributes;
}
interface OtlpBody {
  resourceSpans: Array<{ resource: { attributes: OtlpAttributes }; scopeSpans: Array<{ spans: OtlpSpan[] }> }>;
}

function value(attributes: OtlpAttributes, key: string): string | number | undefined {
  const v = attributes.find((a) => a.key === key)?.value;
  if (!v) return undefined;
  return v.stringValue ?? v.doubleValue ?? (v.intValue === undefined ? undefined : Number(v.intValue));
}

test('browser telemetry loads after the page and delivers its spans on hide', async ({ page }) => {
  const exports: OtlpBody[] = [];
  const relayUrls: string[] = [];
  let appRequest: Request | undefined;

  await page.route('**/v1/telemetry/**', async (route) => {
    relayUrls.push(route.request().url());
    exports.push(route.request().postDataJSON() as OtlpBody);
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.route('**/api/fixture**', async (route) => {
    appRequest = route.request();
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'ok' });
  });

  const sdkRequest = page.waitForRequest((r) => new URL(r.url()).pathname.endsWith('/src/telemetry/sdk.ts'));
  await page.goto('/telemetry.html');
  await sdkRequest;

  // The chunk is requested after the load event, never while the page loads.
  const timing = () =>
    page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const sdk = performance
        .getEntriesByType('resource')
        .find((e) => new URL(e.name).pathname.endsWith('/src/telemetry/sdk.ts'));
      return sdk ? { loadEventEnd: nav.loadEventEnd, sdkStart: sdk.startTime } : undefined;
    });
  await expect.poll(timing).toBeDefined();
  const { loadEventEnd, sdkStart } = (await timing())!;
  expect(loadEventEnd).toBeGreaterThan(0);
  expect(sdkStart).toBeGreaterThanOrEqual(loadEventEnd);

  // Wait for the fetch instrumentation to be in place, then make the
  // application request with a trusted click, which also finalizes LCP.
  await expect.poll(() => page.evaluate(() => '__original' in window.fetch)).toBe(true);
  await page.getByRole('button', { name: 'Request' }).click();
  await expect.poll(() => appRequest?.url()).toContain('/api/fixture');
  expect(await appRequest!.headerValue('traceparent')).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);

  // Headless pages stay visible, so the hide is dispatched in the page. The
  // relay may be called more than once (FCP and TTFB can export early), so
  // keep hiding until every expected span has arrived.
  const spans = () => exports.flatMap((body) => body.resourceSpans.flatMap((rs) => rs.scopeSpans.flatMap((ss) => ss.spans)));
  const vitalNames = () => spans().filter((s) => s.name === 'browser.web_vital').map((s) => value(s.attributes, 'browser.web_vital.name'));
  await expect
    .poll(
      async () => {
        await page.evaluate(() => {
          Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
          document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
          Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
        });
        const names = new Set(spans().map((s) => s.name));
        return names.has('documentLoad') && names.has('HTTP GET') && ['fcp', 'ttfb', 'lcp', 'cls'].every((n) => vitalNames().includes(n));
      },
      { timeout: 15000 },
    )
    .toBe(true);

  expect(new Set(relayUrls)).toEqual(new Set([new URL('/v1/telemetry/v1/traces', page.url()).href]));
  const resource = exports[0].resourceSpans[0].resource.attributes;
  expect(value(resource, 'service.name')).toBe('fixture-web');
  expect(value(resource, 'service.version')).toBe('0.0.0-fixture');
  expect(value(resource, 'deployment.environment.name')).toBe('test');

  const urls = spans().map((s) => String(value(s.attributes, 'http.url') ?? ''));
  expect(urls).toContain(new URL('/api/fixture', page.url()).href);
  expect(urls.filter((u) => /[?#]/.test(u))).toEqual([]);
  expect(urls.filter((u) => u.includes('/v1/telemetry'))).toEqual([]);

  const lcp = spans().find((s) => value(s.attributes, 'browser.web_vital.name') === 'lcp')!;
  expect(value(lcp.attributes, 'browser.web_vital.value')).toBeGreaterThan(0);
  expect(['good', 'needs-improvement', 'poor']).toContain(value(lcp.attributes, 'browser.web_vital.rating'));
  expect(value(lcp.attributes, 'url.path')).toBe('/telemetry.html');
});
