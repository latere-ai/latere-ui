import { test, expect, visit, prepare } from './fixtures';

for (const design of ['replichai', 'wallfacer', 'origo']) for (const framework of ['vue', 'react']) {
  test(`${design} ${framework} records optical opt-ins as matte surfaces`, async ({ page }) => {
    await visit(page, framework, 'effects', 'light', `&parity=1&design=${design}`);
    await prepare(page, framework, 'effects');
    await expect(page.locator('.effect-surface')).toHaveCount(3);
    await expect(page.getByText('Refraction opt-in · matte preset', { exact: true })).toBeVisible();
    await expect(page.getByText('Sheen opt-in · matte preset', { exact: true })).toBeVisible();
    for (const surface of await page.locator('.effect-surface').all()) {
      await expect(surface).toHaveCSS('backdrop-filter', 'none');
      expect(await surface.evaluate(element => (element as HTMLElement).style.backdropFilter)).toBe('');
    }
    await expect(page.locator('[data-lg-sheen] > [aria-hidden]')).toHaveCount(0);
    await expect(page.locator('svg filter')).toHaveCount(0);
  });
}
