import { test, expect, visit } from './fixtures';
import { designs } from './design-manifest';

for (const framework of ['vue', 'react']) for (const design of ['default', ...designs]) {
  for (const theme of ['light', 'dark']) test(`${framework} ${design} ${theme} account identity separates name from metadata`, async ({ page }) => {
    test.setTimeout(60000);
    for (const width of [390, 768, 1280]) for (const scenario of ['account', 'sidebar']) {
      await page.setViewportSize({ width, height: 850 });
      await visit(page, framework, scenario, theme, `&parity=1&design=${design}&accountIdentity=true`);
      const identity = page.locator('.lu-am-id').first();
      if (scenario === 'account' && width === 390) {
        await expect(identity).toBeHidden();
        continue;
      }
      await expect(identity).toBeVisible();
      const name = (await identity.locator('.lu-am-id-name').boundingBox())!;
      const metadata = (await identity.locator('.lu-am-id-sub').boundingBox())!;
      const trigger = (await page.locator('.lu-am-trigger').first().boundingBox())!;
      expect.soft(metadata.y - (name.y + name.height), `${scenario} at ${width}px: name-to-metadata gap`).toBeGreaterThanOrEqual(4);
      expect.soft(name.y - trigger.y).toBeGreaterThanOrEqual(4);
      expect.soft(trigger.y + trigger.height - metadata.y - metadata.height).toBeGreaterThanOrEqual(4);
      expect.soft(metadata.x + metadata.width).toBeLessThanOrEqual(trigger.x + trigger.width);
      if (scenario === 'sidebar') {
        await visit(page, framework, 'sidebar-collapsed', theme, `&parity=1&design=${design}&accountIdentity=true`);
        await expect(identity).toBeHidden();
      } else {
        await page.locator('.lu-am-trigger').first().click();
        await expect(page.locator('.lu-am-dd')).toBeVisible();
        const menu = (await page.locator('.lu-am-dd').boundingBox())!;
        expect(menu.y - trigger.y - trigger.height).toBeGreaterThanOrEqual(8);
      }
    }
  });
}
