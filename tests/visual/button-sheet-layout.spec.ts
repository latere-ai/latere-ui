import { test, expect, visit } from './fixtures';
import { buttonSizes, buttonVariants } from './parity-data';
import { captureExact } from './exact-golden';
import { comparePixels } from './exact-pixels';

for (const framework of ['vue', 'react']) for (const width of [390, 1100]) {
  test(`${framework} button sheet keeps each variant with its states at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await visit(page, framework, 'buttons', 'light', '&parity=1');
    for (const size of buttonSizes) for (const variant of buttonVariants) {
      const group = page.getByRole('group', { name: `${variant} ${size} states`, exact: true });
      await expect(group.getByRole('button')).toHaveCount(3);
      const boxes = await Promise.all((await group.getByRole('button').all()).map(button => button.boundingBox()));
      expect(boxes.every(box => box!.y === boxes[0]!.y)).toBe(true);
      expect(boxes[0]!.x).toBeLessThan(boxes[1]!.x);
      expect(boxes[1]!.x).toBeLessThan(boxes[2]!.x);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const theme of ['light', 'dark']) {
  test(`Origo button captions have identical glyph shaping in ${theme}`, async ({ page }) => {
    const frames: Buffer[] = [];
    for (const framework of ['vue', 'react']) {
      await visit(page, framework, 'buttons', theme, '&parity=1&design=origo');
      const caption = page.locator('[data-component="GlassButton"] .sample-label').first();
      await expect(caption).toHaveText('Buttons / md');
      frames.push(await captureExact(page, { clip: (await caption.boundingBox())! }));
    }
    const comparison = comparePixels(frames[0], frames[1]);
    expect(comparison.equal, comparison.message).toBe(true);
  });
}
