import { test, expect, type Page } from '@playwright/test';

import { book, breadcrumbList, chapter, jsonLdScript, person } from '../../src/structured-data';

// Structured data through Chromium's own HTML parser: a server-rendered
// script element holding hostile strings stays one inert element whose text
// parses back to the page's data, and a browser-only page keeps exactly one
// element per key across navigations.

const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
const hostile = `</script><script>window.injected = 1</script><!-- <script>window.injected = 2</script> --> & ${LS}${PS}`;

type Probe = { structuredData: { navigate(headline: string): void; clear(): void } };

const scripts = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]'), (element) => ({
      key: element.getAttribute('data-lu-structured-data'),
      data: JSON.parse(element.textContent ?? '') as Record<string, unknown>,
    })),
  );

test('a server-rendered script element survives the HTML parser intact', async ({ page }) => {
  const dialogs: string[] = [];
  page.on('dialog', (dialog) => {
    dialogs.push(dialog.message());
    void dialog.dismiss();
  });

  const en = book({
    '@id': 'https://book.example.com/en/',
    name: `An Example Book ${hostile}`,
    url: 'https://book.example.com/en/',
    inLanguage: 'en',
    license: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
  });
  const nodes = [
    chapter({
      name: hostile,
      url: 'https://book.example.com/en/scheduling/</script><script>window.injected = 3</script>',
      isPartOf: en,
      position: 3,
      inLanguage: 'en',
      author: person({ name: hostile }),
      workTranslation: { url: 'https://book.example.com/zh/scheduling/', inLanguage: 'zh-CN', name: hostile },
    }),
    breadcrumbList([{ name: hostile, url: 'https://book.example.com/en/' }, { name: hostile }]),
  ];
  const script = jsonLdScript(nodes);

  await page.setContent(
    `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Chapter</title>${script}</head>` +
      '<body><p id="after">Body content after the head.</p></body></html>',
  );

  expect(await page.evaluate(() => (window as unknown as { injected?: number }).injected)).toBeUndefined();
  expect(dialogs).toEqual([]);
  // The head holds exactly the elements written, and the body is where it
  // was: nothing in the JSON ended the script element or opened a comment.
  expect(await page.evaluate(() => Array.from(document.head.children, (element) => element.tagName))).toEqual([
    'META',
    'TITLE',
    'SCRIPT',
  ]);
  await expect(page.locator('body > p#after')).toHaveText('Body content after the head.');

  const found = await scripts(page);
  expect(found).toHaveLength(1);
  expect(found[0].data).toStrictEqual(JSON.parse(JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes.map(({ '@context': _context, ...member }) => member),
  })));
});

test('a browser-only page keeps one element per key across navigations', async ({ page }) => {
  await page.goto('/structured-data.html');
  await expect.poll(async () => (await scripts(page)).length).toBe(1);

  let found = await scripts(page);
  expect(found[0].key).toBe('page');
  expect(found[0].data).toMatchObject({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: 'First' });

  await page.evaluate(() => (window as unknown as Probe).structuredData.navigate('Second'));
  found = await scripts(page);
  expect(found).toHaveLength(1);
  expect(found[0].data.headline).toBe('Second');

  await page.evaluate(() => (window as unknown as Probe).structuredData.clear());
  expect(await scripts(page)).toEqual([]);
});
