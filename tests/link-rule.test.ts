// The link rule the shared styles follow: a link in prose carries a constant,
// refined underline; nothing in the interface gains or loses an underline
// with the pointer.
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(process.cwd(), 'src/styles');
const sheets = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? sheets(join(dir, e.name)) : e.name.endsWith('.css') ? [join(dir, e.name)] : []);
const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('the link rule', () => {
  it('underlines prose links at rest with an offset hairline in a softened tone', () => {
    const css = strip(readFileSync(join(root, 'docs.css'), 'utf8'));
    const at = css.indexOf('.lu-docs-body a {');
    const rule = css.slice(at, css.indexOf('}', at));
    expect(rule).toMatch(/text-decoration-line: underline/);
    expect(rule).toMatch(/text-decoration-thickness: var\(--lu-link-underline-thickness, 1px\)/);
    expect(rule).toMatch(/text-underline-offset: var\(--lu-link-underline-offset, 0\.22em\)/);
    expect(rule).toMatch(/text-decoration-color: var\(--lu-link-underline-color, color-mix\(in srgb, currentColor 38%, transparent\)\)/);
  });

  it('never adds or removes an underline on hover anywhere in the shared styles', () => {
    const found: string[] = [];
    for (const path of sheets(root)) {
      for (const m of strip(readFileSync(path, 'utf8')).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (m[1].includes(':hover') && /text-decoration(?:-line)?\s*:\s*(?:underline|none)/.test(m[2])) found.push(`${path}: ${m[1].trim()}`);
      }
    }
    expect(found).toEqual([]);
  });
});
