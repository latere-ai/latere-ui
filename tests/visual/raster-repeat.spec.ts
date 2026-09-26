import { goldenTest as test, expect, visit } from './fixtures';
import { captureExact } from './exact-golden';
import { comparePixels } from './exact-pixels';

// The command palette's row icons are stroke paths inside a composited layer.
// When Chromium split that layer into 256-pixel raster tiles, the hosted
// macOS 15 runner drew the icon edges with one of two pixel patterns from one
// render to the next (about one render in four took the second one), which
// broke the exact Vue/React palette comparison. The reference browser
// arguments rasterize the layer as one tile; sixteen renders in a row, from
// both adapters, must then match exactly.
test('tree palette icons rasterize identically across repeated renders', async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1100, height: 850 });
  let reference: Buffer | undefined;
  for (let render = 0; render < 16; render++) {
    const framework = render % 2 ? 'react' : 'vue';
    await visit(page, framework, 'palette', 'light', '&parity=1&tree=true');
    await page.getByRole('button', { name: 'Open palette' }).click();
    await expect(page.getByRole('option')).toHaveCount(9);
    const frame = await captureExact(page, { clip: (await page.locator('.lu-cp').boundingBox())! });
    if (reference) {
      const comparison = comparePixels(reference, frame);
      if (!comparison.equal) {
        await test.info().attach('first', { body: reference, contentType: 'image/png' });
        await test.info().attach('repeat', { body: frame, contentType: 'image/png' });
        if (comparison.diff) await test.info().attach('diff', { body: comparison.diff, contentType: 'image/png' });
      }
      expect(comparison.equal, `render ${render} (${framework}): ${comparison.message}`).toBe(true);
    }
    reference ??= frame;
  }
});
