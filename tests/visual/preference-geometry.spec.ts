import { test, expect, visit, prepare } from './fixtures';
import { designs } from './design-manifest';

for (const hasTouch of [false, true]) test.describe(hasTouch ? 'touch' : 'pointer', () => {
  test.use({ hasTouch });
  for (const framework of ['vue', 'react']) for (const design of ['default', ...designs]) {
    for (const theme of ['light', 'dark']) {
      test(`${framework} ${design} ${theme} preference controls share geometry`, async ({ page }) => {
        test.setTimeout(60000);
        for (const width of [320, 1280]) for (const scenario of ['footer', 'footer-compact']) {
          await test.step(`${scenario} at ${width}px`, async () => {
            await page.setViewportSize({ width, height: 900 });
            await visit(page, framework, scenario, theme, `&parity=1&design=${design}`);
            expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(hasTouch);

            const assertGeometry = async () => {
              const group = (await page.locator('.footer-seg').boundingBox())!;
              const language = (await page.locator('.footer-lang-select').boundingBox())!;
              expect.soft(group.height, 'Theme selector outer height').toBe(hasTouch ? 50 : 28);
              expect.soft(language.height, 'Language and theme outer heights').toBe(group.height);
              expect.soft(language.y, 'Top edges align').toBe(group.y);
              expect.soft(language.y + language.height, 'Bottom edges align').toBe(group.y + group.height);
              for (const button of await page.locator('.footer-seg-btn').all()) {
                const box = (await button.boundingBox())!;
                expect.soft(box.height, 'Selected and unselected segments share the inset').toBe(group.height - 6);
                expect.soft(box.y).toBe(group.y + 3);
                if (hasTouch) expect.soft(box.width).toBeGreaterThanOrEqual(44);
              }
              expect.soft(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
            };
            await assertGeometry();
            await page.locator('.footer-seg-btn').nth(1).click();
            await expect(page.locator('.footer-seg-btn').nth(1)).toHaveClass(/is-active/);
            await page.locator('.footer-lang-select').selectOption('de');
            await expect(page.locator('.footer-lang-select')).toHaveValue('de');
            await assertGeometry();
          });
        }

        // The other preference entry points use shared pills rather than the
        // footer's segmented control/select pair; guard their equality as well.
        if (!hasTouch) for (const scenario of ['preferences', 'account']) {
          await test.step(scenario, async () => {
            await visit(page, framework, scenario, theme, `&parity=1&design=${design}`);
            await prepare(page, framework, scenario);
            const groups = page.locator('.lu-ap-row');
            await expect(groups).toHaveCount(2);
            for (const group of await groups.all()) {
              const buttons = group.getByRole('button');
              expect(await buttons.count()).toBeGreaterThan(1);
              for (const button of await buttons.all()) await expect(button).toHaveCSS('height', '24px');
            }
          });
        }
      });
    }
  }
});
