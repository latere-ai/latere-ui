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

            const themeTrigger = page.locator('.lu-theme-menu .lu-pref-trigger');
            const languageTrigger = page.locator('.lu-locale-menu .lu-pref-trigger');
            const assertGeometry = async () => {
              const a = (await themeTrigger.boundingBox())!, b = (await languageTrigger.boundingBox())!;
              const size = hasTouch ? 44 : 32;
              expect.soft([a.width, a.height], 'Theme trigger size').toEqual([size, size]);
              expect.soft([b.width, b.height], 'Language trigger size').toEqual([size, size]);
              expect.soft(b.y, 'Top edges align').toBe(a.y);
              for (const trigger of [themeTrigger, languageTrigger]) {
                const offset = await trigger.evaluate(button => {
                  const box = button.getBoundingClientRect(), icon = button.querySelector('svg')!.getBoundingClientRect();
                  return { x: box.x + box.width / 2 - icon.x - icon.width / 2, y: box.y + box.height / 2 - icon.y - icon.height / 2, size: [icon.width, icon.height] };
                });
                expect.soft(Math.abs(offset.x) + Math.abs(offset.y), 'Glyph centered').toBeLessThan(1);
                expect.soft(offset.size, '16px glyph').toEqual([16, 16]);
              }
              expect.soft(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
            };
            await assertGeometry();
            // The open menu: 32px rows, a 16px check column, and a panel corner
            // concentric with its rows (row radius plus panel padding).
            await themeTrigger.click();
            const panel = page.locator('.lu-theme-menu .lu-pop-panel');
            const rows = panel.getByRole('menuitemradio');
            await expect(rows).toHaveCount(3);
            const menu = await panel.evaluate(el => {
              const css = getComputedStyle(el), row = el.querySelector<HTMLElement>('[role="menuitemradio"]')!;
              const labels = [...el.querySelectorAll('[role="menuitemradio"]')].map(item => {
                const range = document.createRange(); range.selectNodeContents(item.lastChild!);
                return range.getBoundingClientRect().left;
              });
              return { outer: parseFloat(css.borderTopLeftRadius), inset: parseFloat(css.paddingTop), inner: parseFloat(getComputedStyle(row).borderTopLeftRadius), labels, check: [...el.querySelectorAll('.lu-menu-check')].map(check => check.getBoundingClientRect().width) };
            });
            if (!(hasTouch && design === 'origo')) for (const row of await rows.all()) expect.soft(Math.round((await row.boundingBox())!.height), 'Row height').toBeGreaterThanOrEqual(32);
            expect.soft(menu.outer, 'Concentric corners').toBe(menu.inner + menu.inset);
            expect.soft(new Set(menu.labels).size, 'Labels share one x').toBe(1);
            expect.soft(menu.check).toEqual([16, 16, 16]);
            await rows.nth(1).click();
            await expect(themeTrigger).toHaveAttribute('aria-label', /Dark$/);
            await languageTrigger.click();
            await page.locator('.lu-locale-menu').getByRole('menuitemradio', { name: 'Deutsch' }).click();
            await expect(languageTrigger).toHaveAttribute('aria-label', 'Sprache: Deutsch');
            await assertGeometry();
          });
        }

        // The account preferences use shared pills rather than the footer's
        // menus; guard their equality as well.
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
