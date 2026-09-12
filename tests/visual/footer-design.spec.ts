import { test, expect, visit } from './fixtures';

function ratio(a: number[], b: number[]) {
  const luminance = (rgb: number[]) => rgb.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}

for (const framework of ['vue', 'react']) for (const theme of ['light', 'dark']) {
  test(`${framework} ${theme} footer labels and controls have readable contrast`, async ({ page }) => {
    await visit(page, framework, 'footer', theme);
    const samples = await page.locator('.footer-tagline, .footer-col-title, .footer-lang-select, .footer-seg-btn:not(.is-active), .footer-bottom p').evaluateAll(elements => elements.map(el => {
      const cs = getComputedStyle(el);
      return { label: el.className, color: cs.color.match(/[\d.]+/g)!.map(Number), bg: getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g)!.map(Number) };
    }));
    for (const sample of samples) expect.soft(ratio(sample.color, sample.bg), sample.label).toBeGreaterThanOrEqual(4.5);
    for (const selector of ['.footer-seg', '.footer-lang-select']) {
      const colors = await page.locator(selector).evaluate(el => {
        const cs = getComputedStyle(el), background = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g)!.map(Number);
        const border = cs.borderTopColor.match(/[\d.]+/g)!.map(Number);
        return { background, border: border.slice(0, 3).map((v, i) => v * (border[3] ?? 1) + background[i] * (1 - (border[3] ?? 1))) };
      });
      expect.soft(ratio(colors.border, colors.background), selector).toBeGreaterThanOrEqual(3);
    }
  });

  test(`${framework} ${theme} compact mobile footer gives navigation a full row`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, framework, 'footer-compact', theme);
    const layout = await page.locator('.site-footer-compact').evaluate(el => {
      const footer = el.getBoundingClientRect(), css = getComputedStyle(el);
      const links = el.querySelector('.footer-compact-links')!.getBoundingClientRect();
      const prefs = el.querySelector('.footer-extra')!.getBoundingClientRect();
      return { width: links.width, available: footer.width - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight), separate: links.bottom <= prefs.top || prefs.bottom <= links.top, overflow: document.documentElement.scrollWidth - innerWidth };
    });
    expect.soft(layout.width).toBeGreaterThanOrEqual(layout.available - 1);
    expect.soft(layout.separate).toBe(true);
    expect.soft(layout.overflow).toBeLessThanOrEqual(1);
    const last = page.locator('.footer-compact-links a').last();
    await last.focus();
    await expect(last).toBeInViewport();
  });

  test(`${framework} ${theme} product wordmarks stay legible as navigation`, async ({ page }) => {
    await visit(page, framework, 'footer', theme);
    const brands = await page.locator('.footer-col [class$="-brand"]').evaluateAll(elements => elements.map(el => ({
      name: el.textContent, gradient: getComputedStyle(el).backgroundImage,
      background: getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g)!.map(Number),
    })));
    expect(brands).toHaveLength(6);
    for (const brand of brands) for (const color of brand.gradient.match(/rgb\([^)]+\)/g) ?? []) {
      expect.soft(ratio(color.match(/[\d.]+/g)!.map(Number), brand.background), `${brand.name}: ${color}`).toBeGreaterThanOrEqual(4.5);
    }
  });
}

test('muted table labels remain readable on every base surface', async ({ page }) => {
  await visit(page, 'vue', 'containers');
  const colors = await page.locator('th').first().evaluate(el => {
    const css = getComputedStyle(document.documentElement);
    const rgb = (value: string) => {
      const probe = document.createElement('span'); probe.style.color = value; document.body.append(probe);
      const result = getComputedStyle(probe).color.match(/[\d.]+/g)!.map(Number); probe.remove(); return result;
    };
    return { text: rgb(getComputedStyle(el).color), surfaces: ['--bg', '--bg-surface', '--bg-raised'].map(name => rgb(css.getPropertyValue(name))) };
  });
  for (const surface of colors.surfaces) expect.soft(ratio(colors.text, surface)).toBeGreaterThanOrEqual(4.5);
});
for (const framework of ['vue', 'react']) for (const theme of ['light', 'dark']) test(`${framework} ${theme} table heading contrasts against its actual glass fill`, async ({ page }) => {
  await visit(page, framework, 'containers', theme);
  const colors = await page.locator('th').first().evaluate(el => {
    const rgba = (color: string) => color.match(/[\d.]+/g)!.map(Number);
    const ancestors: Element[] = [];
    for (let node: Element | null = el; node; node = node.parentElement) ancestors.unshift(node);
    const background = ancestors.reduce((back, node) => {
      const front = rgba(getComputedStyle(node).backgroundColor), alpha = front[3] ?? 1;
      return front.slice(0, 3).map((v, i) => v * alpha + back[i] * (1 - alpha));
    }, [255, 255, 255]);
    return { background, text: rgba(getComputedStyle(el).color) };
  });
  expect(ratio(colors.text, colors.background)).toBeGreaterThanOrEqual(4.5);
});
