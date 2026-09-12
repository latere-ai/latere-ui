import { test, expect, visit, prepare, setPreferences } from './fixtures';
import { scenarios, mobileScenarios } from './manifest';
for (const [framework, sheets] of Object.entries(scenarios)) {
  for (const [scenario, components] of Object.entries(sheets)) {
    for (const theme of ['light', 'dark']) {
      for (const layout of mobileScenarios.has(scenario) ? ['desktop', 'mobile'] : ['desktop']) {
        test(`${framework} ${scenario} ${theme} ${layout}`, async ({ page }) => {
          if (scenario === 'docs' && layout === 'desktop') await page.setViewportSize({ width: 1280, height: 850 });
          if (layout === 'mobile') await page.setViewportSize({ width: 390, height: 844 });
          await visit(page, framework, scenario, theme);
          await prepare(page, framework, scenario);
          for (const name of components) await expect(page.locator(`[data-component="${name}"]`).first()).toBeVisible();
          await expect(page).toHaveScreenshot(`${framework}-${scenario}-${theme}-${layout}.png`, { fullPage: true });
        });
      }
    }
  }
}
for (const theme of ['light', 'dark']) {
  for (const mode of ['reduced-motion', 'reduced-transparency', 'contrast'] as const) {
    test(`effects ${theme} ${mode}`, async ({ page }) => {
      if (mode === 'reduced-motion') await setPreferences(page, { motion: 'reduce' });
      if (mode === 'contrast') await setPreferences(page, { contrast: 'more' });
      if (mode === 'reduced-transparency') {
        await setPreferences(page, { transparency: 'reduce' });
      }
      await visit(page, 'vue', 'effects', theme);
      await page.locator('[data-lg-sheen]').hover({ position: { x: 150, y: 80 } });
      if (mode === 'reduced-motion') await expect(page.locator('[data-lg-sheen] > [aria-hidden]')).toHaveCount(0);
      if (mode === 'reduced-transparency') await expect(page.locator('[data-lg-refract]').nth(1)).toHaveCSS('backdrop-filter', 'none');
      await expect(page).toHaveScreenshot(`effects-${theme}-${mode}.png`, { fullPage: true });
    });
  }
  for (const state of ['hover', 'focus']) test(`buttons ${theme} ${state}`, async ({ page }) => {
    await visit(page, 'vue', 'buttons', theme);
    const button = page.getByRole('button', { name: 'glass', exact: true }).first();
    if (state === 'hover') await button.hover(); else await page.keyboard.press('Tab');
    await expect(page).toHaveScreenshot(`buttons-${theme}-${state}.png`, { fullPage: true });
  });
  for (const placement of ['bottom-end', 'top-start', 'top-end']) test(`popover ${theme} ${placement}`, async ({ page }) => {
    await visit(page, 'vue', 'popover', theme, `&placement=${placement}`);
    await prepare(page, 'vue', 'popover');
    await expect(page).toHaveScreenshot(`popover-${theme}-${placement}.png`);
  });
}

for (const theme of ['light', 'dark']) {
  for (const framework of ['vue', 'react']) {
    test(`${framework} nested modal ${theme}`, async ({ page }) => {
      await visit(page, framework, 'modal', theme);
      await prepare(page, framework, 'modal');
      await page.getByRole('button', { name: framework === 'vue' ? 'Open nested modal' : 'Create project', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(2);
      await expect(page).toHaveScreenshot(`${framework}-modal-nested-${theme}.png`);
    });
  }
  test(`react select open ${theme}`, async ({ page }) => {
    await visit(page, 'react', 'forms', theme);
    await page.getByRole('combobox', { name: 'Schedule', exact: true }).click();
    await expect(page).toHaveScreenshot(`react-select-open-${theme}.png`, { fullPage: true });
  });
  for (const state of ['filtered', 'empty', 'scrolled']) test(`palette ${state} ${theme}`, async ({ page }) => {
    await visit(page, 'vue', 'palette', theme);
    await prepare(page, 'vue', 'palette');
    if (state === 'scrolled') for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowDown');
    else await page.locator('.lu-cp-input').fill(state === 'empty' ? 'No such page' : 'Page 02');
    await expect(page).toHaveScreenshot(`palette-${state}-${theme}.png`);
  });
  test(`tooltip bottom ${theme}`, async ({ page }) => {
    await visit(page, 'vue', 'tooltip', theme);
    await page.getByRole('button', { name: 'Bottom tooltip' }).focus();
    await expect(page).toHaveScreenshot(`tooltip-bottom-${theme}.png`);
  });
  test(`account preferences and sign-out ${theme}`, async ({ page }) => {
    await visit(page, 'vue', 'account', theme);
    await prepare(page, 'vue', 'account');
    await page.getByRole('button', { name: /sign out|log out/i }).scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot(`account-scrolled-${theme}.png`);
  });
}

for (const theme of ['light', 'dark']) test(`tooltip reduced transparency ${theme}`, async ({ page }) => {
  await setPreferences(page, { transparency: 'reduce' });
  await visit(page, 'vue', 'tooltip', theme);
  await page.getByRole('button', { name: 'Top tooltip' }).focus();
  await expect(page).toHaveScreenshot(`tooltip-reduced-transparency-${theme}.png`);
});
