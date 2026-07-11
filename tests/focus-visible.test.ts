import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

// The browser-default blue :focus-visible outline is off-brand (founder
// finding: Space on a sidebar nav item drew a heavy blue ring). The library
// treatment is the --focus-outline token: an ink ring off the accent, defined
// in the token layer and consumed by every interactive component. These tests
// pin the token, the stylesheet coverage, and a sweep so no interactive
// component regresses to the default blue.

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

describe('focus-visible treatment', () => {
  it('defines the --focus-outline token for the light and dark themes', () => {
    const tokens = read('src/styles/tokens.css');
    const defs = tokens.match(/--focus-outline:\s*2px solid var\(--accent\);/g) ?? [];
    expect(defs.length).toBe(2); // :root and [data-theme="dark"]
  });

  it('puts every interactive console sidebar element on the ink ring', () => {
    const css = read('src/styles/console.css');
    for (const sel of [
      '.lu-cs-item:focus-visible',
      '.lu-cs-brand:focus-visible',
      '.lu-cs-fold:focus-visible',
      '.lu-cs-search:focus-visible',
    ]) {
      expect(css, `console.css must style ${sel}`).toContain(sel);
    }
    expect(css).toContain('var(--focus-outline');
  });

  it('puts footer links, theme segments, and the locale select on the ink ring', () => {
    const css = read('src/styles/footer.css');
    for (const sel of [
      '.site-footer a:focus-visible',
      '.footer-seg-btn:focus-visible',
      '.footer-lang-select:focus-visible',
    ]) {
      expect(css, `footer.css must style ${sel}`).toContain(sel);
    }
    expect(css).toContain('var(--focus-outline');
  });

  it('puts docs nav, pager, TOC, and body links on the ink ring', () => {
    const css = read('src/styles/docs.css');
    for (const sel of [
      '.lu-docs-link:focus-visible',
      '.lu-docs-pager-link:focus-visible',
      '.lu-docs-toc-link:focus-visible',
      '.lu-docs-body a:focus-visible',
    ]) {
      expect(css, `docs.css must style ${sel}`).toContain(sel);
    }
    expect(css).toContain('var(--focus-outline');
  });

  it('sweep: every interactive component styles :focus-visible (no default blue)', () => {
    // Interactive = renders a <button> or <a>. Components styled by an
    // external stylesheet are checked against that sheet; headless components
    // (hosts own all styling) are exempt.
    const external: Record<string, string | null> = {
      'ConsoleSidebar.vue': 'src/styles/console.css',
      'SiteFooter.vue': 'src/styles/footer.css',
      'DocsLayout.vue': 'src/styles/docs.css',
      'OrgSwitcher.vue': null, // headless by design
    };
    const components = readdirSync(resolve(root, 'src/components')).filter((n) =>
      n.endsWith('.vue'),
    );
    expect(components.length).toBeGreaterThan(0);
    for (const name of components) {
      const src = read(`src/components/${name}`);
      if (!/<button|<a\s/.test(src)) continue;
      if (name in external) {
        const sheet = external[name];
        if (sheet) expect(read(sheet)).toContain(':focus-visible');
        continue;
      }
      expect(src.includes(':focus-visible'), `${name} must style :focus-visible`).toBe(true);
    }
  });

  it('sweep: focus outlines go through the shared token, never hardcoded', () => {
    const components = readdirSync(resolve(root, 'src/components')).filter((n) =>
      n.endsWith('.vue'),
    );
    for (const name of components) {
      const src = read(`src/components/${name}`);
      for (const line of src.split('\n')) {
        if (!line.includes('outline:') || line.includes('outline: none')) continue;
        // Every outline declaration must resolve from the token first.
        expect(line.includes('var(--focus-outline'), `${name}: ${line.trim()}`).toBe(true);
      }
    }
  });
});
