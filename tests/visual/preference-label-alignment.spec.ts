import { test, expect, visit, prepare } from './fixtures';
import { designs } from './design-manifest';

for (const framework of ['vue', 'react']) for (const design of ['default', ...designs]) {
  for (const theme of ['light', 'dark']) test(`${framework} ${design} ${theme} preference labels are optically centered`, async ({ page }) => {
    test.setTimeout(60000);
    for (const scenario of ['preferences', 'account']) {
      await visit(page, framework, scenario, theme, `&parity=1&design=${design}`);
      await prepare(page, framework, scenario);
      for (const button of await page.locator('.lu-ap-pill').all()) {
        for (const select of [false, true]) {
          if (select) await button.click();
          const geometry = await button.evaluate(element => {
            const label = element.querySelector('.lu-ap-pill-label') ?? element;
            // A zero-size inline marker exposes the actual alphabetic baseline.
            const marker = document.createElement('span');
            marker.style.cssText = 'display:inline-block;width:0;height:0';
            label.append(marker);
            const baseline = marker.getBoundingClientRect().y;
            marker.remove();
            const css = getComputedStyle(label);
            const context = document.createElement('canvas').getContext('2d')!;
            context.font = css.font;
            const capHeight = context.measureText('H').actualBoundingBoxAscent;
            const box = element.getBoundingClientRect();
            return { offset: baseline - capHeight / 2 - box.y - box.height / 2,
              height: box.height, text: element.textContent };
          });
          // CSS layout rounds font metrics to 1/64px; this is geometry, not a
          // screenshot tolerance. Committed figures still require exact pixels.
          expect.soft(Math.abs(geometry.offset), `${scenario}: ${geometry.text}`).toBeLessThan(0.05);
          expect.soft(geometry.height).toBe(24);
          if (select) await expect(button).toHaveAttribute('aria-pressed', 'true');
        }
      }
    }
  });
}
