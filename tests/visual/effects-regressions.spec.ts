import { test, expect, visit } from './fixtures';

test('refraction follows the current theme and surface dimensions on rescan', async ({ page }) => {
  await visit(page, 'vue', 'effects');
  const panel = page.locator('.effect-surface[data-lg-refract=""]');
  const read = () => panel.evaluate(el => {
    const inline = (el as HTMLElement).style.backdropFilter;
    const id = inline.match(/#([^"')]+)/)?.[1];
    const filter = id ? document.getElementById(id) : null;
    const map = filter?.querySelector('feImage');
    return {
      id, inline,
      brightness: getComputedStyle(el).getPropertyValue('--glass-brightness').trim(),
      width: (el as HTMLElement).offsetWidth,
      height: (el as HTMLElement).offsetHeight,
      mapWidth: Number(map?.getAttribute('width')),
      mapHeight: Number(map?.getAttribute('height')),
    };
  });
  const initial = await read();
  expect(initial.id).toBeTruthy();
  expect(initial.mapWidth).toBe(initial.width);
  expect(initial.mapHeight).toBe(initial.height);
  expect(initial.inline).toContain(`brightness(${initial.brightness})`);

  await page.setViewportSize({ width: 700, height: 850 });
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
  await page.getByRole('button', { name: 'Refresh effects' }).click();
  const updated = await read();
  expect(updated.id).not.toBe(initial.id);
  expect(updated.width).toBeLessThan(initial.width);
  expect(updated.mapWidth).toBe(updated.width);
  expect(updated.mapHeight).toBe(updated.height);
  expect(updated.brightness).not.toBe(initial.brightness);
  expect(updated.inline).toContain(`brightness(${updated.brightness})`);
  expect(await page.evaluate(id => document.getElementById(id!) === null, initial.id)).toBe(true);

  await page.getByRole('button', { name: 'Refresh effects' }).click();
  expect((await read()).id).toBe(updated.id);
});

test('reduced transparency removes an existing inline refraction and permits re-enabling', async ({ page, context }) => {
  await visit(page, 'vue', 'effects');
  const panel = page.locator('.effect-surface[data-lg-refract=""]');
  expect(await panel.evaluate(el => (el as HTMLElement).style.backdropFilter)).toContain('url(');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
  await page.getByRole('button', { name: 'Refresh effects' }).click();
  expect(await panel.evaluate(el => (el as HTMLElement).style.backdropFilter)).toBe('');
  await expect(panel).toHaveCSS('backdrop-filter', 'none');
  await expect(page.locator('body > svg filter')).toHaveCount(0);
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'no-preference' }] });
  await page.getByRole('button', { name: 'Refresh effects' }).click();
  expect(await panel.evaluate(el => (el as HTMLElement).style.backdropFilter)).toContain('url(');
});

test('pointer sheen refreshes its theme intensity and honors changed motion preferences', async ({ page }) => {
  await visit(page, 'vue', 'effects');
  const panel = page.locator('[data-lg-sheen]');
  const sheen = panel.locator(':scope > [aria-hidden]');
  await panel.hover({ position: { x: 150, y: 80 } });
  await expect(sheen).toHaveCSS('opacity', '1');
  await expect(sheen).toHaveCSS('background-image', /rgba\(255, 255, 255, 0\.16\)/);
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
  // Keep the cursor in place to check that rescanning refreshes the visible sheen.
  await page.getByRole('button', { name: 'Refresh effects' }).evaluate(el => (el as HTMLButtonElement).click());
  await expect(sheen).toHaveCSS('background-image', /rgba\(255, 255, 255, 0\.06\)/);
  await expect(sheen).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Refresh effects' }).click();
  await expect(sheen).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Refresh effects' }).click();
  await panel.hover({ position: { x: 150, y: 80 } });
  await expect(sheen).toHaveCount(1);
  await expect(sheen).toHaveCSS('opacity', '1');
});
