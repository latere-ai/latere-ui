import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { test, expect } from './fixtures';
import { captureExact } from './exact-golden';

test('cold gallery startup preserves an open Vue overlay when React loads for the first time', async ({ page }) => {
  test.setTimeout(60000);
  const cacheDir = await mkdtemp(join(tmpdir(), 'latere-visual-vite-'));
  const server = await createServer({
    configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)),
    cacheDir,
    server: { port: 0, strictPort: false },
  });
  const reloads: unknown[] = [];
  const send = server.ws.send.bind(server.ws);
  server.ws.send = ((...args: Parameters<typeof send>) => {
    const payload: unknown = args[0];
    if (payload && typeof payload === 'object' && 'type' in payload && payload.type === 'full-reload') reloads.push(payload);
    return send(...args);
  }) as typeof server.ws.send;
  const react = await page.context().newPage();
  try {
    await server.listen();
    const address = server.httpServer!.address();
    if (!address || typeof address === 'string') throw new Error('Expected gallery TCP address');
    const base = `http://127.0.0.1:${address.port}`;
    await page.goto(`${base}/?framework=vue&scenario=account&theme=light&parity=1`);
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
    await page.locator('.lu-am-trigger').first().click();
    await captureExact(page);
    const originalDocument = await page.evaluateHandle(() => document);
    try {
      await react.goto(`${base}/?framework=react&scenario=footer&theme=light&parity=1`);
      await expect(react.locator('html')).toHaveAttribute('data-ready', 'true');
      await captureExact(react);
      expect(reloads, 'Loading a second adapter must not trigger a dependency-optimizer reload').toEqual([]);
      expect(await originalDocument.evaluate(original => original === document)).toBe(true);
      await expect(page.locator('.lu-am-dd')).toBeVisible();
    } finally { await originalDocument.dispose(); }
  } finally {
    await react.close();
    await page.goto('about:blank');
    await server.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
});
