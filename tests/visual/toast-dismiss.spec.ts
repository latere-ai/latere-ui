import { writeFileSync } from 'node:fs';
import { test, expect, visit, prepare } from './fixtures';
import { captureExact } from './exact-golden';
import type { Page } from '@playwright/test';

async function waitForToastEntrance(page: Page) {
  await expect(page.locator('.lu-toast-enter-active')).toHaveCount(0);
}

test('toast geometry waits for every staggered entrance', async ({ page }) => {
  await visit(page, 'react', 'toast', 'dark', '&parity=1&design=wallfacer');
  await page.addStyleTag({ content: '.lu-toast-enter-active:not(:first-child) { transition-duration: 1s; }' });
  await prepare(page, 'react', 'toast');
  await expect(page.locator('.lu-toast')).toHaveCount(4);
  await waitForToastEntrance(page);
  expect(await page.locator('.lu-toast-enter-active').count()).toBe(0);
  expect(await page.locator('.lu-toast').evaluateAll(rows => rows.map(row => getComputedStyle(row).transform))).toEqual(['none', 'none', 'none', 'none']);
});

for (const framework of ['vue', 'react']) for (const design of ['default', 'replichai', 'wallfacer', 'origo']) {
  for (const theme of ['light', 'dark']) for (const width of [390, 1100]) {
    test(`${framework} ${design} ${theme} ${width} toast dismiss is reachable and keyboard operable`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 850 });
      await visit(page, framework, 'toast', theme, `&parity=1${design === 'default' ? '' : `&design=${design}`}`);
      await prepare(page, framework, 'toast');
      const rows = page.locator('.lu-toast');
      const buttons = page.getByRole('button', { name: 'Dismiss notification', exact: true });
      await expect(buttons).toHaveCount(4);
      await waitForToastEntrance(page);
      await expect(page.getByRole('status')).toHaveCount(3);
      await expect(page.getByRole('alert')).toHaveCount(1);
      for (let i = 0; i < 4; i++) {
        const row = (await rows.nth(i).boundingBox())!;
        const button = (await buttons.nth(i).boundingBox())!;
        expect(button.width).toBeGreaterThanOrEqual(24);
        expect(button.height).toBeGreaterThanOrEqual(24);
        expect(button.x).toBeGreaterThanOrEqual(row.x);
        expect(button.x + button.width).toBeLessThanOrEqual(Math.min(row.x + row.width, width));
        expect(Math.abs(button.y + button.height / 2 - (row.y + row.height / 2))).toBeLessThan(0.5);
        const text = (await rows.nth(i).locator('.lu-toast-text').boundingBox())!;
        expect(text.x + text.width).toBeLessThanOrEqual(button.x);
      }
      if (framework === 'vue' && width === 390) {
        const clip = (await page.locator('.lu-toaster').boundingBox())!;
        writeFileSync(info.outputPath('toast-dismiss-review.png'), await captureExact(page, { clip }));
      }
      await page.getByRole('button', { name: 'Show notifications', exact: true }).focus();
      await page.keyboard.press('Tab');
      await expect(buttons.first()).toBeFocused();
      await expect(buttons.first()).toHaveCSS('outline-style', 'solid');
      await page.keyboard.press('Enter');
      await expect(rows).toHaveCount(3);
      const errorDismiss = page.getByRole('alert').getByRole('button', { name: 'Dismiss notification' });
      await errorDismiss.focus();
      await page.keyboard.press('Space');
      await expect(page.getByRole('alert')).toHaveCount(0);
      await expect(rows).toHaveCount(2);
    });
  }
}
