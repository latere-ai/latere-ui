import { test, expect, visit } from './fixtures';

test('collapsed mobile sidebar retains a narrow rail beside its content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, 'vue', 'sidebar-collapsed', 'light');
  const rail = (await page.locator('.lu-cs').boundingBox())!;
  const content = (await page.locator('.shell-content').boundingBox())!;
  expect(rail.width).toBe(64);
  expect(content.x).toBeGreaterThanOrEqual(rail.x + rail.width);
  expect(content.width).toBeGreaterThanOrEqual(250);
});

for (const framework of ['vue', 'react']) test(`origo ${framework} smoke stays neutral while actions use iris`, async ({ page }) => {
  await visit(page, framework, 'containers', 'light', '&design=origo');
  await expect(page.locator('.lu-panel.lu-glass-smoke').first()).toHaveCSS('background-color', 'rgb(10, 10, 10)');
  await visit(page, framework, 'buttons', 'light', '&design=origo');
  await expect(page.locator('.lu-btn-primary').first()).toHaveCSS('background-color', 'rgb(74, 59, 122)');
});
for (const design of ['replichai', 'wallfacer', 'origo']) {
  test(`${design} mobile sidebar gives example content a usable line width`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, 'vue', 'sidebar', 'light', `&design=${design}`);
    expect((await page.locator('.shell-content').boundingBox())!.width).toBeGreaterThanOrEqual(300);
  });
  test(`${design} expanded mobile sidebar retains account identity`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, 'react', 'sidebar', 'light', `&design=${design}`);
    await expect(page.locator('.lu-am-id-name')).toBeVisible();
    const trigger = await page.locator('.lu-am-trigger').boundingBox();
    const identity = await page.locator('.lu-am-id').boundingBox();
    expect(identity!.x + identity!.width).toBeLessThanOrEqual(trigger!.x + trigger!.width);
    await page.locator('.lu-cs-fold').click();
    await expect(page.locator('.lu-am-id-name')).toBeHidden();
  });
}
test('wallfacer dark loading placeholders are visibly distinct from the canvas', async ({ page }) => {
  await visit(page, 'vue', 'feedback', 'dark', '&design=wallfacer');
  const ratio = await page.locator('.lu-skeleton').first().evaluate(el => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    function luminance(color: string) {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
      const c = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
      return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
    }
    const color = getComputedStyle(el).backgroundImage.match(/color\(srgb [^)]+\)|rgba?\([^)]+\)/)![0];
    const [a, b] = [luminance(color), luminance(getComputedStyle(document.body).backgroundColor)].sort((a, b) => a - b);
    return (b + .05) / (a + .05);
  });
  expect(ratio, 'Decorative placeholder visibility').toBeGreaterThanOrEqual(1.4);
});
