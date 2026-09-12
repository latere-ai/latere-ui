import { test, expect, visit } from './fixtures';

for (const framework of ['vue', 'react']) for (const layout of ['desktop', 'mobile']) {
  test.describe(`${framework} canonical overlays ${layout}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(layout === 'mobile' ? { width: 390, height: 844 } : { width: 1100, height: 850 });
    });

    test('nested modals trap keyboard focus and Escape restores each opener', async ({ page }) => {
      await visit(page, framework, 'modal', 'light', '&parity=1');
      const opener = page.getByRole('button', { name: 'Open modal', exact: true });
      await opener.focus(); await opener.press('Enter');
      const outer = page.getByRole('dialog', { name: 'Workspace settings', exact: true });
      const field = outer.getByRole('textbox', { name: 'Workspace name' });
      await expect(field).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(outer.getByRole('button', { name: 'Save changes' })).toBeFocused();
      await page.keyboard.press('Tab'); await expect(field).toBeFocused();
      const nestedOpener = outer.getByRole('button', { name: 'Open nested modal' });
      await nestedOpener.click();
      const nested = page.getByRole('dialog', { name: 'Nested settings', exact: true });
      const nestedClose = nested.getByRole('button', { name: 'Close nested' });
      await expect(page.getByRole('dialog')).toHaveCount(2);
      await expect(nestedClose).toBeFocused();
      await page.keyboard.press('Tab'); await expect(nestedClose).toBeFocused();
      await page.keyboard.press('Shift+Tab'); await expect(nestedClose).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(1);
      await expect(nestedOpener).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(opener).toBeFocused();
    });

    for (const side of ['left', 'right']) test(`${side} drawer keeps its keyboard actions reachable in a short viewport`, async ({ page }) => {
      await page.setViewportSize({ width: layout === 'mobile' ? 390 : 1100, height: 420 });
      await visit(page, framework, `drawer-${side}`, 'light', '&parity=1');
      const opener = page.getByRole('button', { name: 'Open drawer' });
      await opener.click();
      const drawer = page.getByRole('dialog', { name: 'Workspace details' });
      const field = drawer.getByRole('textbox', { name: 'Name', exact: true });
      const done = drawer.getByRole('button', { name: 'Done' });
      await expect(field).toBeFocused();
      await expect(drawer).toHaveCSS('transform', 'none');
      const rect = await drawer.boundingBox();
      expect(rect).not.toBeNull();
      expect(side === 'left' ? rect!.x : page.viewportSize()!.width - rect!.x - rect!.width).toBeCloseTo(0, 1);
      await page.keyboard.press('Shift+Tab');
      await expect(done).toBeFocused(); await expect(done).toBeInViewport();
      expect(await drawer.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
      await page.keyboard.press('Tab'); await expect(field).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(drawer).toHaveCount(0); await expect(opener).toBeFocused();
      await opener.press('Enter'); await done.click();
      await expect(drawer).toHaveCount(0); await expect(opener).toBeFocused();
    });

    test('popover skips disabled menu actions and restores trigger focus on Escape', async ({ page }) => {
      await visit(page, framework, 'popover', 'light', '&parity=1');
      const opener = page.getByRole('button', { name: 'Open menu', exact: true });
      await opener.focus(); await opener.press('Enter');
      const unavailable = page.getByRole('menuitem', { name: 'Unavailable' });
      await expect(unavailable).toBeDisabled();
      await page.keyboard.press('Tab'); await expect(page.getByRole('menuitem', { name: 'Copy link' })).toBeFocused();
      await page.keyboard.press('Tab'); await expect(page.getByRole('menuitem', { name: 'Move to folder' })).toBeFocused();
      await page.keyboard.press('Tab'); await expect(page.getByRole('menuitem', { name: 'Delete', exact: true })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('.lu-pop-panel')).toHaveCount(0);
      await expect(opener).toBeFocused();
      await expect(page.locator('[data-component=GlassPopover]')).toHaveAttribute('data-selection', '');
      await opener.press('Enter');
      await page.getByRole('menuitem', { name: 'Copy link' }).click();
      await expect(page.locator('.lu-pop-panel')).toHaveCount(0);
      await expect(page.locator('[data-component=GlassPopover]')).toHaveAttribute('data-selection', 'copy');
      await expect(opener).toBeFocused();
      await opener.press('Enter');
      await page.getByRole('heading', { level: 1 }).click();
      await expect(page.locator('.lu-pop-panel')).toHaveCount(0);
    });

    test('tooltips appear for pointer and keyboard focus and disappear on departure', async ({ page }) => {
      await visit(page, framework, 'tooltip', 'light', '&parity=1');
      const top = page.getByRole('button', { name: 'Top tooltip' });
      const topTip = page.getByRole('tooltip', { name: 'Copy workspace link' });
      const bottom = page.getByRole('button', { name: 'Bottom tooltip' });
      const bottomTip = page.getByRole('tooltip', { name: 'More information' });
      await expect(topTip).toHaveCSS('opacity', '0');
      await top.hover(); await expect(topTip).toHaveCSS('opacity', '1');
      await page.mouse.move(0, 0); await expect(topTip).toHaveCSS('opacity', '0');
      await top.focus(); await expect(topTip).toHaveCSS('opacity', '1');
      await page.keyboard.press('Tab'); await expect(bottom).toBeFocused();
      await expect(topTip).toHaveCSS('opacity', '0'); await expect(bottomTip).toHaveCSS('opacity', '1');
      const tipRect = await bottomTip.boundingBox(); const buttonRect = await bottom.boundingBox();
      expect(tipRect!.y).toBeGreaterThan(buttonRect!.y + buttonRect!.height);
      await page.keyboard.press('Shift+Tab'); await expect(bottomTip).toHaveCSS('opacity', '0');
    });

    test('notification roles and independent dismissal preserve remaining messages', async ({ page }) => {
      await visit(page, framework, 'toast', 'light', '&parity=1');
      const show = page.getByRole('button', { name: 'Show notifications' });
      await show.click();
      const region = page.getByRole('region', { name: 'Notifications' });
      await expect(region).toHaveAttribute('aria-live', 'polite');
      await expect(region.getByRole('status')).toHaveCount(3);
      await expect(region.getByRole('alert')).toHaveCount(1);
      await region.getByRole('alert').click();
      await expect(region.getByRole('alert')).toHaveCount(0);
      await expect(region.getByRole('status')).toHaveCount(3);
      await region.getByRole('status').filter({ hasText: 'success:' }).click();
      await expect(region.getByRole('status')).toHaveCount(2);
      await show.click();
      await expect(region.getByRole('status')).toHaveCount(3);
      await expect(region.getByRole('alert')).toHaveCount(1);
    });

    test('confirm cancellation and acceptance restore focus and permit subsequent requests', async ({ page }) => {
      await visit(page, framework, 'confirm', 'light', '&parity=1');
      const opener = page.locator('#stage').getByRole('button', { name: 'Delete workspace', exact: true });
      const dialog = page.getByRole('dialog', { name: 'Delete workspace?', exact: true });
      const result = page.locator('[data-component=GlassConfirmHost]');
      await opener.focus(); await opener.press('Enter');
      const cancel = dialog.getByRole('button', { name: 'Cancel', exact: true });
      const accept = dialog.getByRole('button', { name: 'Delete workspace', exact: true });
      await expect(cancel).toBeFocused();
      await expect(result).toHaveAttribute('data-result', 'pending');
      await page.keyboard.press('Shift+Tab'); await expect(accept).toBeFocused();
      await page.keyboard.press('Tab'); await expect(cancel).toBeFocused();
      await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(opener).toBeFocused();
      await expect(result).toHaveAttribute('data-result', 'cancelled');
      await opener.press('Enter'); await cancel.click();
      await expect(dialog).toHaveCount(0); await expect(opener).toBeFocused();
      await expect(result).toHaveAttribute('data-result', 'cancelled');
      await opener.press('Enter'); await accept.click();
      await expect(dialog).toHaveCount(0); await expect(opener).toBeFocused();
      await expect(result).toHaveAttribute('data-result', 'accepted');
      await opener.press('Enter'); await expect(dialog).toHaveCount(1); await expect(cancel).toBeFocused();
      await expect(result).toHaveAttribute('data-result', 'pending');
    });
  });
}
