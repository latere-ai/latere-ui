import { test, expect, visit } from './fixtures';
import { captureExact } from './exact-golden';
import { comparePixels } from './exact-pixels';

// The expandable tree, compact head, foot rows and text subline render the
// same pixels in both adapters, expanded and folded, in both themes. These
// comparisons need no committed reference: each run compares Vue with React.
for (const theme of ['light', 'dark']) for (const scenario of ['sidebar', 'sidebar-collapsed']) {
  test(`compact tree sidebar matches across adapters: ${scenario} ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 850 });
    const frames: Buffer[] = [];
    for (const framework of ['vue', 'react']) {
      await visit(page, framework, scenario, theme, '&parity=1&tree=true');
      await expect(page.locator('.lu-cs')).toHaveAttribute('data-compact', 'true');
      frames.push(await captureExact(page, { clip: (await page.locator('.lu-cs').boundingBox())! }));
    }
    const comparison = comparePixels(frames[0], frames[1]);
    expect(comparison.equal, comparison.message).toBe(true);
  });
}

for (const theme of ['light', 'dark']) {
  test(`palette with host entries matches across adapters in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 850 });
    const frames: Buffer[] = [];
    for (const framework of ['vue', 'react']) {
      await visit(page, framework, 'palette', theme, '&parity=1&tree=true');
      await page.getByRole('button', { name: 'Open palette' }).click();
      await expect(page.getByRole('option')).toHaveCount(9);
      frames.push(await captureExact(page, { clip: (await page.locator('.lu-cp').boundingBox())! }));
    }
    const comparison = comparePixels(frames[0], frames[1]);
    expect(comparison.equal, comparison.message).toBe(true);
  });
}

for (const framework of ['vue', 'react']) {
  test(`${framework} tree opens with Enter and Space and moves with arrows`, async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 850 });
    await visit(page, framework, 'sidebar', 'light', '&parity=1&tree=true');
    const projects = page.getByRole('button', { name: 'Projects' });
    const models = page.getByRole('button', { name: 'Models' });
    // The active page's parent is open; the others start folded.
    await expect(projects).toHaveAttribute('aria-expanded', 'true');
    await expect(models).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('group', { name: 'Models' })).toBeHidden();
    await models.focus();
    await page.keyboard.press('Enter');
    await expect(models).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('group', { name: 'Models' })).toBeVisible();
    await page.keyboard.press('Space');
    await expect(models).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('ArrowRight');
    await expect(models).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('link', { name: 'Catalog' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(models).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('link', { name: 'Runs' })).toBeFocused();
    // The foot rows follow the nav and carry their value.
    await expect(page.locator('.lu-cs-foot-item').nth(1)).toContainText('$8.16');
    await expect(page.locator('.lu-am-id-line')).toHaveText('Admin · Design studio');
  });

  test(`${framework} folded rail keeps one head row and selects the parent of the page`, async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 850 });
    await visit(page, framework, 'sidebar-collapsed', 'light', '&parity=1&tree=true');
    const head = page.locator('.lu-cs-head');
    const fold = head.locator('.lu-cs-fold');
    const headBox = (await head.boundingBox())!;
    expect(headBox.height).toBe(36);
    await expect(fold.locator('.lu-cs-fold-mark')).toBeVisible();
    await fold.hover();
    await expect(fold.locator('.lu-cs-fold-glyph')).toBeVisible();
    await expect(fold.locator('.lu-cs-fold-mark')).toBeHidden();
    const projects = page.locator('.lu-cs-item[data-nav-id="projects"]');
    await expect(projects).toHaveAttribute('data-active', 'true');
    await expect(projects).toHaveAttribute('href', '#jobs');
    const box = (await projects.boundingBox())!;
    expect(box.width).toBe(36);
    expect(box.height).toBe(36);
    // The selection square takes the expanded row's corner.
    const radius = await projects.evaluate(el => getComputedStyle(el).borderTopLeftRadius);
    await visit(page, framework, 'sidebar', 'light', '&parity=1&tree=true');
    const expanded = page.locator('.lu-cs-item[data-nav-id="jobs"]');
    expect(await expanded.evaluate(el => getComputedStyle(el).borderTopLeftRadius)).toBe(radius);
  });
}
