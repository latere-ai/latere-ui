import { test, expect, visit } from './fixtures';

const recipes = {
  replichai: { font: 'Inter', radius: '18px', field: '8px', button: '30px', text: '14px', accent: ['rgb(35, 105, 189)', 'rgb(111, 163, 230)'] },
  wallfacer: { font: 'Inter', radius: '14px', field: '10px', button: '30px', text: '13px', accent: ['rgb(196, 90, 51)', 'rgb(224, 122, 81)'] },
  origo: { font: 'IBM Plex Sans', radius: '4px', field: '4px', button: '30px', text: '13px', accent: ['rgb(74, 59, 122)', 'rgb(168, 151, 224)'] },
} as const;
for (const [design, recipe] of Object.entries(recipes)) {
  test(`${design} supplies opaque surfaces and its own geometry`, async ({ page }) => {
    await visit(page, 'vue', 'containers', 'light');
    await page.evaluate(value => { document.documentElement.dataset.design = value; }, design);
    const panel = page.locator('.lu-panel').first();
    await expect(panel).toHaveCSS('border-radius', recipe.radius);
    await expect(panel).toHaveCSS('backdrop-filter', 'none');
    await expect(panel).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(panel).toHaveCSS('font-family', new RegExp(recipe.font));
  });
}

for (const [design, recipe] of Object.entries(recipes)) for (const framework of ['vue', 'react']) for (const [mode, theme] of ['light', 'dark'].entries()) {
  test(`${design} ${framework} ${theme} action and input states`, async ({ page }) => {
    await visit(page, framework, 'buttons', theme, `&design=${design}`);
    const primary = page.getByRole('button', { name: 'primary', exact: true }).first();
    await expect(primary).toHaveCSS('min-height', recipe.button);
    await expect(primary).toHaveCSS('box-shadow', 'none');
    await primary.hover();
    const expectedHover = design === 'origo' ? ['rgb(58, 46, 96)', 'rgb(195, 182, 236)'][mode] : recipe.accent[mode];
    await expect(primary).toHaveCSS('background-color', expectedHover);
    const ratio = await primary.evaluate(el => {
      const css = getComputedStyle(el);
      function luminance(value: string) {
        const c = value.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
        return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
      }
      const [a, b] = [luminance(css.color), luminance(css.backgroundColor)].sort((a, b) => a - b);
      return (b + .05) / (a + .05);
    });
    expect(ratio, 'Hovered action text contrast').toBeGreaterThanOrEqual(4.5);
    const secondary = page.getByRole('button', { name: 'glass', exact: true }).first();
    await secondary.focus();
    await expect(secondary).toHaveCSS('outline-style', 'solid');
    await expect(secondary).toHaveCSS('outline-color', recipe.accent[mode]);
    await expect(page).toHaveScreenshot(`${design}-${framework}-buttons-states-${theme}.png`, { fullPage: true });

    await visit(page, framework, 'forms', theme, `&design=${design}`);
    const input = page.locator('.lu-field-control').first();
    await input.fill('Updated workspace');
    await expect(input).toHaveValue('Updated workspace');
    await expect(input).toHaveCSS('border-radius', recipe.field);
    await expect(input).toHaveCSS('border-top-color', recipe.accent[mode]);
    const check = page.locator('.lu-check-native').first();
    await page.locator('.lu-check').first().click();
    await expect(check).not.toBeChecked();
    await page.locator('.lu-check').first().click();
    await expect(check).toBeChecked();
    await page.locator('.lu-seg-item').nth(1).click();
    await expect(page.locator('.lu-seg-item').nth(1)).toHaveAttribute('aria-checked', 'true');
  });

  test(`${design} ${framework} ${theme} portaled dialog and live theme`, async ({ page }) => {
    await visit(page, framework, 'modal', theme, `&design=${design}`);
    const trigger = page.getByRole('button', { name: 'Open modal', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveCSS('backdrop-filter', 'none');
    await expect(dialog).toHaveCSS('font-family', new RegExp(recipe.font));
    await expect(dialog).toHaveCSS('border-radius', design === 'origo' ? '4px' : '18px');
    const before = await dialog.evaluate(el => getComputedStyle(el).backgroundImage + getComputedStyle(el).backgroundColor);
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme === 'light' ? 'dark' : 'light');
    await expect.poll(() => dialog.evaluate(el => getComputedStyle(el).backgroundImage + getComputedStyle(el).backgroundColor)).not.toBe(before);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}

for (const design of Object.keys(recipes)) test(`${design} preserves touch targets and restores the default`, async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, 'vue', 'buttons', 'light', `&design=${design}`);
  for (const button of await page.locator('.lu-btn, .lu-iconbtn').all()) {
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await page.evaluate(() => { delete document.documentElement.dataset.design; });
  await expect(page.locator('.lu-btn-primary').first()).toHaveCSS('backdrop-filter', 'blur(20px) saturate(1.8)');
});

for (const design of Object.keys(recipes)) for (const [framework, scenario, selector] of [
  ['vue', 'account', '.lu-am-dd'], ['react', 'account', '.lu-am-dd'], ['vue', 'products', '.lu-ps-panel'],
] as const) test(`${design} ${framework} ${scenario} menu uses matte material`, async ({ page }) => {
  await visit(page, framework, scenario, 'light', `&design=${design}`);
  if (scenario === 'products') await page.locator('.lu-iconbtn').first().click();
  else await page.locator('.lu-am-trigger').first().click();
  await expect(page.locator(selector)).toHaveCSS('backdrop-filter', 'none');
});
test('origo preferences and code use repository geometry and typography', async ({ page }) => {
  await visit(page, 'vue', 'preferences', 'light', '&design=origo');
  await expect(page.locator('.lu-ap-pill').first()).toHaveCSS('border-radius', '3px');
  await visit(page, 'vue', 'docs', 'light', '&design=origo');
  await expect(page.locator('pre code')).toHaveCSS('font-family', /IBM Plex Mono/);
});

test('matte solid badges have no optical rim', async ({ page }) => {
  await visit(page, 'vue', 'feedback', 'light', '&design=origo');
  await expect(page.locator('.lu-badge.is-solid').first()).toHaveCSS('box-shadow', 'none');
  await expect(page.locator('.lu-badge').first()).toHaveCSS('border-radius', '3px');
});
