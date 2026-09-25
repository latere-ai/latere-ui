import { test, expect, visit } from './fixtures';
import { designs } from './design-manifest';

const COLUMNS = [
  ['https://wf.latere.ai/', 'https://lectio.latere.ai/'],
  ['https://replichai.latere.ai/'],
  ['https://platform.latere.ai/console', 'https://auth.latere.ai/'],
  ['/about', '/blog/why-latere', '/blog', '/open-source', 'mailto:contact@latere.ai'],
  ['/legal/privacy', '/legal/terms', '/legal/impressum'],
];

for (const framework of ['vue', 'react']) for (const design of ['default', ...designs]) for (const theme of ['light', 'dark']) {
  test(`${framework} ${design} ${theme} footer columns and lead`, async ({ page }) => {
    test.setTimeout(60000);
    for (const width of [320, 390, 768, 1280]) await test.step(`${width}px`, async () => {
      await page.setViewportSize({ width, height: 900 });
      await visit(page, framework, 'footer', theme, `&parity=1&design=${design}`);
      const groups = page.locator('.footer-cols [data-footer-group]');
      await expect(groups).toHaveCount(5);
      await expect(page.locator('.footer-cols > .footer-col')).toHaveCount(4);
      await expect(groups.locator('h2')).toHaveText(['Applications', 'Research', 'Platform', 'Company', 'Legal']);
      for (const [index, hrefs] of COLUMNS.entries()) {
        const links = groups.nth(index).locator('a');
        await expect(links).toHaveCount(hrefs.length);
        for (const [i, href] of hrefs.entries()) {
          const actual = await links.nth(i).getAttribute('href');
          expect(actual!.endsWith(href), `${actual} ends with ${href}`).toBe(true);
          await expect(links.nth(i)).toBeVisible();
        }
      }

      // Headings are quiet and regular weight; links sit 32px apart.
      const heading = groups.first().locator('h2');
      await expect(heading).toHaveCSS('font-weight', '400');
      const pitch = await page.locator('[data-footer-group="company"] li').evaluateAll(items => items.map(item => item.getBoundingClientRect().top));
      for (let i = 1; i < pitch.length; i++) expect.soft(pitch[i] - pitch[i - 1]).toBeCloseTo(32, 0);

      const box = async (selector: string) => (await page.locator(selector).boundingBox())!;
      const lead = await box('.footer-lead');
      const columns = await box('.footer-cols');
      const lefts = new Set(await page.locator('.footer-cols > .footer-col').evaluateAll(cols => cols.map(col => Math.round(col.getBoundingClientRect().left))));
      if (width > 1024) {
        // The lead on the left, four columns on the right, tops aligned.
        expect(lead.x + lead.width).toBeLessThanOrEqual(columns.x);
        expect(Math.abs(lead.y - columns.y)).toBeLessThan(1);
        expect(lefts.size).toBe(4);
      } else if (width > 640) {
        expect(lead.y + lead.height).toBeLessThanOrEqual(columns.y);
        expect(lefts.size).toBe(4);
      } else {
        // Phone: the columns two up, then the lead, then the copyright.
        expect(lefts.size).toBe(2);
        expect(columns.y + columns.height).toBeLessThanOrEqual(lead.y);
      }
      expect((await box('.footer-bottom')).y).toBeGreaterThanOrEqual(Math.max(lead.y + lead.height, columns.y + columns.height));

      // The lead: lockup, socials, a short hairline, then the two menus.
      await expect(page.locator('.footer-lead > *')).toHaveClass(['footer-lockup', 'footer-social', 'footer-rule', 'footer-prefs']);
      await expect(page.locator('.footer-lead .lu-pref-trigger')).toHaveCount(2);
      const offsets = await page.locator('.footer-lead .lu-pref-trigger').evaluateAll(buttons => buttons.map(button => {
        const b = button.getBoundingClientRect(), icon = button.querySelector('svg')!.getBoundingClientRect();
        return Math.max(Math.abs(b.x + b.width / 2 - icon.x - icon.width / 2), Math.abs(b.y + b.height / 2 - icon.y - icon.height / 2));
      }));
      expect(Math.max(...offsets)).toBeLessThan(1);
      // Glyphs line up with the lockup's left edge.
      const lockup = await box('.footer-lockup');
      const firstGlyph = (await page.locator('.footer-lead .lu-pref-icon').first().boundingBox())!;
      expect(Math.abs(firstGlyph.x - lockup.x)).toBeLessThanOrEqual(1);

      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await expect(page.locator('.site-footer')).not.toContainText(/Topos|Cella|Lux/);
    });
  });

  test(`${framework} ${design} ${theme} footer links: plain at rest, product gradient under pointer and focus`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await visit(page, framework, 'footer', theme, `&parity=1&design=${design}`);
    const links = page.locator('.footer-cols a.footer-link');
    const rest = await links.first().evaluate(el => getComputedStyle(el).color);
    for (const link of await links.all()) {
      await expect(link).toHaveCSS('text-decoration-line', 'none');
      await expect(link).toHaveCSS('background-image', 'none');
      await expect(link).toHaveCSS('font-style', 'normal');
      await expect(link).toHaveCSS('color', rest);
    }
    for (const slug of ['wallfacer', 'lectio', 'replichai', 'platform']) {
      const link = page.locator(`.footer-link[data-brand="${slug}"]`);
      await link.hover();
      await expect(link).toHaveCSS('background-image', /linear-gradient/);
      await expect(link).toHaveCSS('-webkit-text-fill-color', 'rgba(0, 0, 0, 0)');
      await expect(link).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await page.mouse.move(0, 0);
      await expect(link).toHaveCSS('background-image', 'none');
      await link.focus();
      await expect(link).toHaveCSS('outline-style', 'solid');
      await link.blur();
    }
    const plain = page.getByRole('link', { name: 'Identity', exact: true });
    await plain.hover();
    await expect(plain).toHaveCSS('background-image', 'none');
    expect(await plain.evaluate(el => getComputedStyle(el).color)).not.toBe(rest);
  });

  test(`${framework} ${design} ${theme} compact footer keeps the product groups`, async ({ page }) => {
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await visit(page, framework, 'footer-compact', theme, `&parity=1&design=${design}`);
      const groups = page.locator('[data-footer-group]');
      await expect(groups).toHaveCount(3);
      await expect(groups.locator('.footer-group-title')).toHaveText(['Applications', 'Research', 'Platform']);
      for (const [index, hrefs] of COLUMNS.slice(0, 3).entries()) {
        const links = groups.nth(index).locator('a');
        await expect(links).toHaveCount(hrefs.length);
        for (const [i, href] of hrefs.entries()) await expect(links.nth(i)).toHaveAttribute('href', href);
      }
      // The platform wordmark is the ink; research keeps its blue.
      await expect(groups.locator('.platform-brand')).toHaveCSS('background-image', theme === 'dark' ? /rgb\(250, 250, 250\)/ : /rgb\(10, 10, 10\)/);
      await expect(groups.locator('.replichai-brand')).toHaveCSS('color', theme === 'dark' ? 'rgb(120, 177, 237)' : 'rgb(35, 105, 189)');
      await expect(page.locator('.site-footer-compact .lu-pref-trigger')).toHaveCount(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    }
  });
}
