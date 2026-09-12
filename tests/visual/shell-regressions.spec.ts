import type { Locator } from '@playwright/test';
import { test, expect, visit, prepare, setPreferences } from './fixtures';

test.beforeEach(async ({ page }) => { await setPreferences(page, { motion: 'reduce' }); });

for (const scenario of ['modal', 'drawer-left', 'drawer-right']) {
  test(`${scenario} title uses the component padding without browser heading margins`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, 'vue', scenario);
    await prepare(page, 'vue', scenario);
    const kind = scenario === 'modal' ? 'modal' : 'drawer';
    const panel = page.locator(`.lu-${kind}`);
    const title = page.locator(`.lu-${kind}-title`);
    const heading = await title.boundingBox();
    const bounds = await panel.boundingBox();
    expect(heading!.y - bounds!.y, '18px header padding plus the material border').toBeLessThanOrEqual(20);
    await expect(title).toHaveCSS('margin-top', '0px');
    await expect(title).toHaveCSS('margin-bottom', '0px');
    await expect(page.locator(`.lu-${kind}-head`)).toHaveCSS('margin-bottom', '0px');
  });
}

test('confirm message respects the modal body padding without an extra paragraph margin', async ({ page }) => {
  await visit(page, 'vue', 'confirm');
  await prepare(page, 'vue', 'confirm');
  const body = await page.locator('.lu-modal-body').boundingBox();
  const message = await page.locator('.lu-confirm-msg').boundingBox();
  expect(message!.y - body!.y).toBeCloseTo(14, 0);
});

test('localized modal actions wrap within a narrow dialog', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await visit(page, 'vue', 'modal');
  await prepare(page, 'vue', 'modal');
  await page.locator('.lu-modal-foot .lu-btn-label').first().evaluate(element => { element.textContent = 'Abbrechen'; });
  await page.locator('.lu-modal-foot .lu-btn-label').last().evaluate(element => { element.textContent = 'Änderungen speichern'; });
  const panel = page.locator('.lu-modal');
  await expect.poll(() => panel.evaluate(element => element.scrollWidth - element.clientWidth)).toBe(0);
  const footer = await page.locator('.lu-modal-foot').boundingBox();
  for (const action of await page.locator('.lu-modal-foot button').all()) {
    const box = await action.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(footer!.x + 19);
    expect(box!.x + box!.width).toBeLessThanOrEqual(footer!.x + footer!.width - 19);
  }
});

test('drawer border fits entirely inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, 'vue', 'drawer-right');
  await prepare(page, 'vue', 'drawer-right');
  const box = await page.locator('.lu-drawer').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
});

test('light account preferences expose visible controls and a distinct selected state', async ({ page }) => {
  await visit(page, 'vue', 'preferences');
  const unselected = page.locator('.lu-ap-pill').filter({ hasText: 'Dark' });
  expect(await contrast(unselected, 'borderTopColor'), 'Control outline against the light surface').toBeGreaterThanOrEqual(3);
  const activeBorder = await page.locator('.lu-ap-pill').filter({ hasText: 'Light' }).evaluate(element => getComputedStyle(element).borderTopColor);
  expect(activeBorder).not.toBe(await unselected.evaluate(element => getComputedStyle(element).borderTopColor));
});

for (const framework of ['vue', 'react']) {
  test(`${framework} sidebar search and current page have visible boundaries in light mode`, async ({ page }) => {
    await visit(page, framework, 'sidebar');
    expect(await contrast(page.locator('.lu-cs-search'), 'borderTopColor'), 'search boundary').toBeGreaterThanOrEqual(3);
    const current = page.locator('.lu-cs-item[data-active="true"]');
    expect(await current.evaluate(el => getComputedStyle(el).boxShadow)).toContain('0px 0px 0px 1px inset');
    expect(await contrast(current, 'selectionEdge'), 'current page boundary').toBeGreaterThanOrEqual(3);
  });
}

test('keyboard-scrolled palette selection keeps its rounded corners inset from the panel', async ({ page }) => {
  await visit(page, 'vue', 'palette');
  await prepare(page, 'vue', 'palette');
  for (let index = 0; index < 25; index++) await page.keyboard.press('ArrowDown');
  const list = await page.locator('.lu-cp-list').boundingBox();
  const active = await page.locator('.lu-cp-item[data-active="true"]').boundingBox();
  expect(active!.y + active!.height).toBeLessThanOrEqual(list!.y + list!.height - 5.5);
});

async function contrast(locator: Locator, property: 'borderTopColor' | 'outlineColor' | 'color' | 'placeholder' | 'selectionEdge') {
  return locator.evaluate((element, property) => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d')!;
    function rgba(value: string): number[] {
      context.clearRect(0, 0, 1, 1); context.fillStyle = value; context.fillRect(0, 0, 1, 1);
      const data = [...context.getImageData(0, 0, 1, 1).data]; data[3] /= 255; return data;
    }
    function over(front: number[], back: number[]) { return front.slice(0, 3).map((v, i) => v * front[3] + back[i] * (1 - front[3])); }
    function luminance(rgb: number[]) {
      const linear = rgb.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
    }
    const ancestors: Element[] = [];
    for (let node: Element | null = element; node; node = node.parentElement) ancestors.unshift(node);
    const background = ancestors.reduce((bg, node) => over(rgba(getComputedStyle(node).backgroundColor), bg), [255, 255, 255]);
    const color = property === 'selectionEdge' ? getComputedStyle(element).boxShadow.match(/^(rgba?\([^)]+\)|color\([^)]+\))/)![0] : property === 'placeholder' ? getComputedStyle(element, '::placeholder').color : getComputedStyle(element)[property];
    const a = luminance(over(rgba(color), background)), b = luminance(background);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  }, property);
}

for (const theme of ['light', 'dark']) {
  test(`${theme} destructive menu action remains readable`, async ({ page }) => {
    await visit(page, 'vue', 'popover', theme);
    await prepare(page, 'vue', 'popover');
    expect(await contrast(page.locator('.lu-menu-item.is-danger'), 'color')).toBeGreaterThanOrEqual(4.5);
  });
}
for (const [scenario, selector] of [['palette', '.lu-cp-item[data-active="true"]'], ['docs', '.lu-docs-link[data-active="true"]']]) {
  test(`${scenario} light current selection has a visible boundary`, async ({ page }) => {
    await visit(page, 'vue', scenario);
    await prepare(page, 'vue', scenario);
    expect(await page.locator(selector).evaluate(el => getComputedStyle(el).boxShadow)).toContain('0px 0px 0px 1px inset');
    expect(await contrast(page.locator(selector), 'selectionEdge')).toBeGreaterThanOrEqual(3);
  });
}

for (const framework of ['vue', 'react']) {
  test(`${framework} collapsed sidebar does not draw an empty account footer`, async ({ page }) => {
    await visit(page, framework, 'sidebar-collapsed');
    const footer = page.locator('.lu-cs-foot');
    if (framework === 'react') {
      await expect(footer.locator('.lu-am')).toBeVisible();
      await footer.evaluate(element => element.replaceChildren());
    }
    await expect(footer).toBeHidden();
  });
}
