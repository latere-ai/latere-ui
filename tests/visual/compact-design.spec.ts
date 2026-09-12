import { test, expect, visit } from './fixtures';

for (const framework of ['vue', 'react']) for (const theme of ['light', 'dark']) {
  test(`${framework} ${theme} compact panels, tables and toolbars`, async ({ page }) => {
    await visit(page, framework, 'containers', theme);
    await expect(page.locator('.lu-panel').first()).toHaveCSS('border-radius', '14px');
    await expect(page.locator('.lu-panel').first()).toHaveCSS('padding', '16px');
    await expect(page.locator('.lu-table tbody td').first()).toHaveCSS('padding', '8px 16px');
    await expect(page.locator('.lu-bar').first()).toHaveCSS('border-radius', '14px');
    const shadow = await page.locator('.lu-panel').first().evaluate(el => getComputedStyle(el).boxShadow);
    expect(shadow).not.toContain('38px');
    expect(shadow).not.toContain('1.5px');
  });
  test(`${framework} ${theme} compact fields preserve readable control height`, async ({ page }) => {
    await visit(page, framework, 'forms', theme);
    const field = page.locator('input.lu-field-control').first();
    await expect(field).toHaveCSS('border-radius', '8px');
    const bounds = await field.boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(32);
    expect(bounds!.height).toBeLessThanOrEqual(36);
  });
  test(`${framework} ${theme} compact sidebar gives space back to content`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visit(page, framework, 'sidebar', theme);
    const sidebar = page.locator('.lu-cs');
    expect((await sidebar.boundingBox())!.width).toBeLessThanOrEqual(224);
    await expect(page.locator('.lu-cs-item').first()).toHaveCSS('border-radius', '8px');
    const item = await page.locator('.lu-cs-item').first().boundingBox();
    expect(item!.height).toBeGreaterThanOrEqual(32);
    const font = await sidebar.evaluate(el => getComputedStyle(el).fontFamily);
    expect(font).toContain('system-ui');
  });
}
for (const width of [960, 680]) test(`docs adapt to ${width}px available width inside a wide viewport`, async ({ page }) => {
  await page.setViewportSize({ width: 1470, height: 900 });
  await visit(page, 'vue', 'docs');
  await page.locator('[data-component="DocsLayout"]').evaluate((el, width) => { (el as HTMLElement).style.width = `${width}px`; }, width);
  await expect(page.locator('.lu-docs-toc')).toBeHidden();
  const main = await page.locator('.lu-docs-main').boundingBox();
  const side = await page.locator('.lu-docs-side').boundingBox();
  if (width === 960) expect(main!.width).toBeGreaterThanOrEqual(720);
  else expect(main!.y).toBeGreaterThan(side!.y + side!.height);
});

test('docs without a TOC reclaim its column', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await visit(page, 'vue', 'docs', 'light', '&showToc=false');
  await expect(page.locator('.lu-docs-toc')).toHaveCount(0);
  const main = await page.locator('.lu-docs-main').boundingBox();
  expect(main!.width).toBeGreaterThan(950);
});

test('coarse pointer controls retain 44px touch targets', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await visit(page, 'vue', 'buttons');
    for (const button of await page.locator('.lu-btn').all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await visit(page, 'vue', 'forms');
    expect((await page.locator('input.lu-field-control').first().boundingBox())!.height).toBeGreaterThanOrEqual(44);
  } finally { await context.close(); }
});

