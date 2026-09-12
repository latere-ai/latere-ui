import { test, expect, visit } from './fixtures';

for (const framework of ['vue', 'react']) for (const theme of ['light', 'dark']) {
  test(`${framework} ${theme} sidebar integrates into its host surface`, async ({ page }) => {
    await visit(page, framework, 'sidebar', theme);
    const rail = page.locator('.lu-cs');
    await expect(rail).toHaveCSS('border-radius', '0px');
    await expect(rail).toHaveCSS('border-width', '0px');
    await expect(rail).toHaveCSS('box-shadow', 'none');
    const selected = page.locator('.lu-cs-item[data-active="true"]');
    await expect(selected).toHaveCSS('box-shadow', 'none');
    await expect(selected).toHaveCSS('background-image', 'none');
    await expect(selected).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await selected.focus();
    await expect(selected).toBeFocused();
    await expect(selected).toHaveCSS('outline-style', 'solid');
    await expect(selected).toHaveCSS('outline-width', '2px');
    const box = await selected.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(32);
    expect(box!.height).toBeLessThanOrEqual(36);
  });
}

for (const width of [390, 1280]) for (const theme of ['light', 'dark']) {
  test(`${theme} workspace rail is flush with its window at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await visit(page, 'vue', 'workspace', theme);
    const shell = page.locator('.workspace-demo');
    await expect(shell).toHaveCSS('overflow', 'hidden');
    await expect(shell).toHaveCSS('padding', '0px');
    const shellBox = (await shell.boundingBox())!;
    const railBox = (await page.locator('.workspace-rail .lu-cs').boundingBox())!;
    expect(railBox.x).toBe(shellBox.x);
    expect(railBox.y).toBe(shellBox.y);
    if (width === 390) {
      expect(railBox.width).toBe(shellBox.width);
      await page.locator('.lu-cs-brand').click();
      await expect(page.locator('.lu-cs-nav')).toBeVisible();
      await page.locator('.lu-cs-fold').click();
      await expect(page.locator('.lu-cs-nav')).toBeHidden();
    } else {
      expect(railBox.height).toBe(shellBox.height);
      await page.locator('.lu-cs-fold').click();
      await expect(page.locator('.lu-cs')).toHaveCSS('width', '64px');
      await page.locator('.lu-cs-brand').click();
      await expect(page.locator('.lu-cs')).toHaveCSS('width', '224px');
    }
  });
}
