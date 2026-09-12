import { test, expect, visit, prepare, sheenInteraction, sampleSheen } from './fixtures';
import { captureExact } from './exact-golden';
import { comparePixels } from './exact-pixels';

for (const framework of ['vue', 'react']) test(`capture retains ${framework} pointer sheen after transport mouseleave`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, framework, 'effects', 'dark', '&parity=1');
  await prepare(page, framework, 'effects');
  const expected = await captureExact(page, { fullPage: true });
  const panel = page.locator('[data-lg-sheen]');
  const sheen = panel.locator(':scope > [aria-hidden]');
  const screenshot = page.screenshot.bind(page);
  let calls = 0;
  page.screenshot = async options => {
    // Reproduce Chromium's native full-page capture losing the pointer target.
    if (++calls === 1 || calls === 3) {
      await panel.dispatchEvent('mouseleave');
      await expect(sheen).toHaveCSS('opacity', '0');
    }
    return screenshot(options);
  };
  try {
    const actual = await captureExact(page, {
      fullPage: true,
      interaction: sheenInteraction(page),
    });
    expect(comparePixels(expected, actual).changedPixels).toBe(0);
    expect(calls).toBe(5);
    await expect(sheen).toHaveCSS('opacity', '1');
  } finally { page.screenshot = screenshot; }
});

for (const framework of ['vue', 'react']) for (const theme of ['light', 'dark']) {
  test(`${framework} ${theme} fixed sheen sample matches real pointer input and real exit fades`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, framework, 'effects', theme, '&parity=1');
    const panel = page.locator('[data-lg-sheen]');
    const sheen = panel.locator(':scope > [aria-hidden]');
    await panel.hover({ position: { x: 150, y: 80 } });
    await expect(sheen).toHaveCSS('opacity', '1');
    const real = await sheen.evaluate(el => (el as HTMLElement).style.backgroundImage);
    await page.mouse.move(0, 0);
    await expect(sheen).toHaveCSS('opacity', '0');
    await sampleSheen(page);
    await expect(sheen).toHaveCSS('opacity', '1');
    expect(await sheen.evaluate(el => (el as HTMLElement).style.backgroundImage)).toBe(real);
  });
}
