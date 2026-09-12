import { test, expect, visit } from './fixtures';

test('product switcher fits when neither trigger alignment fits the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, 'vue', 'products');
  await page.addStyleTag({ content: '.lu-ps { position: fixed; left: calc(50vw - 18px); top: 180px; }' });
  await page.getByRole('button', { name: 'Switch product' }).click();
  const panel = page.locator('.lu-ps-panel');
  await expect.poll(async () => {
    const box = await panel.boundingBox();
    return !!box && box.x >= 8 && box.x + box.width <= 382;
  }).toBe(true);
  await page.setViewportSize({ width: 320, height: 568 });
  await expect.poll(async () => {
    const box = await panel.boundingBox();
    return !!box && box.x >= 8 && box.x + box.width <= 312;
  }).toBe(true);
  await page.setViewportSize({ width: 240, height: 568 });
  await expect.poll(async () => {
    const box = await panel.boundingBox();
    return !!box && box.x >= 8 && box.x + box.width <= 232;
  }).toBe(true);
  await expect(panel).toHaveJSProperty('scrollWidth', await panel.evaluate(element => element.clientWidth));
});

test('an open product switcher follows viewport resize and scrolls in short viewports', async ({ page }) => {
  await visit(page, 'vue', 'products');
  await page.addStyleTag({ content: '.lu-ps { position: fixed; left: calc(100vw - 54px); top: calc(50vh - 18px); }' });
  await page.getByRole('button', { name: 'Switch product' }).click();
  await page.setViewportSize({ width: 320, height: 220 });
  const panel = page.locator('.lu-ps-panel');
  await expect.poll(async () => {
    const box = await panel.boundingBox();
    return !!box && box.x >= 8 && box.x + box.width <= 312 && box.y >= 8 && box.y + box.height <= 212;
  }).toBe(true);
  const lastLink = page.locator('.lu-ps-tile').last();
  await lastLink.focus();
  await expect(lastLink).toBeInViewport();
  expect(await panel.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
});

test('long notification text wraps inside the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await visit(page, 'vue', 'toast', 'light', '&long=true');
  await page.getByRole('button', { name: 'Show notifications' }).click();
  const toast = page.locator('.lu-toast');
  await expect(toast).toBeVisible();
  await expect.poll(async () => {
    const box = await toast.boundingBox();
    return !!box && box.x >= 8 && box.x + box.width <= 312;
  }).toBe(true);
  await expect(page.locator('.lu-toast-text')).toHaveJSProperty('scrollWidth', await page.locator('.lu-toast-text').evaluate(element => element.clientWidth));
  await page.setViewportSize({ width: 240, height: 568 });
  await expect.poll(async () => {
    const box = await toast.boundingBox();
    return !!box && box.x >= 8 && box.x + box.width <= 232;
  }).toBe(true);
});

test('matchWidth popover keeps the trigger width with long content', async ({ page }) => {
  await visit(page, 'vue', 'popover', 'light', '&matchWidth=true');
  await page.addStyleTag({ content: '.lu-pop { width: 240px; }' });
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('.lu-menu-item').first().evaluate(element => { element.textContent = 'Workspace_' + 'x'.repeat(100); });
  const trigger = await page.locator('.lu-pop-trigger').boundingBox();
  await expect.poll(async () => (await page.locator('.lu-pop-panel').boundingBox())?.width).toBe(trigger!.width);
  await expect(page.locator('.lu-pop-panel')).toHaveJSProperty('scrollWidth', await page.locator('.lu-pop-panel').evaluate(element => element.clientWidth));
  await page.addStyleTag({ content: '.lu-pop { width: 120px; }' });
  await expect.poll(async () => (await page.locator('.lu-pop-panel').boundingBox())?.width).toBe(120);
  await expect(page.locator('.lu-pop-panel')).toHaveJSProperty('scrollWidth', await page.locator('.lu-pop-panel').evaluate(element => element.clientWidth));
});

test('top-end account dropdown stays aligned with its trigger in a wide parent', async ({ page }) => {
  await visit(page, 'vue', 'account');
  await page.addStyleTag({ content: '[data-component="AccountMenu"] { display: block !important; width: 600px; margin-left: 80px; }' });
  await page.locator('.lu-am-trigger').click();
  const trigger = await page.locator('.lu-am-trigger').boundingBox();
  await expect.poll(async () => {
    const panel = await page.locator('.lu-am-dd').boundingBox();
    return panel ? Math.abs(panel.x + panel.width - trigger!.x - trigger!.width) : Infinity;
  }).toBeLessThan(1);
});
