import { test, expect, visit } from './fixtures';

test('long notification text wraps inside the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await visit(page, 'toast', 'light', '&parity=1&long=true');
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
  await visit(page, 'popover', 'light', '&parity=1&matchWidth=true');
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
  await visit(page, 'account', 'light', '&parity=1');
  await page.addStyleTag({ content: '[data-component="AccountMenu"] { display: block !important; width: 600px; margin-left: 80px; }' });
  await page.locator('.lu-am-trigger').click();
  const trigger = await page.locator('.lu-am-trigger').boundingBox();
  await expect.poll(async () => {
    const panel = await page.locator('.lu-am-dd').boundingBox();
    return panel ? Math.abs(panel.x + panel.width - trigger!.x - trigger!.width) : Infinity;
  }).toBeLessThan(1);
});
