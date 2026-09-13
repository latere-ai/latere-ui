import type { Locator } from '@playwright/test';
import { test, expect, visit } from './fixtures';
import { designs } from './design-manifest';

// Read actual line boxes, including words split across inline markup. Checking
// the CSS property alone would accept a baseline with the same orphaned word.
async function renderedLines(locator: Locator) {
  return locator.evaluate(element => {
    const lines = new Map<number, string[]>();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const match of node.textContent!.matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(node, match.index!);
        range.setEnd(node, match.index! + match[0].length);
        const top = range.getBoundingClientRect().top;
        const words = lines.get(top) ?? [];
        words.push(match[0]);
        lines.set(top, words);
      }
    }
    return [...lines.entries()].sort(([a], [b]) => a - b).map(([, words]) => words);
  });
}

for (const framework of ['vue', 'react']) for (const design of ['default', ...designs]) {
  for (const theme of ['light', 'dark']) test(`${framework} ${design} ${theme} tagline avoids a dangling final word`, async ({ page }) => {
    test.setTimeout(60000);
    for (const width of [320, 768, 1100, 1280]) await test.step(`${width}px`, async () => {
      await page.setViewportSize({ width, height: 900 });
      await visit(page, framework, 'footer', theme, `&parity=1&design=${design}`);
      const tagline = page.locator('.footer-tagline');
      for (const locale of ['en', 'de', 'zh']) {
        await page.locator('.footer-lang-select').selectOption(locale);
        await expect(page.locator('.footer-lang-select')).toHaveValue(locale);
        const lines = await renderedLines(tagline);
        if (locale !== 'zh') {
          expect.soft(lines.at(-1)!.length, `${locale}: ${lines.map(line => line.join(' ')).join(' / ')}`).toBeGreaterThanOrEqual(2);
          if (locale === 'en' && width >= 1100) {
            expect.soft(lines.map(line => line.join(' '))).toEqual(['Human intelligence', 'in the loop.']);
          }
        }
        expect.soft(await tagline.evaluate(element => element.scrollWidth <= element.clientWidth), `${locale} fits its text column`).toBe(true);
      }
    });

    // Host-provided copy receives the same behavior without hardcoded breaks.
    const tagline = page.locator('.footer-tagline');
    await tagline.evaluate(element => { element.innerHTML = 'Build <em>thoughtful tools</em> for everyone.'; });
    const lines = await renderedLines(tagline);
    expect(lines.at(-1)!.length, lines.map(line => line.join(' ')).join(' / ')).toBeGreaterThanOrEqual(2);
  });
}
