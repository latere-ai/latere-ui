import { test, expect, visit } from './fixtures';

for (const theme of ['light', 'dark']) test(`${theme} compact glass buttons have visible edges and pressed fill`, async ({ page }) => {
  await visit(page, 'vue', 'buttons', theme);
  for (const button of [page.locator('.lu-btn-glass').first(), page.locator('.lu-iconbtn').first()]) {
    const edge = await button.evaluate(el => {
      const style = getComputedStyle(el);
      const probe = document.createElement('canvas');
      const ctx = probe.getContext('2d')!;
      ctx.fillStyle = style.borderTopColor;
      ctx.fillRect(0, 0, 1, 1);
      return ctx.getImageData(0, 0, 1, 1).data[3] / 255;
    });
    expect(edge).toBeGreaterThanOrEqual(0.15);
    expect(edge).toBeLessThanOrEqual(0.3);
  }
  const normal = await page.locator('.lu-iconbtn').first().evaluate(el => getComputedStyle(el).backgroundColor);
  const pressed = await page.locator('.lu-iconbtn.is-pressed').evaluate(el => getComputedStyle(el).backgroundColor);
  expect(pressed).not.toBe(normal);
});

for (const theme of ['light', 'dark']) test(`${theme} select marks its chosen row and opens on complete rows`, async ({ page }) => {
  await visit(page, 'vue', 'select', theme);
  await page.getByRole('combobox', { name: 'Workspace', exact: true }).click();
  await expect(page.locator('.lu-select-option.is-selected')).not.toHaveCSS('box-shadow', 'none');
  const geometry = await page.locator('.lu-select-list').evaluate(list => {
    const options = list.querySelectorAll('.lu-select-option');
    return { bottom: list.getBoundingClientRect().bottom, seventh: options[6].getBoundingClientRect().bottom, eighth: options[7].getBoundingClientRect().top };
  });
  // Seven complete one-line options; remaining rows are reached by scrolling.
  expect(geometry.bottom - geometry.seventh).toBeLessThanOrEqual(8);
  expect(geometry.bottom - geometry.eighth).toBeLessThanOrEqual(8);
});
