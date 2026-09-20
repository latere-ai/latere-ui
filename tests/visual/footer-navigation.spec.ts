import { test, expect, visit } from './fixtures';
import { designs } from './design-manifest';

for (const framework of ['vue', 'react']) for (const design of ['default', ...designs]) for (const theme of ['light', 'dark']) {
  test(`${framework} ${design} ${theme} footer navigation groups`, async ({ page }) => {
    test.setTimeout(60000);
    for (const scenario of ['footer', 'footer-compact']) for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await visit(page, framework, scenario, theme, `&parity=1&design=${design}`);
      const groups = page.locator('[data-footer-group]');
      if (scenario === 'footer') {
        await expect(page.locator('.footer-product-groups [data-footer-group]')).toHaveCount(3);
        const boxes = await groups.evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect()));
        expect(new Set(boxes.map(b => b.x)).size).toBe(1);
        expect(boxes[1].top).toBeGreaterThan(boxes[0].bottom);
        if (width === 1280) {
          const positions = await page.locator('.footer-brand, .footer-cols, .footer-container > .footer-extra').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().top));
          expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(1);
        }
      }
      await expect(groups.locator('.platform-brand')).toHaveCSS('color', theme === 'dark' ? 'rgb(177, 166, 237)' : 'rgb(107, 95, 192)');
      await expect(groups.locator('.replichai-brand')).toHaveCSS('color', theme === 'dark' ? 'rgb(120, 177, 237)' : 'rgb(35, 105, 189)');
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
          await expect(links.nth(i)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
          await links.nth(i).focus();
          await expect(links.nth(i)).toHaveCSS('outline-style', 'solid');
          await links.nth(i).blur();
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await expect(page.locator('.site-footer')).not.toContainText(/Topos|Cella|Lux/);
      await expect(page.locator('.footer-seg-btn')).toHaveCount(3);
      const offsets = await page.locator('.footer-seg-btn').evaluateAll(buttons => buttons.map(button => {
        const b = button.getBoundingClientRect(), icon = button.querySelector('svg')!.getBoundingClientRect();
        return Math.max(Math.abs(b.x + b.width / 2 - icon.x - icon.width / 2), Math.abs(b.y + b.height / 2 - icon.y - icon.height / 2));
      }));
      expect(Math.max(...offsets)).toBeLessThan(1);
      await expect(page.locator('.footer-lang-select')).toHaveCSS('padding-top', '0px');
      await expect(page.locator('.footer-lang-select')).toHaveCSS('padding-bottom', '0px');
      await expect(page.locator('.footer-lang-select')).toBeVisible();
    }
  });
}
