import { test, expect, visit } from './fixtures';
import { designs } from './design-manifest';

for (const framework of ['vue', 'react']) for (const design of ['default', ...designs]) {
  for (const theme of ['light', 'dark']) {
    test(`${framework} ${design} ${theme} selected segments retain rounded corners`, async ({ page }) => {
      for (const scenario of ['footer', 'footer-compact', 'forms']) await test.step(scenario, async () => {
        await visit(page, framework, scenario, theme, `&parity=1&design=${design}`);
        const footer = scenario.startsWith('footer');
        const segments = page.locator(footer ? '.footer-seg-btn' : '.lu-seg-item');
        await expect(segments).toHaveCount(3);
        // Exercise both end segments and the middle segment: a bright fill
        // must retain visible corners wherever selection moves.
        for (const segment of await segments.all()) {
          await segment.click();
          await expect(segment).toHaveClass(/is-active/);
          const geometry = await segment.evaluate(element => {
            const inner = getComputedStyle(element);
            const outer = getComputedStyle(element.parentElement!);
            return {
              corners: [inner.borderTopLeftRadius, inner.borderTopRightRadius,
                inner.borderBottomLeftRadius, inner.borderBottomRightRadius].map(parseFloat),
              outer: parseFloat(outer.borderTopLeftRadius),
              inset: parseFloat(outer.paddingTop) + parseFloat(outer.borderTopWidth),
            };
          });
          for (const radius of geometry.corners) expect.soft(radius, 'The selected fill needs a visible radius').toBeGreaterThanOrEqual(3);
          if (design === 'origo') {
            expect.soft(geometry.corners).toEqual([3, 3, 3, 3]);
            expect.soft(geometry.outer, 'Outer corners include the actual border and padding inset').toBe(3 + geometry.inset);
          }
        }
        if (footer) {
          const radius = await page.locator('.footer-seg').evaluate(element => getComputedStyle(element).borderRadius);
          await expect(page.locator('.footer-lang-select')).toHaveCSS('border-radius', radius);
        }
      });
    });
  }
}
