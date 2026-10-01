import { test, expect, visit, prepare, setPreferences } from './fixtures';

test(`nested modal closes only the top dialog and restores focus`, async ({ page }) => {
  await visit(page, 'modal');
  const opener = page.getByRole('button', { name: 'Open modal', exact: true });
  await opener.click();
  const nested = page.getByRole('button', { name: 'Create project', exact: true });
  await nested.click();
  await expect(page.getByRole('dialog')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(nested).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
});
test(`empty select accepts keyboard input without a crash`, async ({ page }) => {
  await visit(page, 'forms');
  const empty = page.getByRole('combobox', { name: 'Empty select', exact: true });
  await empty.focus();
  for (const key of ['Enter', 'ArrowDown', 'ArrowUp', 'Enter', 'Escape']) await page.keyboard.press(key);
  await expect(empty).toBeFocused();
});

test('select skips disabled options and scrolls the keyboard selection into view', async ({ page }) => {
  await visit(page, 'select', 'light', '&parity=1');
  await prepare(page, 'select');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.lu-select-option.is-active')).toHaveText('Workspace 03');
  for (let i = 0; i < 15; i++) await page.keyboard.press('ArrowDown');
  await expect(page.locator('.lu-select-option.is-active')).toBeInViewport();
  expect(await page.locator('.lu-select-options').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('combobox', { name: 'Workspace', exact: true })).toContainText('Workspace 18');
});

test(`select opens on a typed character and chooses from the filtered list`, async ({ page }) => {
  await visit(page, 'select', 'light', '&parity=1');
  const trigger = page.getByRole('combobox', { name: 'Workspace', exact: true });
  await trigger.focus();
  await page.keyboard.type('1');
  const search = page.getByRole('combobox', { name: 'Search', exact: true });
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('1');
  await expect(page.getByRole('option')).toHaveCount(11);
  await page.keyboard.type('5');
  await expect(page.getByRole('option')).toHaveText(['Workspace 15']);
  await expect(page.locator('.lu-select-match')).toHaveText(['15']);
  await expect(search).toHaveAttribute('aria-activedescendant', (await page.getByRole('option').getAttribute('id'))!);
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText('Workspace 15');
});

test(`select Escape clears the search before closing, and Tab moves on`, async ({ page }) => {
  await visit(page, 'select', 'light', '&parity=1');
  const trigger = page.getByRole('combobox', { name: 'Workspace', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const search = page.getByRole('combobox', { name: 'Search', exact: true });
  await expect(search).toBeFocused();
  await page.keyboard.type('mars');
  await expect(page.locator('.lu-select-empty')).toHaveText('No matches');
  await expect(page.getByRole('option')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(search).toHaveValue('');
  await expect(page.getByRole('option')).toHaveCount(20);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(search).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Empty choices', exact: true })).toBeFocused();
});

test(`select menu grows past a narrow trigger and stays inside the viewport`, async ({ page }) => {
  await visit(page, 'select', 'light', '&parity=1');
  const select = page.locator('.lu-select').first();
  await select.evaluate(el => { Object.assign((el as HTMLElement).style, { width: '80px', marginLeft: `${document.documentElement.clientWidth - 140}px` }); });
  await select.locator('.lu-select-trigger').click();
  const fit = await select.evaluate(el => {
    const trigger = el.querySelector('.lu-select-trigger')!.getBoundingClientRect();
    const menu = el.querySelector('.lu-select-list')!.getBoundingClientRect();
    const row = el.querySelector('.lu-select-option')!;
    return { trigger: trigger.width, menu: menu.width, right: menu.right, viewport: document.documentElement.clientWidth, cut: row.scrollWidth - row.clientWidth };
  });
  expect(fit.menu).toBeGreaterThan(fit.trigger);
  expect(fit.right).toBeLessThanOrEqual(fit.viewport - 16 + 0.5);
  expect(fit.cut, 'labels fit the grown menu').toBeLessThanOrEqual(0);
  await page.getByRole('combobox', { name: 'Search', exact: true }).fill('20');
  await expect(page.getByRole('option')).toHaveText(['Workspace 20']);
  expect(await select.locator('.lu-select-list').evaluate(el => el.getBoundingClientRect().width), 'width held while filtering').toBe(fit.menu);
});

test('palette keeps keyboard selection visible and restores its opener', async ({ page }) => {
  await visit(page, 'palette', 'light', '&parity=1');
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
  await visit(page, 'account', 'light', '&parity=1');
  await prepare(page, 'account');
  const menu = page.locator('.lu-am-dd');
  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  const logout = page.getByRole('button', { name: /sign out|log out/i });
  await logout.scrollIntoViewIfNeeded();
  await expect(logout).toBeInViewport();
});

test('reduced motion stops skeleton shimmer and slows the busy indicator', async ({ page }) => {
  await visit(page, 'feedback', 'light', '&parity=1');
  await expect(page.locator('.lu-skeleton').first()).not.toHaveCSS('animation-name', 'none');
  await expect(page.locator('.lu-spinner').first()).toHaveCSS('animation-duration', '0.65s');
  await setPreferences(page, { motion: 'reduce' });
  await expect(page.locator('.lu-skeleton').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.lu-spinner').first()).toHaveCSS('animation-duration', '1.4s');
});
