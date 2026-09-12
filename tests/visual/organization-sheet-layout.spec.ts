import { test, expect, visit } from './fixtures';

for (const framework of ['vue', 'react']) for (const design of ['default', 'replichai', 'wallfacer', 'origo']) {
  test(`${design} ${framework} organization example exposes its current selection visually`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, framework, 'organizations', 'light', `&parity=1${design === 'default' ? '' : `&design=${design}`}`);
    const list = page.getByRole('menu');
    await expect(list).toHaveCSS('list-style-type', 'none');
    const initial = page.getByRole('menuitem', { name: 'Design studio', exact: true });
    const personal = page.getByRole('menuitem', { name: 'Personal', exact: true });
    await expect(initial).toHaveCSS('appearance', 'none');
    await expect(initial).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(personal).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await personal.focus();
    await expect(personal).toHaveCSS('outline-style', 'solid');
    await personal.press('Enter');
    await expect(personal).toHaveAttribute('aria-current', 'true');
    await expect(personal).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(initial).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    expect((await personal.boundingBox())!.height).toBeGreaterThanOrEqual(32);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
