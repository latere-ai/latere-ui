import { test, expect, visit } from './fixtures';
test.use({ actionTimeout: 3000 });
test.setTimeout(10000);

for (const framework of ['vue', 'react']) for (const theme of ['light', 'dark']) {
  for (const width of [320, 390, 768, 1100]) test(`${framework} ${theme} footer exposes every link at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await visit(page, framework, 'footer-compact', theme);
    const nav = page.locator('.footer-compact-links');
    const layout = await nav.evaluate(el => {
      const box = el.getBoundingClientRect();
      return { overflow: el.scrollWidth - el.clientWidth, clipped: [...el.children].filter(child => {
        const rect = child.getBoundingClientRect();
        return rect.left < box.left - 1 || rect.right > box.right + 1 || rect.bottom > box.bottom + 1;
      }).map(el => el.textContent) };
    });
    expect.soft(layout.overflow).toBeLessThanOrEqual(1);
    expect.soft(layout.clipped).toEqual([]);
    await expect(nav.getByRole('link', { name: 'Identity', exact: true })).toBeInViewport();
    for (const link of await nav.locator('a').all()) {
      await expect.soft(link).toHaveCSS('text-decoration-line', 'none');
      expect.soft(await link.evaluate(el => getComputedStyle(el, '::after').content)).toBe('none');
    }
    const themeTrigger = page.locator('.lu-theme-menu .lu-pref-trigger');
    const languageTrigger = page.locator('.lu-locale-menu .lu-pref-trigger');
    const themeBox = (await themeTrigger.boundingBox())!, languageBox = (await languageTrigger.boundingBox())!;
    expect.soft(themeBox.height).toBe(32);
    expect.soft(themeBox.width).toBe(32);
    expect.soft(languageBox.height).toBe(themeBox.height);
    expect.soft(languageBox.y).toBe(themeBox.y);
    await themeTrigger.click();
    await page.getByRole('menuitemradio', { name: 'Dark' }).click();
    await expect(themeTrigger).toHaveAttribute('aria-label', 'Theme: Dark');
    await expect(themeTrigger).toBeFocused();
    await languageTrigger.click();
    await page.getByRole('menuitemradio', { name: 'Deutsch' }).click();
    await expect(languageTrigger).toHaveAttribute('aria-label', 'Sprache: Deutsch');
    // The menus open upward from the bar and stay inside the viewport.
    await expect(page.locator('.lu-locale-menu .lu-pop-panel')).toHaveCount(0);
    await themeTrigger.click();
    const panel = (await page.locator('.lu-theme-menu .lu-pop-panel').boundingBox())!;
    expect.soft(panel.y + panel.height).toBeLessThanOrEqual((await themeTrigger.boundingBox())!.y);
    expect.soft(panel.x).toBeGreaterThanOrEqual(0);
    expect.soft(panel.x + panel.width).toBeLessThanOrEqual(width);
    await page.keyboard.press('Escape');
  });
  test(`${framework} ${theme} sibling containers and nested toolbar corners align`, async ({ page }) => {
    await visit(page, framework, 'containers', theme);
    const radius = await page.locator('.lu-panel').first().evaluate(el => getComputedStyle(el).borderTopLeftRadius);
    await expect(page.locator('.lu-bar')).toHaveCSS('border-radius', radius);
    await expect(page.locator('.lu-table-wrap')).toHaveCSS('border-radius', radius);
    for (const button of await page.locator('.lu-bar .lu-btn').all()) {
      const geometry = await button.evaluate(el => {
        const bar = getComputedStyle(el.closest('.lu-bar')!);
        return { outer: parseFloat(bar.borderTopLeftRadius), inset: parseFloat(bar.paddingTop), inner: parseFloat(getComputedStyle(el).borderTopLeftRadius) };
      });
      expect(geometry.inner + geometry.inset).toBe(geometry.outer);
    }
  });
}

// Host-selected geometry must survive the shared defaults: reading UI, dense
// operator UI, and the very small corners used by repository browsers.
for (const [style, radius, inset] of [['reading', 12, 4], ['operator', 14, 6], ['repository', 4, 2]] as const) {
  test(`${style} host tokens preserve sibling and nested geometry`, async ({ page }) => {
    await visit(page, 'vue', 'containers');
    await page.evaluate(({ radius, inset }) => {
      document.documentElement.style.setProperty('--radius-lg', `${radius}px`);
      document.documentElement.style.setProperty('--space-1-5', `${inset}px`);
    }, { radius, inset });
    for (const selector of ['.lu-bar', '.lu-panel', '.lu-table-wrap']) {
      for (const element of await page.locator(selector).all()) await expect(element).toHaveCSS('border-radius', `${radius}px`);
    }
    for (const button of await page.locator('.lu-bar .lu-btn').all()) await expect(button).toHaveCSS('border-radius', `${radius - inset}px`);
    await visit(page, 'vue', 'sidebar');
    await page.evaluate(() => document.documentElement.style.setProperty('--font-ui', 'monospace'));
    await expect(page.locator('.lu-cs-brand-name')).toHaveCSS('font-family', 'monospace');
  });
}

test('compact and full footers preserve touch target size', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await visit(page, 'vue', 'footer-compact');
    for (const control of await page.locator('.lu-pref-trigger, .footer-compact-links a').all()) {
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    await visit(page, 'vue', 'footer');
    for (const control of await page.locator('.lu-pref-trigger, .footer-social a').all()) {
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  } finally { await context.close(); }
});
