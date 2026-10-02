import { test, expect, visit } from './fixtures';

for (const layout of ['desktop', 'mobile']) {
  test.describe(`${layout} canonical shell`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(layout === 'mobile' ? { width: 390, height: 844 } : { width: 1280, height: 850 });
    });

    test('preferences update the controlled locale and theme', async ({ page }) => {
      await visit(page, 'preferences', 'light', '&parity=1');
      const language = page.getByRole('group', { name: 'Language', exact: true });
      const theme = page.getByRole('group', { name: 'Theme', exact: true });
      await expect(language.getByRole('button', { name: 'EN', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await language.getByRole('button', { name: 'DE', exact: true }).click();
      await expect(language.getByRole('button', { name: 'DE', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(language.getByRole('button', { name: 'EN', exact: true })).toHaveAttribute('aria-pressed', 'false');
      await theme.getByRole('button', { name: 'Dark', exact: true }).click();
      await expect(theme.getByRole('button', { name: 'Dark', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(theme.getByRole('button', { name: 'Light', exact: true })).toHaveAttribute('aria-pressed', 'false');
      await theme.getByRole('button', { name: 'Auto', exact: true }).focus();
      await page.keyboard.press('Space');
      await expect(theme.getByRole('button', { name: 'Auto', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(language.locator('[aria-pressed="true"]')).toHaveCount(1);
      await expect(theme.locator('[aria-pressed="true"]')).toHaveCount(1);
    });

    test('organization selection updates personal and membership state', async ({ page }) => {
      await visit(page, 'organizations', 'light', '&parity=1');
      const root = page.locator('.latere-org-switcher');
      await expect(root).toHaveAttribute('data-loading', 'false');
      await expect(root.getByRole('menuitem')).toHaveCount(4);
      await expect(root.getByRole('menuitem', { name: 'Design studio', exact: true })).toHaveAttribute('aria-current', 'true');
      await expect(root.locator('[data-owner="true"]')).toContainText('Design studio');
      await root.getByRole('menuitem', { name: 'Personal', exact: true }).click();
      await expect(root.getByRole('menuitem', { name: 'Personal', exact: true })).toHaveAttribute('aria-current', 'true');
      await expect(root.getByRole('menuitem', { name: 'Design studio', exact: true })).toHaveAttribute('aria-current', 'false');
      await root.getByRole('menuitem', { name: 'Workspace 2', exact: true }).focus();
      await page.keyboard.press('Enter');
      await expect(root.locator('[data-active="true"]')).toHaveText('Workspace 2');
      await expect(root.locator('[aria-current="true"]')).toHaveCount(1);
      await expect(root.getByRole('menuitem', { name: 'Personal', exact: true })).toHaveAttribute('aria-current', 'false');
    });

    test('palette filters, handles empty results, scrolls keyboard selection and restores focus', async ({ page }) => {
      await visit(page, 'palette', 'light', '&parity=1');
      const trigger = page.getByRole('button', { name: 'Open palette', exact: true });
      await trigger.click();
      const input = page.getByRole('combobox');
      await expect(input).toBeFocused();
      await expect(page.getByRole('option')).toHaveCount(30);
      await input.fill('Page 04');
      await expect(page.getByRole('option')).toHaveCount(1);
      await expect(page.getByRole('option')).toContainText('Page 04');
      await input.fill('no such page');
      await expect(page.getByText('No matches', { exact: true })).toBeVisible();
      await expect(input).not.toHaveAttribute('aria-activedescendant');
      await input.press('ArrowDown'); await input.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      await input.fill('');
      for (let index = 0; index < 35; index++) await input.press('ArrowDown');
      const last = page.getByRole('option', { name: 'Page 30 Workspace', exact: true });
      await expect(last).toHaveAttribute('aria-selected', 'true');
      const bounds = await last.boundingBox(); const list = await page.getByRole('listbox').boundingBox();
      expect(bounds!.y).toBeGreaterThanOrEqual(list!.y);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(list!.y + list!.height + 1);
      await input.press('Tab'); await expect(input).toBeFocused();
      await input.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(trigger).toBeFocused();
      await trigger.press('Enter'); await expect(input).toHaveValue('');
      await input.press('ArrowDown'); await input.press('Enter');
      await expect(page.getByRole('dialog')).toHaveCount(0); await expect(trigger).toBeFocused();
    });

    test('workspace collapse and new project update visible content', async ({ page }) => {
      await visit(page, 'workspace', 'light', '&parity=1');
      const sidebar = page.locator('.lu-cs');
      await expect(sidebar).toHaveAttribute('data-collapsed', layout === 'mobile' ? 'true' : 'false');
      if (layout === 'mobile') {
        await expect(page.locator('.lu-cs-nav')).toBeHidden();
        await page.locator('.lu-cs-brand').click();
      } else {
        await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
        await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
        await page.locator('.lu-cs-fold').click();
      }
      await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
      await expect(page.locator('.lu-cs-nav')).toBeVisible();
      await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
      await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
      await page.getByRole('button', { name: 'New project', exact: true }).click();
      await expect(page.getByRole('cell', { name: 'Untitled project', exact: true })).toBeVisible();
      await expect(page.locator('.workspace-section-heading')).toContainText('9 projects');
      await expect(page.locator('.workspace-metrics .lu-panel').filter({ hasText: 'Active projects' }).locator('strong')).toHaveText('9');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });

    test('docs heading anchors and navigation remain usable', async ({ page }) => {
      await visit(page, 'docs', 'light', '&parity=1');
      await expect(page.getByRole('heading', { name: 'Introduction', exact: true })).toBeVisible();
      const heading = page.getByRole('heading', { name: 'Review activity', exact: true });
      await expect(heading).toHaveAttribute('id', 'review-activity');
      const tocLink = page.locator('.lu-docs-toc-link', { hasText: 'Review activity' });
      await expect(tocLink).toHaveAttribute('href', '#review-activity');
      if (layout === 'desktop') {
        await tocLink.click();
        await expect(page).toHaveURL(/#review-activity$/);
        await expect(tocLink).toHaveAttribute('data-active', 'true');
        await expect(heading).toBeInViewport();
      } else {
        await expect(page.locator('.lu-docs-toc')).toBeHidden();
        await heading.scrollIntoViewIfNeeded();
        await expect(heading).toBeInViewport();
      }
      const setup = page.locator('.lu-docs-nav').getByRole('link', { name: 'Setup', exact: true });
      await expect(setup).toHaveAttribute('href', '/start/setup');
      await expect(page.locator('.lu-docs-pager-next')).toHaveAttribute('href', '/start/setup');
      await setup.click();
      await expect(page).toHaveURL(/\/start\/setup$/);
    });
  });
}
