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
    const group = await page.locator('.footer-seg').boundingBox();
    const language = await page.locator('.footer-lang-select').boundingBox();
    expect.soft(group!.height).toBe(28);
    expect.soft(language!.height).toBe(group!.height);
    expect.soft(language!.y).toBe(group!.y);
    expect.soft(group!.width).toBeLessThanOrEqual(100);
    await page.locator('.footer-seg-btn').nth(1).click();
    await expect(page.locator('.footer-seg-btn').nth(1)).toHaveClass(/is-active/);
    await page.locator('.footer-lang-select').selectOption('de');
    await expect(page.locator('.footer-lang-select')).toHaveValue('de');
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

test('compact footer preserves touch target size', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await visit(page, 'vue', 'footer-compact');
    for (const control of await page.locator('.footer-seg-btn, .footer-lang-select, .footer-compact-links a').all()) {
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  } finally { await context.close(); }
});
