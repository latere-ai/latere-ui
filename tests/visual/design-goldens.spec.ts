import { goldenTest as test, expect, visit, prepare, sheenInteraction } from './fixtures';
import { scenarios, mobileScenarios } from './manifest';
import { designs, designMobileScenarios } from './design-manifest';
import { captureExact } from './exact-golden';

for (const design of ['default', ...designs]) for (const [scenario, components] of Object.entries(scenarios)) {
  const mobile = (design === 'default' ? mobileScenarios : designMobileScenarios).has(scenario);
  for (const theme of ['light', 'dark']) for (const layout of mobile ? ['desktop', 'mobile'] : ['desktop']) {
    test(`figure ${design} ${scenario} ${theme} ${layout}`, async ({ page }) => {
      test.setTimeout(60000);
      await page.setViewportSize(layout === 'mobile' ? { width: 390, height: 844 }
        : { width: design === 'default' && scenario !== 'docs' ? 1100 : 1280, height: 850 });
      await visit(page, scenario, theme, `&parity=1${design === 'default' ? '' : `&design=${design}`}`);
      await prepare(page, scenario);
      for (const name of components) await expect(page.locator(`[data-component="${name}"]`).first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page overflow').toBe(true);
      const capture = await captureExact(page, { fullPage: true,
        interaction: scenario === 'effects' && design === 'default' ? sheenInteraction(page) : undefined });
      await expect(capture).toMatchGolden(`${design === 'default' ? '' : design + '-'}${scenario}-${theme}-${layout}.png`);
    });
  }
}
