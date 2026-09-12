import { test, expect, visit } from './fixtures';
import { captureExact } from './exact-golden';
import { comparePixels } from './exact-pixels';

for (const theme of ['light', 'dark']) for (const width of [390, 1280]) {
  test(`Replichai workspace count keeps identical glyph shaping after updates in ${theme} at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    const frames: Buffer[] = [];
    for (const framework of ['vue', 'react']) {
      await visit(page, framework, 'workspace', theme, '&parity=1&design=replichai');
      await page.getByRole('button', { name: 'New project', exact: true }).click();
      const count = page.locator('.workspace-section-heading');
      await expect(count).toContainText('9 projects');
      frames.push(await captureExact(page, { clip: (await count.boundingBox())! }));
    }
    const comparison = comparePixels(frames[0], frames[1]);
    expect(comparison.equal, comparison.message).toBe(true);
  });
}
