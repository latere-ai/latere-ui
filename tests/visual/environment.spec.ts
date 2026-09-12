import { test, expect, visit } from './fixtures';

// Simulate a host with accessibility preferences enabled. Individual cases
// select their own preferences after the shared fixture establishes defaults.
test.use({ reducedMotion: 'reduce', contrast: 'more', forcedColors: 'active' });
test('fixture starts with explicit media preferences despite inherited settings', async ({ page }) => {
  await visit(page, 'vue', 'buttons');
  expect(await page.evaluate(() => [
    '(prefers-reduced-motion: reduce)',
    '(prefers-reduced-transparency: reduce)',
    '(prefers-contrast: more)',
    '(forced-colors: active)',
  ].map(query => matchMedia(query).matches))).toEqual([false, false, false, false]);
});

test('fixture paints a full viewport even for a short component sheet', async ({ page }) => {
  await visit(page, 'vue', 'buttons', 'dark');
  const body = await page.locator('body').boundingBox();
  expect(body!.height).toBeGreaterThanOrEqual(page.viewportSize()!.height);
});

test('reference capture renders native pixels at 300 DPI equivalent', async ({ page }) => {
  await visit(page, 'vue', 'buttons');
  const scale = 300 / 96;
  expect(await page.evaluate(() => devicePixelRatio)).toBe(scale);
  const png = await page.screenshot({ scale: 'device', animations: 'disabled' });
  const viewport = page.viewportSize()!;
  // PNG IHDR dimensions; fractional CSS-to-device bounds round to whole pixels.
  expect(Math.abs(png.readUInt32BE(16) - viewport.width * scale)).toBeLessThanOrEqual(1);
  expect(Math.abs(png.readUInt32BE(20) - viewport.height * scale)).toBeLessThanOrEqual(1);
});
