import type { Browser } from '@playwright/test';
import { goldenTest as test, expect, visit } from './fixtures';
import { captureExact } from './exact-golden';
import { comparePixels } from './exact-pixels';
import { figureScale, referenceBrowserArgs } from './reference-settings';

// These two tests share only their recorded evidence, never a browser process.
test.describe.configure({ mode: 'serial' });
// CDP exposes launch arguments only when automation is explicitly enabled.
test.use({ launchOptions: { args: [...referenceBrowserArgs, '--enable-automation'] } });
let previousBrowser: Browser;
let previousPixels: Buffer;

test('golden browser preserves the configured render environment', async ({ page, context }) => {
  previousBrowser = context.browser()!;
  expect(await page.evaluate(() => ({ scale: devicePixelRatio, width: innerWidth, height: innerHeight,
    locale: navigator.language, zone: Intl.DateTimeFormat().resolvedOptions().timeZone }))).toEqual({
    scale: figureScale, width: 1100, height: 850, locale: 'en-US', zone: 'UTC',
  });
  const cdp = await previousBrowser.newBrowserCDPSession();
  const { arguments: args } = await cdp.send('Browser.getBrowserCommandLine');
  for (const arg of referenceBrowserArgs) expect(args).toContain(arg);
  await cdp.detach();
  await page.setViewportSize({ width: 1280, height: 720 });
  await visit(page, 'vue', 'workspace', 'light');
  previousPixels = await captureExact(page, { fullPage: true });
});

test('next golden closes the previous browser and renders identical pixels in a fresh process', async ({ page, context }) => {
  expect(previousBrowser.isConnected(), 'the preceding golden browser must be closed').toBe(false);
  expect(context.browser()).not.toBe(previousBrowser);
  await page.setViewportSize({ width: 1280, height: 720 });
  await visit(page, 'vue', 'workspace', 'light');
  const actual = await captureExact(page, { fullPage: true });
  expect(comparePixels(previousPixels, actual).changedPixels).toBe(0);
});
