import type { Locator, Page } from '@playwright/test';
import { test, expect, visit } from './fixtures';

// A select's menu and a popover's panel where a box around them would clip
// them: in a dialog's form, at the bottom of a scrolling panel, and in a bar
// pinned to the bottom of the viewport. Each open panel must be drawn whole,
// inside the viewport and over everything, stay against its control as
// things scroll, and take Escape before the dialog does.

/** The panel around a listbox or a menu. */
const panelOf = (list: Locator) => list.locator('xpath=ancestor-or-self::*[contains(@class, "lu-select-list") or contains(@class, "lu-pop-panel")][1]');

/**
 * Every row of the panel answers a hit test at its top, middle and bottom
 * with itself, so no edge of a box clips it and nothing is drawn over it,
 * and the panel lies inside the viewport.
 */
async function expectWhole(list: Locator) {
  const seen = await panelOf(list).evaluate(panel => {
    const box = panel.getBoundingClientRect();
    const rows = [...panel.querySelectorAll('[role="option"], [role="menuitem"]')];
    const hit = (row: Element, y: number) => {
      const r = row.getBoundingClientRect();
      const at = document.elementFromPoint(r.left + r.width / 2, y);
      return !!at && row.contains(at);
    };
    return {
      inside: box.top >= 0 && box.left >= 0 && box.bottom <= innerHeight && box.right <= innerWidth,
      rows: rows.map(row => { const r = row.getBoundingClientRect(); return [hit(row, r.top + 2), hit(row, r.top + r.height / 2), hit(row, r.bottom - 2)]; }),
      topLayer: panel.matches(':popover-open'),
    };
  });
  expect(seen.inside, 'the panel lies inside the viewport').toBe(true);
  expect(seen.rows.length).toBeGreaterThan(0);
  expect(seen.rows, 'every row is drawn whole and uncovered').toEqual(seen.rows.map(() => [true, true, true]));
  expect(seen.topLayer, 'the panel is in the top layer').toBe(true);
}

/** Where the panel sits against its control: under it or above it, by the gap. */
async function sideOf(control: Locator, list: Locator, gap: number): Promise<'bottom' | 'top'> {
  const c = (await control.boundingBox())!;
  const p = (await panelOf(list).boundingBox())!;
  if (Math.abs(p.y - (c.y + c.height + gap)) < 1) return 'bottom';
  expect(Math.abs(p.y + p.height - (c.y - gap)), 'the panel touches its control by the gap').toBeLessThan(1);
  return 'top';
}

/** Two frames, so a scroll set from a script has been reported and handled. */
const settle = (page: Page) => page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));

