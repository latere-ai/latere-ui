import { test, expect, visit, prepare } from './fixtures';
import { designs, designScenarios, designMobileScenarios } from './design-manifest';

for (const design of designs) for (const [framework, sheets] of Object.entries(designScenarios)) {
  for (const [scenario, components] of Object.entries(sheets)) for (const theme of ['light', 'dark']) {
    for (const layout of designMobileScenarios.has(scenario) ? ['desktop', 'mobile'] : ['desktop']) {
      test(`${design} ${framework} ${scenario} ${theme} ${layout}`, async ({ page }) => {
        await page.setViewportSize(layout === 'mobile' ? { width: 390, height: 844 } : { width: 1280, height: 850 });
        await visit(page, framework, scenario, theme, `&design=${design}`);
        await expect(page.locator('html')).toHaveAttribute('data-design', design);
        await prepare(page, framework, scenario);
        for (const name of components) await expect(page.locator(`[data-component="${name}"]`).first()).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No page overflow').toBe(true);
        await expect(page).toHaveScreenshot(`${design}-${framework}-${scenario}-${theme}-${layout}.png`, { fullPage: true });
      });
    }
  }
}
