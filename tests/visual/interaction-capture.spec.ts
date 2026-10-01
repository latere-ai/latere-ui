import { test, expect, visit, sampleSheen } from './fixtures';

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
