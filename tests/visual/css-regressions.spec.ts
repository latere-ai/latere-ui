import { test, expect, visit } from './fixtures';
for (const theme of ['light', 'dark']) test(`smoke surfaces preserve inverse ink in ${theme}`, async ({ page }) => {
  await visit(page, 'containers', theme);
  const colors = await page.locator('.lu-gs.lu-glass-smoke').evaluateAll(elements => elements.map(el => ({ actual: getComputedStyle(el).color, ink: getComputedStyle(el).getPropertyValue('--glass-smoke-ink').trim() })));
  expect(colors.length).toBeGreaterThan(0);
  for (const color of colors) {
    const expected = await page.evaluate(ink => { const probe = document.createElement('span'); probe.style.color = ink; document.body.append(probe); const result = getComputedStyle(probe).color; probe.remove(); return result; }, color.ink);
    expect(color.actual).toBe(expected);
  }
});
test(`fields fit their container without a host CSS reset`, async ({ page }) => {
  await visit(page, 'forms');
  for (const field of await page.locator('.lu-field').all()) {
    const bounds = await field.evaluate(el => ({ outer: el.getBoundingClientRect().width, inner: el.querySelector('input, textarea')!.getBoundingClientRect().width }));
    expect(bounds.inner).toBeLessThanOrEqual(bounds.outer);
  }
});
