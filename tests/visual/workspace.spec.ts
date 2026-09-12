import { test, expect, visit } from './fixtures';
for (const width of [390, 1280, 1470, 2560]) test(`workspace stays usable at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 1280 ? 720 : 900 });
  await visit(page, 'vue', 'workspace');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  if (width === 390) {
    await expect(page.locator('.lu-cs-nav')).toBeHidden();
    await page.locator('.lu-cs-brand').click();
    await expect(page.locator('.lu-cs-nav')).toBeVisible();
    await page.locator('.lu-cs-fold').click();
    await expect(page.locator('.lu-cs-nav')).toBeHidden();
  }
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Untitled project' })).toBeVisible();
  await expect(page.locator('.workspace-section-heading')).toContainText('9 projects');
  if (width >= 1280) {
    const table = await page.locator('.lu-table').boundingBox();
    expect(table!.y + table!.height).toBeLessThanOrEqual(720);
  }
});

test('mobile workspace primary action raster stays stable across mounts', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let expected: Buffer | undefined;
  for (let mount = 0; mount < 8; mount++) {
    await visit(page, 'vue', 'workspace', 'dark');
    await expect(page.getByRole('button', { name: 'New project', exact: true })).toHaveCSS('backdrop-filter', 'none');
    const actual = await page.screenshot({ fullPage: true, animations: 'disabled', scale: 'device' });
    if (expected && !actual.equals(expected)) {
      await testInfo.attach('first', { body: expected, contentType: 'image/png' });
      await testInfo.attach('repeat', { body: actual, contentType: 'image/png' });
      expect(actual.equals(expected), `mount ${mount} matches the first render`).toBe(true);
    }
    expected ??= actual;
  }
});
