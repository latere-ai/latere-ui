import { test, expect, visit } from './fixtures';

for (const theme of ['light', 'dark']) test(`React account appearance reflects and changes the displayed ${theme} theme`, async ({ page }) => {
  await visit(page, 'react', 'account', theme);
  await page.locator('.lu-am-trigger').first().click();
  const group = page.getByRole('radiogroup');
  await expect.soft(group.getByRole('radio', { name: theme === 'light' ? 'Light' : 'Dark', exact: true })).toHaveAttribute('aria-checked', 'true');
  await group.getByRole('radio', { name: theme === 'light' ? 'Dark' : 'Light', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
});
