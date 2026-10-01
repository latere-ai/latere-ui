import { existsSync, readFileSync, readdirSync } from 'node:fs';
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

// A component's shared stylesheet (src/styles/components/<kebab>.css), or null
// when the component carries no stylesheet of its own.
function sharedSheet(componentFile: string): string | null {
  const kebab = componentFile
    .replace(/\.tsx$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
  const rel = `src/styles/components/${kebab}.css`;
  return existsSync(resolve(root, rel)) ? rel : null;
}

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

  it('puts footer links and the theme and language menu triggers on the ink ring', () => {
    const css = read('src/styles/footer.css');
    expect(css, 'footer.css must style .site-footer a:focus-visible').toContain('.site-footer a:focus-visible');
    expect(css).toContain('var(--focus-outline');
    const menus = read('src/styles/components/preference-menu.css');
    expect(menus).toMatch(/\.lu-pref-trigger:focus-visible \{ outline: var\(--focus-outline/);
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
      'ConsoleSidebar.tsx': 'src/styles/console.css',
      'SiteFooter.tsx': 'src/styles/footer.css',
      'DocsLayout.tsx': 'src/styles/docs.css',
      'OrgSwitcher.tsx': null, // headless by design
      // The two preference menus share one trigger sheet.
      'ThemeMenu.tsx': 'src/styles/components/preference-menu.css',
      'LocaleMenu.tsx': 'src/styles/components/preference-menu.css',
    };
    const components = readdirSync(resolve(root, 'src/react')).filter((n) =>
      n.endsWith('.tsx'),
    );
    expect(components.length).toBeGreaterThan(0);
    for (const name of components) {
      const src = read(`src/react/${name}`);
      if (!/<button|<a\s/.test(src)) continue;
      if (name in external) {
        const sheet = external[name];
        if (sheet) expect(read(sheet)).toContain(':focus-visible');
        continue;
      }
      // Components keep their styles in the shared per-component sheet; the
      // gate follows the styles there.
      const shared = sharedSheet(name);
      if (shared) {
        expect(read(shared), `${shared} must style :focus-visible`).toContain(':focus-visible');
        continue;
      }
      expect(src.includes(':focus-visible'), `${name} must style :focus-visible`).toBe(true);
    }
  });

  it('sweep: focus outlines go through the shared token, never hardcoded', () => {
    const components = readdirSync(resolve(root, 'src/react')).filter((n) =>
      n.endsWith('.tsx'),
    );
    const sheets = existsSync(resolve(root, 'src/styles/components'))
      ? readdirSync(resolve(root, 'src/styles/components'))
          .filter((n) => n.endsWith('.css'))
          .map((n) => `src/styles/components/${n}`)
      : [];
    const sources = [...components.map((n) => `src/react/${n}`), ...sheets];
    for (const path of sources) {
      const src = read(path);
      for (const line of src.split('\n')) {
        if (!line.includes('outline:') || line.includes('outline: none')) continue;
        // Every outline declaration must resolve from the token first.
        expect(line.includes('var(--focus-outline'), `${path}: ${line.trim()}`).toBe(true);
      }
    }
  });
});
