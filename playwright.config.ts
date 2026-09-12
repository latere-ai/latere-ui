import { defineConfig } from '@playwright/test';
import { figureScale, referencePlatform } from './tests/visual/reference-settings';

export default defineConfig({
  testDir: './tests/visual',
  globalTeardown: './tests/visual/finish-references.ts',
  testMatch: '**/*.spec.ts',
  outputDir: './output/playwright/results',
  snapshotPathTemplate: `{testDir}/goldens/${referencePlatform}/{arg}{ext}`,
  updateSnapshots: 'none',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: [['list'], ['html', { outputFolder: 'output/playwright/report', open: 'never' }]],
  expect: { timeout: 15000, toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'device', maxDiffPixels: 0 } },
  use: {
    browserName: 'chromium',
    viewport: { width: 1100, height: 850 },
    deviceScaleFactor: figureScale,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'light',
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    launchOptions: { args: ['--disable-lcd-text'] },
  },
  webServer: {
    command: 'bun run visual:dev',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
