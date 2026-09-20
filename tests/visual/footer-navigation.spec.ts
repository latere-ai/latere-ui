import { test, expect, visit } from './fixtures';
import { designs } from './design-manifest';

for (const framework of ['vue', 'react']) for (const design of ['default', ...designs]) for (const theme of ['light', 'dark']) {
  test(`${framework} ${design} ${theme} footer navigation groups`, async ({ page }) => {
    test.setTimeout(60000);
    for (const scenario of ['footer', 'footer-compact']) for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await visit(page, framework, scenario, theme, `&parity=1&design=${design}`);
      const groups = page.locator('[data-footer-group]');
      await expect(groups).toHaveCount(3);
      await expect(groups.locator('h4, .footer-group-title')).toHaveText(['Applications', 'Research', 'Platform']);
      const destinations = [
        ['https://wf.latere.ai/', 'https://lectio.latere.ai/'],
        ['https://replichai.latere.ai/'],
        ['https://platform.latere.ai/console'],
      ];
      for (const [index, hrefs] of destinations.entries()) {
        const links = groups.nth(index).locator('a');
        await expect(links).toHaveCount(hrefs.length);
        for (const [i, href] of hrefs.entries()) {
          await expect(links.nth(i)).toHaveAttribute('href', href);
          await expect(links.nth(i)).toBeVisible();
          await links.nth(i).hover();
          await expect(links.nth(i)).toHaveCSS('text-decoration-line', 'none');
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await expect(page.locator('.site-footer')).not.toContainText(/Topos|Cella|Lux/);
      await expect(page.locator('.footer-seg-btn')).toHaveCount(3);
      await expect(page.locator('.footer-lang-select')).toBeVisible();
    }
  });
}
