import { test, expect, visit, setPreferences } from './fixtures';

for (const framework of ['vue', 'react']) for (const [layout, width] of [['desktop', 1100], ['mobile', 390]] as const) {
  test.describe(`${framework} ${layout} canonical controls`, () => {
    test.use({ viewport: { width, height: 844 } });

    test('editing and toggling preserve controlled values across related controls', async ({ page }) => {
      await visit(page, framework, 'forms', 'light', '&parity=1');
      const name = page.getByRole('textbox', { name: 'Workspace name', exact: true });
      const checkbox = page.getByRole('checkbox', { name: 'Selected', exact: true });
      const notifications = page.getByRole('switch', { name: 'Notifications' });
      await name.fill('Release review workspace');
      await expect(name).toHaveValue('Release review workspace');
      await expect(checkbox).toBeChecked();
      await expect(notifications).toBeChecked();

      await checkbox.press('Space');
      await expect(checkbox).not.toBeChecked();
      await expect(notifications).not.toBeChecked();
      await notifications.press('Space');
      await expect(checkbox).toBeChecked();
      await expect(notifications).toBeChecked();
      await notifications.press('Enter');
      await expect(checkbox).not.toBeChecked();
      await expect(notifications).not.toBeChecked();
      await expect(name).toHaveValue('Release review workspace');
      await expect(page.getByRole('textbox', { name: 'Disabled field' })).toBeDisabled();
      await expect(page.getByRole('textbox', { name: 'Disabled field' })).toHaveValue('Read only');
      await expect(page.getByRole('checkbox', { name: 'Disabled selected', exact: true })).toBeDisabled();
      await expect(page.getByRole('checkbox', { name: 'Disabled selected', exact: true })).toBeChecked();
      await expect(page.getByRole('switch', { name: 'Disabled', exact: true })).toBeDisabled();
      await expect(page.getByRole('switch', { name: 'Disabled', exact: true })).toBeChecked();
    });

    test('radio selection synchronizes tabs and segments while keyboard navigation skips disabled radio options', async ({ page }) => {
      await visit(page, framework, 'forms', 'light', '&parity=1');
      const radios = page.locator('[data-component="GlassRadio"]');
      const daily = radios.getByRole('radio', { name: 'Daily' });
      const weekly = radios.getByRole('radio', { name: 'Weekly' });
      const monthly = radios.getByRole('radio', { name: 'Monthly' });
      const tabs = page.getByRole('tablist', { name: 'Report period' });
      const segments = page.getByRole('radiogroup', { name: 'Frequency' });
      await weekly.locator('..').click();
      await expect(weekly).toBeChecked();
      await expect(daily).not.toBeChecked();
      await expect(tabs.getByRole('tab', { name: 'Weekly' })).toHaveAttribute('aria-selected', 'true');
      await expect(segments.getByRole('radio', { name: 'Weekly' })).toBeChecked();
      await expect(monthly).toBeDisabled();

      await weekly.press('ArrowRight');
      await expect(daily).toBeFocused();
      await expect(daily).toBeChecked();
      await expect(monthly).not.toBeChecked();
      await expect(tabs.getByRole('tab', { name: 'Daily' })).toHaveAttribute('aria-selected', 'true');
      await daily.press('ArrowLeft');
      await expect(weekly).toBeFocused();
      await expect(weekly).toBeChecked();

      const weeklyTab = tabs.getByRole('tab', { name: 'Weekly' });
      await weeklyTab.focus();
      await page.keyboard.press('ArrowRight');
      await expect(tabs.getByRole('tab', { name: 'Monthly' })).toBeFocused();
      await expect(segments.getByRole('radio', { name: 'Monthly' })).toBeChecked();
      await page.keyboard.press('ArrowRight');
      await expect(tabs.getByRole('tab', { name: 'Daily' })).toBeFocused();
      await expect(daily).toBeChecked();
      await page.keyboard.press('ArrowLeft');
      await expect(tabs.getByRole('tab', { name: 'Monthly' })).toBeFocused();
      await expect(tabs.locator('[tabindex="0"]')).toHaveCount(1);
      await expect(tabs.getByRole('tab', { name: 'Monthly' })).toHaveAttribute('aria-selected', 'true');
      await expect(tabs.getByRole('tab', { name: 'Daily' })).toHaveAttribute('tabindex', '-1');
    });

    test('icon actions retain accessible toggle state and keyboard focus order', async ({ page }) => {
      await visit(page, framework, 'buttons', 'light', '&parity=1');
      const icons = page.locator('[data-component="GlassIconButton"]');
      const add = icons.getByRole('button', { name: 'Add', exact: true });
      const small = icons.getByRole('button', { name: 'Small add' });
      const pinned = icons.getByRole('button', { name: 'Pinned' });
      const disabled = icons.getByRole('button', { name: 'Unavailable' });
      await expect(pinned).toHaveAttribute('aria-pressed', 'true');
      await expect(disabled).toBeDisabled();
      await expect(add).toHaveAttribute('type', 'button');
      await add.focus();
      await page.keyboard.press('Tab');
      await expect(small).toBeFocused();
      await expect(small).toHaveCSS('outline-style', 'solid');
      await expect(small).toHaveCSS('outline-width', '2px');
      await page.keyboard.press('Tab');
      await expect(pinned).toBeFocused();
      await page.keyboard.press('Space');
      await expect(pinned).toHaveAttribute('aria-pressed', 'true');
      await page.keyboard.press('Tab');
      await expect(disabled).not.toBeFocused();
      await expect(icons.locator(':focus')).toHaveCount(0);
      const sizes = await Promise.all([add.boundingBox(), small.boundingBox()]);
      expect(sizes[0]!.width).toBeGreaterThan(sizes[1]!.width);
      expect(sizes[0]!.height).toBeGreaterThan(sizes[1]!.height);
    });

    test('progress communicates clamped values and placeholders retain their intended dimensions', async ({ page }) => {
      await visit(page, framework, 'feedback', 'light', '&parity=1');
      for (const [value, expected] of [[-10, 0], [0, 0], [50, 50], [100, 100], [150, 100]]) {
        const progress = page.getByRole('progressbar', { name: `Progress ${value}`, exact: true });
        await expect(progress).toHaveAttribute('aria-valuemin', '0');
        await expect(progress).toHaveAttribute('aria-valuemax', '100');
        await expect(progress).toHaveAttribute('aria-valuenow', String(expected));
        const ratio = await progress.evaluate(element => {
          const fill = element.firstElementChild!;
          const css = getComputedStyle(element);
          const inner = element.getBoundingClientRect().width - parseFloat(css.borderLeftWidth) - parseFloat(css.borderRightWidth);
          return fill.getBoundingClientRect().width / inner;
        });
        expect(ratio).toBeCloseTo(expected / 100, 2);
      }
      const placeholders = page.locator('[data-component="GlassSkeleton"] .lu-skeleton');
      await expect(placeholders).toHaveCount(3);
      for (const placeholder of await placeholders.all()) await expect(placeholder).toHaveAttribute('aria-hidden', 'true');
      await expect(placeholders.first()).toHaveCSS('width', '48px');
      await expect(placeholders.first()).toHaveCSS('height', '48px');
      await expect(placeholders.first()).toHaveCSS('border-radius', '50%');
      const full = (await placeholders.nth(1).boundingBox())!;
      const shorter = (await placeholders.nth(2).boundingBox())!;
      expect(shorter.width / full.width).toBeCloseTo(0.65, 2);
      expect(shorter.height).toBe(full.height);
      await setPreferences(page, { motion: 'reduce' });
      await expect(placeholders.first()).toHaveCSS('animation-name', 'none');
    });

    test('surface optical attributes drive refraction and pointer sheen and respect reduced preferences', async ({ page }) => {
      await visit(page, framework, 'effects', 'light', '&parity=1');
      const refracted = page.locator('.effect-surface[data-lg-refract=""]');
      const plain = page.locator('.effect-surface[data-lg-refract="off"]').first();
      const interactive = page.locator('.effect-surface[data-lg-sheen]');
      const sheen = interactive.locator(':scope > [aria-hidden]');
      await expect(refracted).toHaveCount(1);
      await expect(plain).toHaveCount(1);
      await expect.poll(() => refracted.evaluate(element => (element as HTMLElement).style.backdropFilter)).toContain('url(');
      expect(await plain.evaluate(element => (element as HTMLElement).style.backdropFilter)).not.toContain('url(');
      await interactive.hover({ position: { x: 120, y: 60 } });
      await expect(sheen).toHaveCSS('opacity', '1');
      await expect(sheen).toHaveCSS('pointer-events', 'none');
      await page.getByRole('button', { name: 'Refresh effects' }).click();
      await expect(sheen).toHaveCount(1);
      await interactive.hover({ position: { x: 120, y: 60 } });
      await expect(sheen).toHaveCSS('opacity', '1');
      await setPreferences(page, { motion: 'reduce', transparency: 'reduce' });
      await page.getByRole('button', { name: 'Refresh effects' }).click();
      await expect(sheen).toHaveCount(0);
      await expect(refracted).toHaveCSS('backdrop-filter', 'none');
      expect(await refracted.evaluate(element => (element as HTMLElement).style.backdropFilter)).toBe('');
    });
  });
}
