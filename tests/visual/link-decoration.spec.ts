import { type Locator } from '@playwright/test';
import { test, expect, visit, prepare } from './fixtures';
import { designs } from './design-manifest';

async function expectUndecorated(links: Locator) {
  expect(await links.count(), 'The fixture must exercise real links').toBeGreaterThan(0);
  const decorated = await links.evaluateAll(elements => elements.flatMap(element => {
    // Decorations propagate through inline descendants; resetting a wordmark
    // span cannot remove an underline painted by its parent anchor.
    const ancestors = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
      const decoration = getComputedStyle(node).textDecorationLine;
      if (decoration !== 'none') ancestors.push(`${node.tagName}.${node.className}: ${decoration}`);
    }
    return ancestors.length ? [{ link: element.textContent?.trim() || element.getAttribute('title'), ancestors }] : [];
  }));
  expect(decorated, 'Navigation and wordmarks must not inherit resting underlines').toEqual([]);
}

// Every component that renders anchors, including teleported menus and the
// sidebar inside a workspace. Prose retains its separately defined link style.
const linkSheets = ['workspace', 'sidebar', 'sidebar-collapsed', 'docs', 'account', 'products', 'footer', 'footer-compact'];
for (const framework of ['vue', 'react']) for (const design of ['default', ...designs]) {
  for (const theme of ['light', 'dark']) for (const layout of ['desktop', 'mobile']) {
    test(`${framework} ${design} ${theme} ${layout} link decoration contract`, async ({ page }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width: layout === 'mobile' ? 390 : 1280, height: 850 });
      for (const scenario of linkSheets) await test.step(scenario, async () => {
        await visit(page, framework, scenario, theme, `&parity=1&accountLinks=true&design=${design}`);
        await prepare(page, framework, scenario);
        await page.mouse.move(0, 0);
        const links = page.locator('a[href]:not(.lu-docs-body a)');
        await expectUndecorated(links);

        // Consumers need no global reset. An ordinary host rule, even loaded
        // later, must not change navigation or suppress unrelated prose links.
        await page.addStyleTag({ content: 'a { text-decoration: underline; }' });
        await expectUndecorated(links);
        await page.evaluate(() => {
          const prose = document.createElement('a');
          prose.id = 'host-prose-link';
          prose.href = '#host-prose';
          prose.textContent = 'Host article reference';
          document.body.append(prose);
        });
        await expect(page.locator('#host-prose-link')).toHaveCSS('text-decoration-line', 'underline');

        if (scenario.startsWith('footer')) {
          const navigation = page.locator('.footer-col a, .footer-compact-links a').first();
          await navigation.hover();
          await expect(navigation).toHaveCSS('text-decoration-line', 'underline');
          await page.mouse.move(0, 0);
          await page.keyboard.press('Tab');
          await navigation.focus();
          await expect(navigation).toHaveCSS('text-decoration-line', 'none');
          await expect(navigation).toHaveCSS('outline-style', 'solid');
          expect(await navigation.evaluate(element => element.matches(':focus-visible'))).toBe(true);
          if (scenario === 'footer') {
            const brand = page.locator('.logo-link');
            await brand.hover();
            await expectUndecorated(brand);
          }
        }
      });
    });
  }
}
