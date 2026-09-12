import { test, expect, visit, prepare, sheenInteraction } from './fixtures';
import { scenarios } from './manifest';
import { designs } from './design-manifest';
import { captureExact } from './exact-golden';
import { comparePixels } from './exact-pixels';
import { writeFileSync } from 'node:fs';

for (const design of ['default', ...designs]) for (const [scenario, components] of Object.entries(scenarios.vue)) {
  for (const theme of ['light', 'dark']) for (const layout of ['desktop', 'mobile']) {
    test(`parity ${design} ${scenario} ${theme} ${layout}`, async ({ page }, info) => {
      test.setTimeout(60000);
      await page.setViewportSize(layout === 'mobile' ? { width: 390, height: 844 }
        : { width: design === 'default' && scenario !== 'docs' ? 1100 : 1280, height: 850 });
      const captures: Record<string, Buffer> = {};
      for (const framework of ['vue', 'react']) {
        await visit(page, framework, scenario, theme, `&parity=1${design === 'default' ? '' : `&design=${design}`}`);
        await prepare(page, framework, scenario);
        for (const name of components) await expect(page.locator(`[data-component="${name}"]`).first()).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${framework} page overflow`).toBe(true);
        captures[framework] = await captureExact(page, { fullPage: true,
          interaction: scenario === 'effects' && design === 'default' ? sheenInteraction(page) : undefined });
      }
      const comparison = comparePixels(captures.vue, captures.react);
      if (!comparison.equal) {
        for (const framework of ['vue', 'react']) writeFileSync(info.outputPath(`${framework}.png`), captures[framework]);
        if (comparison.diff) writeFileSync(info.outputPath('diff.png'), comparison.diff);
        for (const framework of ['vue', 'react']) await info.attach(`${framework}-actual`, { body: captures[framework], contentType: 'image/png' });
        if (comparison.diff) await info.attach('adapter-diff', { body: comparison.diff, contentType: 'image/png' });
      }
      expect(comparison.equal, `Vue/React parity: ${comparison.message}`).toBe(true);
      // Each adapter has its own reference; recording never bypasses parity.
      for (const framework of ['vue', 'react']) {
        await expect(captures[framework]).toMatchGolden(`${design === 'default' ? '' : design + '-'}${framework}-${scenario}-${theme}-${layout}.png`);
      }
    });
  }
}
