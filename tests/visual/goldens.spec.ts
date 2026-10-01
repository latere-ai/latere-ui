import { goldenTest as test, expect, visit, prepare, setPreferences, sheenInteraction, sampleSheen } from './fixtures';
for (const theme of ['light', 'dark']) {
  for (const mode of ['reduced-motion', 'reduced-transparency', 'contrast'] as const) {
    test(`effects ${theme} ${mode}`, async ({ page }) => {
      if (mode === 'reduced-motion') await setPreferences(page, { motion: 'reduce' });
      if (mode === 'contrast') await setPreferences(page, { contrast: 'more' });
      if (mode === 'reduced-transparency') {
        await setPreferences(page, { transparency: 'reduce' });
      }
      await visit(page, 'effects', theme, '&parity=1');
      await sampleSheen(page);
      if (mode === 'reduced-motion') await expect(page.locator('[data-lg-sheen] > [aria-hidden]')).toHaveCount(0);
      if (mode === 'reduced-transparency') await expect(page.locator('[data-lg-refract]').nth(1)).toHaveCSS('backdrop-filter', 'none');
      await expect(page).toMatchGolden(`effects-${theme}-${mode}.png`, { fullPage: true,
        interaction: mode === 'contrast' ? sheenInteraction(page) : undefined });
    });
  }
  for (const state of ['hover', 'focus']) test(`buttons ${theme} ${state}`, async ({ page }) => {
    await visit(page, 'buttons', theme, '&parity=1');
    const button = page.getByRole('button', { name: 'glass', exact: true }).first();
    if (state === 'hover') await button.hover(); else await page.keyboard.press('Tab');
    await expect(page).toMatchGolden(`buttons-${theme}-${state}.png`, { fullPage: true });
  });
  for (const placement of ['bottom-end', 'top-start', 'top-end']) test(`popover ${theme} ${placement}`, async ({ page }) => {
    await visit(page, 'popover', theme, `&parity=1&placement=${placement}`);
    await prepare(page, 'popover');
    await expect(page).toMatchGolden(`popover-${theme}-${placement}.png`);
  });
}

for (const theme of ['light', 'dark']) {
  test(`react nested modal ${theme}`, async ({ page }) => {
    await visit(page, 'modal', theme);
    await prepare(page, 'modal');
    await page.getByRole('button', { name: 'Create project', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(2);
    await expect(page).toMatchGolden(`react-modal-nested-${theme}.png`);
  });
  test(`react select open ${theme}`, async ({ page }) => {
    await visit(page, 'forms', theme);
    await page.getByRole('combobox', { name: 'Schedule', exact: true }).click();
    await expect(page).toMatchGolden(`react-select-open-${theme}.png`, { fullPage: true });
  });
  test(`react select filtered ${theme}`, async ({ page }) => {
    await visit(page, 'select', theme, '&parity=1');
    await prepare(page, 'select');
    await page.keyboard.type('2');
    await expect(page.getByRole('option')).toHaveText(['Workspace 02', 'Workspace 12', 'Workspace 20']);
    await expect(page).toMatchGolden(`react-select-filtered-${theme}.png`, { fullPage: true });
  });
  for (const state of ['filtered', 'empty', 'scrolled']) test(`palette ${state} ${theme}`, async ({ page }) => {
    await visit(page, 'palette', theme, '&parity=1');
    await prepare(page, 'palette');
    if (state === 'scrolled') for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowDown');
    else await page.locator('.lu-cp-input').fill(state === 'empty' ? 'No such page' : 'Page 02');
    await expect(page).toMatchGolden(`palette-${state}-${theme}.png`);
  });
  test(`tooltip bottom ${theme}`, async ({ page }) => {
    await visit(page, 'tooltip', theme, '&parity=1');
    await page.getByRole('button', { name: 'Bottom tooltip' }).focus();
    await expect(page).toMatchGolden(`tooltip-bottom-${theme}.png`);
  });
  test(`account preferences and sign-out ${theme}`, async ({ page }) => {
    await visit(page, 'account', theme, '&parity=1');
    await prepare(page, 'account');
    await page.getByRole('button', { name: /sign out|log out/i }).scrollIntoViewIfNeeded();
    await expect(page).toMatchGolden(`account-scrolled-${theme}.png`);
  });
}

for (const theme of ['light', 'dark']) test(`tooltip reduced transparency ${theme}`, async ({ page }) => {
  await setPreferences(page, { transparency: 'reduce' });
  await visit(page, 'tooltip', theme, '&parity=1');
  await page.getByRole('button', { name: 'Top tooltip' }).focus();
  await expect(page).toMatchGolden(`tooltip-reduced-transparency-${theme}.png`);
});

for (const theme of ['light', 'dark']) for (const [name, width, height] of [
  ['laptop', 1280, 720], ['laptop-large', 1470, 900], ['studio', 2560, 1440],
] as const) test(`workspace ${theme} ${name}`, async ({ page }) => {
  await page.setViewportSize({ width, height });
  await visit(page, 'workspace', theme, '&parity=1');
  await expect(page).toMatchGolden(`workspace-${theme}-${name}.png`, { fullPage: true });
});
