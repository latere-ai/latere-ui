import { test, expect, visit } from './fixtures';

test(`tree opens with Enter and Space and moves with arrows`, async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 850 });
  await visit(page, 'sidebar', 'light', '&parity=1&tree=true');
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

test(`folded rail keeps one head row and selects the parent of the page`, async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 850 });
  await visit(page, 'sidebar-collapsed', 'light', '&parity=1&tree=true');
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
  await visit(page, 'sidebar', 'light', '&parity=1&tree=true');
  const expanded = page.locator('.lu-cs-item[data-nav-id="jobs"]');
  expect(await expanded.evaluate(el => getComputedStyle(el).borderTopLeftRadius)).toBe(radius);
});
