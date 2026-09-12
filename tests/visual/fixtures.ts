import { test as base, expect, type Page } from '@playwright/test';
export const test = base.extend<{ browserErrors: string[] }>({
  browserErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname !== '127.0.0.1' && !['data:', 'blob:'].includes(url.protocol)) {
        errors.push(`Unexpected external request: ${url.origin}`);
        return route.abort();
      }
      return route.continue();
    });
    await use(errors);
    expect(errors, 'Browser errors').toEqual([]);
  }, { auto: true }],
});
export { expect };
export async function visit(page: Page, framework: string, scenario: string, theme = 'light', extra = '') {
  await page.goto(`/?framework=${framework}&scenario=${scenario}&theme=${theme}${extra}`);
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#stage > *').first()).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
}
export async function prepare(page: Page, framework: string, scenario: string) {
  if (scenario === 'modal') await page.getByRole('button', { name: 'Open modal', exact: true }).click();
  if (scenario.startsWith('drawer-')) await page.getByRole('button', { name: 'Open drawer' }).click();
  if (scenario === 'popover') await page.getByRole('button', { name: 'Open menu' }).click();
  if (scenario === 'tooltip') await page.getByRole('button', { name: 'Top tooltip' }).focus();
  if (scenario === 'toast') await page.getByRole('button', { name: 'Show notifications' }).click();
  if (scenario === 'confirm') await page.getByRole('button', { name: 'Delete workspace', exact: true }).click();
  if (scenario === 'palette') await page.getByRole('button', { name: 'Open palette' }).click();
  if (scenario === 'account') await page.locator('.lu-am-trigger').first().click();
  if (scenario === 'products') await page.locator('.lu-iconbtn').first().click();
  if (scenario === 'select') await page.getByRole('combobox', { name: 'Workspace', exact: true }).click();
  if (scenario === 'effects') {
    await page.locator('[data-lg-sheen]').hover({ position: { x: 150, y: 80 } });
    await expect(page.locator('[data-lg-sheen] > [aria-hidden]')).toHaveCSS('opacity', '1');
  }
}
