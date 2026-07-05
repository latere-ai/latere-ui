import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi, afterEach } from 'vitest';
import { effectScope } from 'vue';

import { glassClass, useGlass } from '../src/glass/useGlass';

const css = readFileSync(resolve(process.cwd(), 'src/styles/glass.css'), 'utf8');

describe('glass.css material tokens', () => {
  it('declares the tier tokens for both themes', () => {
    // Anchor on the selector's opening brace so the doc comment (which mentions
    // `[data-theme="dark"]`) doesn't get mistaken for the rule block.
    const light = css.slice(css.indexOf(':root {'), css.indexOf('[data-theme="dark"] {'));
    const dark = css.slice(css.indexOf('[data-theme="dark"] {'));
    for (const block of [light, dark]) {
      expect(block).toMatch(/--glass-bg:/);
      expect(block).toMatch(/--glass-bg-thin:/);
      expect(block).toMatch(/--glass-bg-thick:/);
      expect(block).toMatch(/--glass-blur:/);
      expect(block).toMatch(/--glass-edge:/);
    }
    // Canvas is theme-independent (derives from --bg), declared once in :root.
    expect(light).toMatch(/--canvas:/);
  });

  it('defines the three tier utility classes with paired -webkit-backdrop-filter', () => {
    for (const cls of ['.lu-glass', '.lu-glass-thin', '.lu-glass-thick']) {
      expect(css).toContain(cls);
    }
    // Safari needs the prefixed property alongside the standard one.
    const webkit = css.match(/-webkit-backdrop-filter/g) ?? [];
    const standard = css.match(/(?<!-webkit-)\bbackdrop-filter/g) ?? [];
    expect(webkit.length).toBeGreaterThanOrEqual(3);
    expect(standard.length).toBeGreaterThanOrEqual(3);
  });

  it('carries a reduce-transparency fallback that opaques the tokens', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-transparency:\s*reduce\)/);
    const block = css.slice(css.indexOf('prefers-reduced-transparency'));
    expect(block).toMatch(/--glass-bg:\s*var\(--bg-surface/);
    expect(block).toMatch(/backdrop-filter:\s*none/);
  });

  it('carries a @supports capability fallback for browsers without backdrop-filter', () => {
    expect(css).toMatch(/@supports\s+not\s*\(backdrop-filter:/);
  });
});

describe('glassClass', () => {
  it('maps each tier to its utility class', () => {
    expect(glassClass('thin')).toBe('lu-glass-thin');
    expect(glassClass('regular')).toBe('lu-glass');
    expect(glassClass('thick')).toBe('lu-glass-thick');
    expect(glassClass()).toBe('lu-glass'); // defaults to regular
  });
});

describe('useGlass', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reflects the matchMedia state and reacts to changes', () => {
    let handler: ((e: MediaQueryListEvent) => void) | undefined;
    const mql = {
      matches: true,
      addEventListener: (_: string, h: (e: MediaQueryListEvent) => void) => {
        handler = h;
      },
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('matchMedia', () => mql);

    const scope = effectScope();
    const api = scope.run(() => useGlass())!;
    expect(api.reducedTransparency.value).toBe(true);

    handler?.({ matches: false } as MediaQueryListEvent);
    expect(api.reducedTransparency.value).toBe(false);
    scope.stop();
  });

  it('is SSR-safe: defaults to false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    const scope = effectScope();
    const api = scope.run(() => useGlass())!;
    expect(api.reducedTransparency.value).toBe(false);
    scope.stop();
  });
});
