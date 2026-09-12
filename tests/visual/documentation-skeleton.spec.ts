import { readFileSync } from 'node:fs';
import { test, expect } from './fixtures';

test('design skeleton shows a window-integrated sidebar', async ({ page }) => {
  await page.setContent(readFileSync(new URL('../../docs/figures/design-skeleton.svg', import.meta.url), 'utf8'));
  const window = page.locator('rect[fill="url(#canvas)"]');
  const rail = page.locator('rect[fill="url(#glass)"]').first();
  // SVG geometry excludes the window's half-pixel outer border stroke.
  const geometry = (element: Element) => {
    const { x, y, height } = (element as SVGGraphicsElement).getBBox();
    return { x, y, height };
  };
  const frame = await window.evaluate(geometry);
  const navigation = await rail.evaluate(geometry);
  expect(navigation.x).toBe(frame.x);
  expect(navigation.y).toBe(frame.y);
  expect(navigation.height).toBe(frame.height);
  expect(await rail.evaluate(element => getComputedStyle(element.parentElement!).filter)).toBe('none');
  await expect(rail).toHaveAttribute('clip-path', 'url(#shell-clip)');
});
