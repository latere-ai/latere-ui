import { expect as baseExpect, test, type Page } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { comparePixels } from './exact-pixels';
import { withPngDensity } from './png-density';
import { figureDpi } from './reference-settings';

type CaptureOptions = Pick<NonNullable<Parameters<Page['screenshot']>[0]>, 'fullPage' | 'clip'>;
/** Two identical captures are required; no channel tolerance or antialias skipping. */
export async function captureExact(page: Page, options: CaptureOptions = {}) {
  await page.evaluate(() => document.fonts.ready);
  const paused = await page.evaluateHandle(async () => {
    const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    // Vue starts entering transitions on the second animation frame. Observe
    // that lifecycle before checking actual animations, including chained ones.
    while (true) {
      await frame(); await frame();
      const finite = document.getAnimations().filter(animation =>
        animation.effect?.getComputedTiming().iterations !== Infinity &&
        (animation.playState === 'running' || animation.pending));
      if (!finite.length) break;
      await Promise.all(finite.map(animation => animation.finished.catch(() => {})));
    }
    const saved = document.getAnimations()
      .filter(animation => animation.effect?.getComputedTiming().iterations === Infinity)
      .map(animation => ({ animation, time: animation.currentTime, state: animation.playState }));
    for (const { animation } of saved) { animation.pause(); animation.currentTime = 0; }
    await Promise.all(saved.map(({ animation }) => animation.ready));
    return saved;
  });
  try {
    return await captureStable(page, options);
  } finally {
    try {
      await page.evaluate(saved => {
        for (const { animation, time, state } of saved) {
          animation.currentTime = time;
          if (state === 'running') animation.play();
          else if (state === 'idle') animation.cancel();
          else animation.pause();
        }
      }, paused);
    } finally { await paused.dispose(); }
  }
}

async function captureStable(page: Page, options: CaptureOptions) {
  // Playwright's animation override changes SVG rasterization between mounts.
  // Capture the settled timeline directly, preserving exact RGBA comparison.
  const capture = () => page.screenshot({ ...options, animations: 'allow', caret: 'hide', scale: 'device' });
  let previous = await capture();
  let unstable: { expected: Buffer; actual: Buffer } | undefined;
  const deadline = Date.now() + 15000;
  do {
    const next = await capture();
    if (previous.equals(next) || comparePixels(previous, next).equal) return next;
    unstable = { expected: previous, actual: next };
    previous = next;
  } while (Date.now() < deadline);
  if (unstable) {
    for (const [name, data] of Object.entries(unstable)) writeFileSync(test.info().outputPath(`unstable-${name}.png`), data);
  }
  throw new Error('Rendering did not settle to two exactly identical RGBA captures within 15 seconds');
}

export const expect = baseExpect.extend({
  async toMatchGolden(page: Page | Buffer, name: string, options: CaptureOptions = {}) {
    if (this.isNot) throw new Error('Golden verification does not support negation');
    const info = test.info();
    const path = info.snapshotPath(name);
    const actual = Buffer.isBuffer(page) ? page : await captureExact(page, options);
    const update = info.config.updateSnapshots;
    const exists = existsSync(path);
    const expected = exists ? readFileSync(path) : undefined;
    const comparison = expected ? comparePixels(expected, actual) : undefined;
    if (update === 'all' || (update === 'changed' && !comparison?.equal) || (update === 'missing' && !exists)) {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, withPngDensity(actual, figureDpi));
      return { pass: true, message: () => `Recorded ${name}` };
    }
    if (!comparison?.equal) {
      await info.attach(`${name}-actual`, { body: actual, contentType: 'image/png' });
      if (expected) await info.attach(`${name}-expected`, { body: expected, contentType: 'image/png' });
      if (comparison?.diff) await info.attach(`${name}-diff`, { body: comparison.diff, contentType: 'image/png' });
    }
    return { pass: comparison?.equal ?? false, message: () => `${path}: ${comparison?.message ?? 'Missing golden; explicit recording and review required'}` };
  },
});
