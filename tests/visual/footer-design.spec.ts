import { test, expect, visit } from './fixtures';

function ratio(a: number[], b: number[]) {
  const luminance = (rgb: number[]) => rgb.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}

for (const framework of ['vue', 'react']) for (const theme of ['light', 'dark']) {
  test(`${framework} ${theme} footer labels and controls have readable contrast`, async ({ page }) => {
    await visit(page, framework, 'footer', theme);
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g)!.map(Number));
    const over = (color: number[]) => color.slice(0, 3).map((v, i) => v * (color[3] ?? 1) + background[i] * (1 - (color[3] ?? 1)));
    // Resolve any computed color syntax, color-mix results included, to RGBA bytes.
    const samples = await page.locator('.footer-col-title, .footer-link, .footer-bottom p').evaluateAll(elements => elements.map(el => {
      const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
      context.fillStyle = getComputedStyle(el).color; context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return { label: `${el.className}: ${el.textContent}`, color: [r, g, b, a / 255] };
    }));
    expect(samples.length).toBeGreaterThan(15);
    for (const sample of samples) expect.soft(ratio(over(sample.color), background), sample.label).toBeGreaterThanOrEqual(4.5);
    // Icon glyphs are graphics: 3:1 against the page.
    const glyphs = await page.locator('.footer-social a, .lu-pref-trigger').evaluateAll(elements => elements.map(el => ({
      label: el.getAttribute('aria-label')!, color: getComputedStyle(el).color.match(/[\d.]+/g)!.map(Number),
    })));
    expect(glyphs).toHaveLength(6);
    for (const glyph of glyphs) expect.soft(ratio(over(glyph.color), background), glyph.label).toBeGreaterThanOrEqual(3);
  });

  test(`${framework} ${theme} footer menus read on a solid surface`, async ({ page }) => {
    await visit(page, framework, 'footer', theme);
    for (const menu of ['.lu-theme-menu', '.lu-locale-menu']) {
      await page.locator(`${menu} .lu-pref-trigger`).click();
      const panel = page.locator(`${menu} .lu-pop-panel`);
      await expect(panel).toHaveCSS('backdrop-filter', 'none');
      const surface = await panel.evaluate(el => {
        const css = getComputedStyle(el);
        return { background: css.backgroundColor.match(/[\d.]+/g)!.map(Number), shadow: css.boxShadow, border: css.borderTopWidth };
      });
      expect(surface.background[3] ?? 1, 'opaque surface').toBe(1);
      expect(surface.shadow).not.toBe('none');
      expect(surface.border).toBe('1px');
      for (const row of await panel.getByRole('menuitemradio').all()) {
        const color = await row.evaluate(el => getComputedStyle(el).color.match(/[\d.]+/g)!.map(Number));
        expect.soft(ratio(color, surface.background), await row.innerText()).toBeGreaterThanOrEqual(4.5);
        expect.soft(Math.round((await row.boundingBox())!.height)).toBe(32);
      }
      await page.keyboard.press('Escape');
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

  test(`${framework} ${theme} product gradients stay legible`, async ({ page }) => {
    // Every stop of every product gradient, at rest in the compact strip and
    // under the pointer in the full footer's columns.
    const stops = async (selector: string) => page.locator(selector).evaluateAll(elements => elements.map(el => ({
      name: el.textContent, gradient: getComputedStyle(el).backgroundImage, color: getComputedStyle(el).color,
      background: getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g)!.map(Number),
    })));
    await visit(page, framework, 'footer-compact', theme);
    const wordmarks = await stops('.footer-compact-links [class$="-brand"]');
    expect(wordmarks.map(b => b.name)).toEqual(['Wallfacer', 'Lectio', 'ReplicHAI', 'Latere Platform']);
    await visit(page, framework, 'footer', theme);
    const hovered = [];
    for (const link of await page.locator('.footer-link[data-brand]').all()) {
      await link.hover();
      hovered.push(...await link.evaluate(el => [{
        name: el.textContent, gradient: getComputedStyle(el).backgroundImage, color: getComputedStyle(el).color,
        background: getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g)!.map(Number),
      }]));
    }
    expect(hovered.map(b => b.name)).toEqual(['Wallfacer', 'Lectio', 'ReplicHAI', 'Latere Platform']);
    for (const brand of [...wordmarks, ...hovered]) {
      const colors = brand.gradient === 'none' ? [brand.color] : brand.gradient.match(/rgb\([^)]+\)/g)!;
      for (const color of colors) expect.soft(ratio(color.match(/[\d.]+/g)!.map(Number), brand.background), `${brand.name}: ${color}`).toBeGreaterThanOrEqual(4.5);
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
