import { PNG } from 'pngjs';
import { errors } from '@playwright/test';
import { test, expect, visit, prepare } from './fixtures';
import { captureExact } from './exact-golden';
import { comparePixels } from './exact-pixels';

for (const scenario of ['account', 'footer', 'footer-compact']) {
  test(`exact captures repeat inline SVG ${scenario} across adapters`, async ({ page }) => {
    test.setTimeout(120000);
    let reference: Buffer | undefined;
    for (let repeat = 0; repeat < 6; repeat++) for (const framework of ['vue', 'react']) {
      await visit(page, framework, scenario, 'light', '&parity=1');
      await prepare(page, framework, scenario);
      const actual = await captureExact(page, { fullPage: true });
      if (reference) expect(comparePixels(reference, actual).changedPixels, `${framework} mount ${repeat}`).toBe(0);
      else reference = actual;
    }
  });
}

test('capture waits for deferred finite animation and freezes infinite animation at its first frame', async ({ page }) => {
  await page.setContent('<div id="finite" style="position:absolute;inset:0;width:20px;height:20px;background:red"></div><div id="loop" style="position:absolute;left:30px;top:0;width:20px;height:20px;background:green"></div>');
  await page.evaluate(() => {
    const loop = document.querySelector('#loop')!.animate([{ background: 'rgb(0, 0, 255)' }, { background: 'rgb(255, 0, 0)' }], { duration: 1000, iterations: Infinity });
    loop.id = 'capture-loop'; loop.pause(); loop.currentTime = 500;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelector('#finite')!.animate([{ background: 'red' }, { background: 'rgb(255, 255, 0)' }], { duration: 200, fill: 'forwards' });
    }));
  });
  const png = PNG.sync.read(await captureExact(page));
  const scale = await page.evaluate(() => devicePixelRatio);
  const pixel = (x: number, y: number) => [...png.data.subarray((Math.floor(y * scale) * png.width + Math.floor(x * scale)) * 4, (Math.floor(y * scale) * png.width + Math.floor(x * scale)) * 4 + 4)];
  expect(pixel(10, 10)).toEqual([255, 255, 0, 255]);
  expect(pixel(40, 10)).toEqual([0, 0, 255, 255]);
  expect(await page.evaluate(() => {
    const loop = document.getAnimations().find(animation => animation.id === 'capture-loop')!;
    return { state: loop.playState, time: loop.currentTime };
  })).toEqual({ state: 'paused', time: 500 });
});

test('capture restores running and paused animation state when screenshot fails', async ({ page }) => {
  await page.setContent('<div id="running"></div><div id="paused"></div>');
  await page.evaluate(() => {
    for (const id of ['running', 'paused']) {
      const animation = document.getElementById(id)!.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, iterations: Infinity });
      animation.id = id; animation.currentTime = 400;
      if (id === 'paused') animation.pause();
    }
  });
  const screenshot = page.screenshot.bind(page);
  page.screenshot = async () => {
    expect(await page.evaluate(() => document.getAnimations().map(animation => ({ state: animation.playState, time: animation.currentTime })))).toEqual([
      { state: 'paused', time: 0 }, { state: 'paused', time: 0 },
    ]);
    throw new Error('Deliberate capture failure');
  };
  try { await expect(captureExact(page)).rejects.toThrow('Deliberate capture failure'); }
  finally { page.screenshot = screenshot; }
  expect(await page.evaluate(() => document.getAnimations().map(animation => ({ id: animation.id, state: animation.playState, time: animation.currentTime })))).toEqual([
    { id: 'running', state: 'running', time: expect.any(Number) },
    { id: 'paused', state: 'paused', time: 400 },
  ]);
});

test('capture follows chained finite animations and handles cancellation', async ({ page }) => {
  await page.setContent('<div id="box" style="position:absolute;inset:0;width:20px;height:20px;background:red"></div>');
  await page.evaluate(() => {
    const box = document.getElementById('box')!;
    const cancelled = box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 10000 });
    const first = box.animate([{ background: 'red' }, { background: 'blue' }], { duration: 100 });
    first.finished.then(() => {
      cancelled.cancel();
      box.animate([{ background: 'blue' }, { background: 'rgb(0, 255, 0)' }], { duration: 100, fill: 'forwards' });
    });
  });
  const png = PNG.sync.read(await captureExact(page));
  const scale = await page.evaluate(() => devicePixelRatio);
  const offset = (Math.floor(10 * scale) * png.width + Math.floor(10 * scale)) * 4;
  expect([...png.data.subarray(offset, offset + 4)]).toEqual([0, 255, 0, 255]);
});

test('capture recovers screenshot timeouts and requires two fresh exact captures afterward', async ({ page }) => {
  await page.setContent('<div style="width:20px;height:20px;background:blue"></div>');
  const screenshot = page.screenshot.bind(page);
  let calls = 0;
  page.screenshot = async options => {
    calls++;
    expect(options?.timeout).toBeGreaterThan(0);
    expect(options?.timeout).toBeLessThanOrEqual(5000);
    expect(options).toMatchObject({ animations: 'allow', scale: 'device', fullPage: true });
    if (calls === 1 || calls === 3) throw new errors.TimeoutError('Simulated stalled screenshot transport');
    return screenshot(options);
  };
  try {
    const actual = await captureExact(page, { fullPage: true });
    expect(PNG.sync.read(actual).width).toBeGreaterThan(0);
    expect(calls).toBe(5);
  } finally { page.screenshot = screenshot; }
});

test('capture bounds an initial screenshot timeout with the stability deadline', async ({ page }) => {
  await page.setContent('<div>Static content</div>');
  const screenshot = page.screenshot.bind(page);
  const now = Date.now;
  let elapsed = 0;
  let calls = 0;
  Date.now = () => now() + elapsed;
  page.screenshot = async () => {
    calls++;
    elapsed = 16000;
    throw new errors.TimeoutError('Simulated unresponsive renderer');
  };
  try {
    await expect(captureExact(page)).rejects.toThrow(/exactly identical RGBA captures within 15 seconds.*screenshot timed out/s);
    expect(calls).toBe(1);
  } finally { Date.now = now; page.screenshot = screenshot; }
});

test('capture preserves a non-timeout screenshot failure when page cleanup also fails', async ({ page }) => {
  await page.setContent('<div>Static content</div>');
  const screenshot = page.screenshot.bind(page);
  let calls = 0;
  page.screenshot = async () => {
    calls++;
    await page.close();
    throw new Error('Original screenshot transport failure');
  };
  try {
    await expect(captureExact(page)).rejects.toThrow('Original screenshot transport failure');
    expect(calls).toBe(1);
  } finally { page.screenshot = screenshot; }
});