/** Open the dialog and wait until it has finished moving in. */
async function openDialog(page: Page) {
  await visit(page, 'layers');
  await page.getByRole('button', { name: 'Create service account' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create a service account' });
  await expect(dialog.getByRole('textbox', { name: 'Name' })).toBeFocused();
  await expect(dialog).toHaveCSS('transform', 'none');
  return dialog;
}

for (const [layout, viewport] of [['desktop', { width: 1100, height: 850 }], ['mobile', { width: 390, height: 844 }], ['short', { width: 1100, height: 420 }]] as const) {
  test.describe(`floating panels ${layout}`, () => {
    test.use({ viewport });

    test('a select in a dialog opens its menu whole, over the dialog edge and its buttons', async ({ page }) => {
      const dialog = await openDialog(page);
      const role = dialog.getByRole('combobox', { name: 'Role' });
      await role.scrollIntoViewIfNeeded();
      const height = await dialog.evaluate(el => el.scrollHeight);
      await role.click();
      const list = page.getByRole('listbox');
      await expect(list.getByRole('option')).toHaveText(['Member', 'Admin']);
      await expectWhole(list);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page overflow').toBe(true);
      expect(await dialog.evaluate(el => el.scrollHeight), 'the open menu adds nothing to the dialog\'s scroll height').toBe(height);
      await list.getByRole('option', { name: 'Admin' }).click();
      await expect(list).toHaveCount(0);
      await expect(role).toHaveText(/Admin/);
      await expect(role).toBeFocused();
      await expect(dialog).toBeVisible();
    });

    test('Escape closes the open menu and leaves the dialog open, wherever the focus is', async ({ page }) => {
      const dialog = await openDialog(page);
      const role = dialog.getByRole('combobox', { name: 'Role' });
      await role.click();
      await expect(page.getByRole('listbox')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('listbox')).toHaveCount(0);
      await expect(dialog).toBeVisible();
      await expect(role).toBeFocused();

      // Safari leaves the focus where it was when the pointer opens the menu.
      const name = dialog.getByRole('textbox', { name: 'Name' });
      await name.focus();
      await role.dispatchEvent('click');
      await expect(page.getByRole('listbox')).toBeVisible();
      await expect(name).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('listbox')).toHaveCount(0);
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
    });

    test('the keyboard opens, moves through and chooses from the menu in a dialog', async ({ page }) => {
      const dialog = await openDialog(page);
      const role = dialog.getByRole('combobox', { name: 'Role' });
      await role.focus();
      await page.keyboard.press('ArrowDown');
      const list = page.getByRole('listbox');
      await expectWhole(list);
      await expect(list.locator('.is-active')).toHaveText('Member');
      await page.keyboard.press('ArrowDown');
      await expect(list.locator('.is-active')).toHaveText('Admin');
      await page.keyboard.press('Enter');
      await expect(list).toHaveCount(0);
      await expect(role).toHaveText(/Admin/);
      await expect(role).toBeFocused();
    });

    test('a menu in a dialog opens whole and Escape closes only the menu', async ({ page }) => {
      const dialog = await openDialog(page);
      const trigger = dialog.getByRole('button', { name: 'Key actions' });
      await trigger.click();
      const menu = page.getByRole('menu', { name: 'Key actions' });
      await expect(menu.getByRole('menuitem', { name: 'Rotate key' })).toBeFocused();
      await expectWhole(menu);
      await page.keyboard.press('Escape');
      await expect(menu).toHaveCount(0);
      await expect(dialog).toBeVisible();
      await expect(trigger).toBeFocused();
    });

    test('a select and a menu pinned to the bottom of the viewport open above it', async ({ page }) => {
      await visit(page, 'layers');
      const effort = page.getByRole('combobox', { name: 'Effort' });
      await effort.click();
      const list = page.getByRole('listbox');
      await expectWhole(list);
      expect(await sideOf(effort, list, 4)).toBe('top');
      await page.keyboard.press('Escape');
      await expect(list).toHaveCount(0);

      await page.getByRole('button', { name: 'Composer actions' }).click();
      const menu = page.getByRole('menu', { name: 'Composer actions' });
      await expectWhole(menu);
      expect(await sideOf(page.locator('.layers-bar .lu-pop'), menu, 6)).toBe('top');
      await expect(panelOf(menu)).toHaveClass(/lu-pop-panel--top-start/);
    });
  });
}

test.describe('floating panels in scrolling boxes', () => {
  test.use({ viewport: { width: 1100, height: 850 } });

  test('a select at the bottom of a scrolling panel opens whole, follows it and closes once scrolled away', async ({ page }) => {
    await visit(page, 'layers');
    const scroller = page.getByTestId('scroller');
    const schedule = page.getByRole('combobox', { name: 'Schedule' });
    await schedule.focus();
    await page.keyboard.press('ArrowDown');
    const list = page.getByRole('listbox');
    await expectWhole(list);
    // The scroller centers its text; the rows still start at the panel's edge.
    await expect(list.getByRole('option').first()).toHaveCSS('text-align', 'start');
    const side = await sideOf(schedule, list, 4);
    await scroller.evaluate(el => { el.scrollTop += 24; });
    await settle(page);
    expect(await sideOf(schedule, list, 4)).toBe(side);
    await expectWhole(list);
    await scroller.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expect(list).toHaveCount(0);
  });

  test('a select opened while its dialog is still moving in ends against its field', async ({ page }) => {
    await visit(page, 'layers');
    await page.getByRole('button', { name: 'Create service account' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create a service account' });
    const role = dialog.getByRole('combobox', { name: 'Role' });
    await role.focus();
    await page.keyboard.press('ArrowDown');
    const list = page.getByRole('listbox');
    await expect(list).toBeVisible();
    await expect(dialog).toHaveCSS('transform', 'none');
    await settle(page);
    expect(['bottom', 'top']).toContain(await sideOf(role, list, 4));
    await expectWhole(list);
  });

  test('a select in a dialog that scrolls stays against its field', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 300 });
    const dialog = await openDialog(page);
    const panel = page.locator('.lu-modal');
    expect(await panel.evaluate(el => el.scrollHeight > el.clientHeight), 'the dialog scrolls at this height').toBe(true);
    const role = dialog.getByRole('combobox', { name: 'Role' });
    await role.focus();
    await page.keyboard.press('ArrowDown');
    const list = page.getByRole('listbox');
    await expectWhole(list);
    const side = await sideOf(role, list, 4);
    await panel.evaluate(el => { el.scrollTop += 12; });
    await settle(page);
    expect(await sideOf(role, list, 4)).toBe(side);
    await expectWhole(list);
  });
});
