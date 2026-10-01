// The tab icon is drawn outside the page's palette, so a theme change does not
// reach it: the mark is ink in a light tab and inverts in a dark one. The
// helper renders with react-dom/server, so the main entry must never reach it.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FAVICON_INK, FAVICON_INK_DARK, favicon, platformFaviconSvg } from '../favicon';
import { PlatformLogoMark } from '../PlatformLogoMark';

/** Every module the file imports, followed through relative specifiers. */
function importGraph(entry: string): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  const pending = [resolve(entry)];
  while (pending.length) {
    const file = pending.pop()!;
    if (graph.has(file)) continue;
    const specifiers = [...readFileSync(file, 'utf8').matchAll(/^\s*(?:import|export)\b[^'"]*?from\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm)]
      .map(match => match[1] ?? match[2]);
    graph.set(file, specifiers);
    for (const specifier of specifiers) {
      if (!specifier.startsWith('.')) continue;
      const base = resolve(dirname(file), specifier);
      const target = [base, `${base}.ts`, `${base}.tsx`, resolve(base, 'index.ts')].find(path => existsSync(path) && !path.endsWith('.css') && /\.tsx?$/.test(path));
      if (target) pending.push(target);
    }
  }
  return graph;
}

describe('favicon', () => {
  it('sets the style first inside the outer svg, so currentColor resolves to the ink', () => {
    expect(favicon('<svg class="platform-logo-mark"><path/></svg>')).toBe(
      `<svg class="platform-logo-mark"><style>.platform-logo-mark{color:${FAVICON_INK}}@media (prefers-color-scheme: dark){.platform-logo-mark{color:${FAVICON_INK_DARK}}}</style><path/></svg>\n`,
    );
  });

  it('refuses markup that is not an svg element', () => {
    expect(() => favicon('<div></div>')).toThrow('the platform mark did not render as an svg');
    expect(() => favicon('<svg')).toThrow('the platform mark did not render as an svg');
  });

  it('draws the platform mark in ink, and in light ink for a dark tab', () => {
    const svg = platformFaviconSvg();
    expect(svg).toBe(favicon(renderToStaticMarkup(createElement(PlatformLogoMark))));
    expect(svg).toMatch(/^<svg[^>]*class="platform-logo-mark"/);
    expect(svg).toMatch(/\.platform-logo-mark\{color:#0d0d0d\}/);
    expect(svg).toMatch(/@media \(prefers-color-scheme: dark\)\{\.platform-logo-mark\{color:#ececec\}\}/);
  });

  it('names no other color', () => {
    const colors = new Set(platformFaviconSvg().match(/#[0-9a-fA-F]{3,8}\b/g) ?? []);
    expect([...colors].sort()).toEqual([FAVICON_INK, FAVICON_INK_DARK]);
  });

  it('stays out of the main entry, which never imports the server renderer', () => {
    const graph = importGraph('src/react/index.ts');
    expect(graph.size).toBeGreaterThan(30);
    expect([...graph.keys()].filter(file => file.endsWith('/favicon.ts'))).toEqual([]);
    expect([...graph].filter(([, specifiers]) => specifiers.some(s => s.startsWith('react-dom/server'))).map(([file]) => file)).toEqual([]);
    expect(importGraph('src/react/favicon.ts').get(resolve('src/react/favicon.ts'))).toContain('react-dom/server');
  });
});
