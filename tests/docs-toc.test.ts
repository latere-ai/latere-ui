import { describe, expect, it } from 'vitest';

import { createToc, slugify } from '../src/docs/toc';

function article(html: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

describe('slugify()', () => {
  it('produces url-safe slugs', () => {
    expect(slugify('Getting Started!')).toBe('getting-started');
    expect(slugify('  Spaces  & symbols  ')).toBe('spaces-symbols');
    expect(slugify('')).toBe('section');
  });
  it('disambiguates duplicates within a used-set', () => {
    const used = new Set<string>();
    expect(slugify('Setup', used)).toBe('setup');
    expect(slugify('Setup', used)).toBe('setup-2');
    expect(slugify('Setup', used)).toBe('setup-3');
  });
});

describe('createToc().scan()', () => {
  it('extracts the heading outline at the configured levels', () => {
    const el = article('<h2>Intro</h2><p>x</p><h3>Details</h3><h4>Skip me</h4><h2>End</h2>');
    const toc = createToc();
    const items = toc.scan(el);
    expect(items.map((i) => i.text)).toEqual(['Intro', 'Details', 'End']);
    expect(items.map((i) => i.level)).toEqual([2, 3, 2]);
    expect(toc.activeId.value).toBe(items[0].id);
  });

  it('assigns slug ids to headings missing one, keeping existing ids', () => {
    const el = article('<h2 id="keep">Kept</h2><h2>Made Up</h2>');
    const toc = createToc();
    const items = toc.scan(el);
    expect(items[0].id).toBe('keep');
    expect(items[1].id).toBe('made-up');
    // the DOM heading was mutated with the assigned id
    expect(el.querySelectorAll('h2')[1].id).toBe('made-up');
  });

  it('skips empty headings', () => {
    const el = article('<h2></h2><h2>Real</h2>');
    expect(createToc().scan(el).map((i) => i.text)).toEqual(['Real']);
  });

  it('setActive overrides the active id', () => {
    const el = article('<h2>A</h2><h2>B</h2>');
    const toc = createToc();
    const items = toc.scan(el);
    toc.setActive(items[1].id);
    expect(toc.activeId.value).toBe(items[1].id);
  });

  it('is a no-op for a null container', () => {
    const toc = createToc();
    expect(toc.scan(null)).toEqual([]);
    expect(toc.items.value).toEqual([]);
  });
});
