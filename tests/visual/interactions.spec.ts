import { test, expect, visit, prepare, setPreferences } from './fixtures';

for (const framework of ['vue', 'react']) {
  test(`${framework} nested modal closes only the top dialog and restores focus`, async ({ page }) => {
    await visit(page, framework, 'modal');
    const opener = page.getByRole('button', { name: 'Open modal', exact: true });
    await opener.click();
    const nested = page.getByRole('button', { name: framework === 'vue' ? 'Open nested modal' : 'Create project', exact: true });
    await nested.click();
    await expect(page.getByRole('dialog')).toHaveCount(2);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(nested).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
  test(`${framework} empty select accepts keyboard input without a crash`, async ({ page }) => {
    await visit(page, framework, framework === 'vue' ? 'select' : 'forms');
    const empty = page.getByRole('combobox', { name: framework === 'vue' ? 'Empty choices' : 'Empty select', exact: true });
    await empty.focus();
    for (const key of ['Enter', 'ArrowDown', 'ArrowUp', 'Enter', 'Escape']) await page.keyboard.press(key);
    await expect(empty).toBeFocused();
  });
}

test('select skips disabled options and scrolls the keyboard selection into view', async ({ page }) => {
  await visit(page, 'vue', 'select');
  await prepare(page, 'vue', 'select');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.lu-select-option.is-active')).toHaveText('Workspace 03');
  for (let i = 0; i < 15; i++) await page.keyboard.press('ArrowDown');
  await expect(page.locator('.lu-select-option.is-active')).toBeInViewport();
  expect(await page.locator('.lu-select-list').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('combobox', { name: 'Workspace', exact: true })).toContainText('Workspace 18');
});

test('palette keeps keyboard selection visible and restores its opener', async ({ page }) => {
  await visit(page, 'vue', 'palette');
  const opener = page.getByRole('button', { name: 'Open palette' });
  await opener.click();
  await expect(page.locator('.lu-cp-input')).toBeFocused();
  for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowDown');
  await expect(page.locator('.lu-cp-item[data-active="true"]')).toBeInViewport();
  expect(await page.locator('.lu-cp-list').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press('Tab');
  await expect(page.locator('.lu-cp-input')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});

test('long account menus keep sign-out reachable inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, 'vue', 'account');
  await prepare(page, 'vue', 'account');
  const menu = page.locator('.lu-am-dd');
  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  const logout = page.getByRole('button', { name: /sign out|log out/i });
  await logout.scrollIntoViewIfNeeded();
  await expect(logout).toBeInViewport();
});

test('reduced motion stops skeleton shimmer and slows the busy indicator', async ({ page }) => {
  await visit(page, 'vue', 'feedback');
  await expect(page.locator('.lu-skeleton').first()).not.toHaveCSS('animation-name', 'none');
  await expect(page.locator('.lu-spinner').first()).toHaveCSS('animation-duration', '0.65s');
  await setPreferences(page, { motion: 'reduce' });
  await expect(page.locator('.lu-skeleton').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.lu-spinner').first()).toHaveCSS('animation-duration', '1.4s');
});
