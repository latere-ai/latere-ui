import { goldenTest as test, expect, visit } from './fixtures';
import { captureExact } from './exact-golden';
import { comparePixels } from './exact-pixels';

for (const framework of ['vue', 'react']) test(`${framework} laptop workspace raster stays stable across fresh mounts`, async ({ page }, testInfo) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1280, height: 720 });
  let reference: Buffer | undefined;
  for (let mount = 0; mount < 16; mount++) {
    await visit(page, framework, 'workspace', 'light', framework === 'react' ? '&parity=1' : '');
    if (mount % 2) {
      await page.setViewportSize({ width: 1, height: 1 });
      await page.setViewportSize({ width: 1280, height: 720 });
    }
    await page.evaluate(async phase => {
      for (const animation of document.getAnimations()) {
        if (animation.effect?.getComputedTiming().iterations === Infinity) animation.currentTime = phase;
      }
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }, (mount % 4) * 450);
    const actual = await captureExact(page, { fullPage: true });
    if (reference) {
      const diff = comparePixels(reference, actual);
      if (!diff.equal) {
        await testInfo.attach('first', { body: reference, contentType: 'image/png' });
        await testInfo.attach('repeat', { body: actual, contentType: 'image/png' });
        if (diff.diff) await testInfo.attach('diff', { body: diff.diff, contentType: 'image/png' });
      }
      expect(diff.changedPixels, `${framework} mount ${mount}: ${diff.message}`).toBe(0);
    }
    reference ??= actual;
  }
});
