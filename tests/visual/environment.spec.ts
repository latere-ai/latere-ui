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
