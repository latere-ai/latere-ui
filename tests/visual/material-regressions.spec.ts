import { test, expect, visit, setPreferences } from './fixtures';
import type { Locator, Page } from '@playwright/test';

async function insetEdges(surface: Locator) {
  return surface.evaluate(el => getComputedStyle(el).boxShadow
    .split(/,(?![^()]*\))/)
    .filter(shadow => shadow.includes('inset'))
    .map(shadow => {
      const color = shadow.match(/rgba?\(([^)]+)\)/)![1].split(',').map(Number);
      const lengths = shadow.replace(/rgba?\([^)]+\)/, '').match(/-?[\d.]+px/g)!.map(parseFloat);
      return { y: lengths[1], alpha: color[3] ?? 1 };
    }));
}

for (const framework of ['vue', 'react']) {
  for (const theme of ['light', 'dark']) {
    test(`${framework} smoke rims follow their inverse surface in ${theme}`, async ({ page }) => {
      await visit(page, framework, 'containers', theme);
      const smoke = page.locator('.lu-gs.lu-glass-smoke');
      expect(await smoke.count()).toBeGreaterThan(1);
      for (const surface of await smoke.all()) {
        const edges = await insetEdges(surface);
        expect(edges.every(edge => Math.abs(edge.y) <= 1), 'Smoke uses a single-pixel optical rim').toBe(true);
        const contrastingEdge = edges.find(edge => theme === 'light' ? edge.y > 0 : edge.y < 0)!;
        expect(contrastingEdge.alpha, 'Inverse fill must not inherit the opposite material’s high-contrast rim').toBeLessThanOrEqual(0.25);
      }
      const interactive = page.locator('.lu-gs.lu-glass-smoke.lu-gs-interactive');
      await interactive.hover();
      await expect.poll(async () => {
        const edges = await insetEdges(interactive);
        return edges.find(edge => theme === 'light' ? edge.y > 0 : edge.y < 0)!.alpha;
      }, { message: 'Hover must retain the smoke-specific rim treatment' }).toBeLessThanOrEqual(0.25);
      // The translucent material also uses a restrained one-pixel optical edge.
      const regular = await insetEdges(page.locator('.lu-gs.lu-glass').first());
      expect(regular.find(edge => edge.y > 0)?.y).toBe(1);
    });

    for (const contrast of ['no-preference', 'more'] as const) {
      test(`${framework} materials stay opaque with reduced transparency in ${theme}, contrast ${contrast}`, async ({ page }) => {
        await setPreferences(page, { transparency: 'reduce', contrast });
        await visit(page, framework, 'containers', theme);
        const materials = page.locator('.lu-gs');
        expect(await materials.count()).toBeGreaterThanOrEqual(5);
        for (const surface of await materials.all()) {
          const paint = await surface.evaluate(el => {
            const style = getComputedStyle(el);
            const rgba = style.backgroundColor.match(/[\d.]+/g)!.map(Number);
            return { alpha: rgba[3] ?? 1, filter: style.backdropFilter, material: el.className };
          });
          expect(paint.alpha, `Opaque fill required: ${paint.material}`).toBe(1);
          expect(paint.filter, `No backdrop effects: ${paint.material}`).toBe('none');
        }
      });
    }
  }
}


async function interiorDifference(page: Page, before: Buffer, after: Buffer) {
  return page.evaluate(async ({ first, second }) => {
    const read = async (data: string) => {
      const image = new Image();
      image.src = 'data:image/png;base64,' + data;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height);
    };
    const a = await read(first);
    const b = await read(second);
    // Exclude rounded corners, borders, and outside shadows. Content underneath
    // a reading surface must not change any painted pixel in its interior.
    const inset = Math.ceil(8 * devicePixelRatio);
    const sideInset = Math.ceil(30 * devicePixelRatio);
    let difference = 0;
    for (let y = inset; y < a.height - inset; y++) {
      for (let x = sideInset; x < a.width - sideInset; x++) {
        const index = (y * a.width + x) * 4;
        for (let channel = 0; channel < 3; channel++) {
          difference = Math.max(difference, Math.abs(a.data[index + channel] - b.data[index + channel]));
        }
      }
    }
    return difference;
  }, { first: before.toString('base64'), second: after.toString('base64') });
}

for (const theme of ['light', 'dark']) {
  test(`thick toast occludes the underlying page text in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, 'vue', 'toast', theme);
    await page.getByRole('button', { name: 'Show notifications' }).click();
    const toast = page.locator('.lu-toast').first();
    await expect(toast).toHaveCSS('opacity', '1');
    await expect(toast).not.toHaveClass(/enter/);
    const before = await toast.screenshot();
    await page.locator('#app > header').evaluate(el => { (el as HTMLElement).style.visibility = 'hidden'; });
    const after = await toast.screenshot();
    expect(await interiorDifference(page, before, after), 'Page text must not show through a toast').toBeLessThanOrEqual(1);
  });

  for (const framework of ['vue', 'react']) {
    test(`${framework} thick nested modal occludes the first dialog text in ${theme}`, async ({ page }) => {
      await visit(page, framework, 'modal', theme);
      await page.getByRole('button', { name: 'Open modal', exact: true }).click();
      await page.getByRole('button', { name: framework === 'vue' ? 'Open nested modal' : 'Create project', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(2);
      const foreground = page.getByRole('dialog').last();
      await expect(foreground).toHaveCSS('opacity', '1');
      await expect(foreground.locator('..')).not.toHaveClass(/enter/);
      const before = await foreground.screenshot();
      await page.getByRole('dialog').first().evaluate(el => {
        for (const child of Array.from(el.children)) (child as HTMLElement).style.visibility = 'hidden';
      });
      const after = await foreground.screenshot();
      expect(await interiorDifference(page, before, after), 'Behind-dialog text must not show through the active dialog').toBeLessThanOrEqual(1);
    });
  }
}

test('thick overlay backing follows a dark subtree and works without host surface tokens', async ({ page }) => {
  await visit(page, 'vue', 'containers', 'light');
  const scope = page.locator('.material-stage');
  const thick = scope.locator('.lu-glass-thick');
  await expect(thick).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await scope.evaluate(el => { (el as HTMLElement).dataset.theme = 'dark'; });
  await expect(thick).toHaveCSS('background-color', 'rgb(17, 17, 19)');
  await scope.evaluate(el => { (el as HTMLElement).style.setProperty('--bg-surface', 'initial'); });
  await expect(thick).toHaveCSS('background-color', 'rgb(17, 17, 19)');
});
