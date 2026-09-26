// @vitest-environment node
// latere-ui/structured-data runs where a static build or a server renders
// pages: no window, no document. The Vue and React entries stay free of it.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, it } from 'vitest';

import { book, chapter, jsonLdScript, mountJsonLd } from '../src/structured-data/index';

it('builds and serializes without a DOM', () => {
  expect(typeof document).toBe('undefined');
  const en = book({ '@id': 'https://book.example.com/en/', name: 'An Example Book', url: 'https://book.example.com/en/', inLanguage: 'en' });
  const script = jsonLdScript([
    en,
    chapter({ name: 'Scheduling', url: 'https://book.example.com/en/scheduling/', isPartOf: en, position: 3 }),
  ]);
  expect(script.startsWith('<script type="application/ld+json">')).toBe(true);
  const text = script.slice('<script type="application/ld+json">'.length, -'</script>'.length);
  expect(JSON.parse(text)['@graph']).toHaveLength(2);
});

it('makes mountJsonLd a no-op without a document', () => {
  const remove = mountJsonLd(book({ name: 'An Example Book', url: 'https://book.example.com/en/' }));
  expect(typeof remove).toBe('function');
  expect(() => remove()).not.toThrow();
});

it('is not part of the Vue or React entries', () => {
  for (const entry of ['src/index.ts', 'src/react/index.ts']) {
    expect(readFileSync(resolve(process.cwd(), entry), 'utf8')).not.toContain('structured-data');
  }
});
