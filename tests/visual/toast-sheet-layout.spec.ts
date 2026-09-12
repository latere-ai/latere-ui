import { test, expect, visit, prepare } from './fixtures';

for (const framework of ['vue', 'react']) for (const design of ['default', 'replichai', 'wallfacer', 'origo']) {
  test(`${design} ${framework} mobile toast sheet leaves its caption and trigger readable`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(page, framework, 'toast', 'light', `&parity=1${design === 'default' ? '' : `&design=${design}`}`);
    await prepare(page, framework, 'toast');
    const stack = page.locator('.lu-toaster');
    const heading = page.locator('#app > header');
    await expect.poll(async () => (await heading.boundingBox())!.y - ((await stack.boundingBox())!.y + (await stack.boundingBox())!.height)).toBeGreaterThanOrEqual(16);
    await expect(page.getByRole('button', { name: 'Show notifications' })).toBeInViewport();
    for (let remaining = await stack.locator('.lu-toast').count(); remaining > 0; remaining--) {
      await stack.locator('.lu-toast').first().click();
      await expect(stack.locator('.lu-toast')).toHaveCount(remaining - 1);
    }
    await expect(stack.locator('.lu-toast')).toHaveCount(0);
    await expect.poll(async () => (await heading.boundingBox())!.y).toBe(16);
  });
}
