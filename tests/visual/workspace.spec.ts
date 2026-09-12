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
