import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi, afterEach } from 'vitest';
import { effectScope } from 'vue';

import { concentricRadius, glassClass, useGlass } from '../src/glass/useGlass';

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

  it('keeps the overlay (thick) tier near-opaque so it occludes busy content', () => {
    // Thick is the overlay tier (dropdowns, palettes, modals, drawers, footers)
    // that floats over arbitrary content. We composite blur only — no SVG
    // lensing — so the fill must occlude, not reveal. A regression below ~0.9
    // lets sharp text/graphics read straight through (the v1.20.0 bleed bug).
    const light = css.slice(css.indexOf(':root {'), css.indexOf('[data-theme="dark"] {'));
    const dark = css.slice(css.indexOf('[data-theme="dark"] {'));
    for (const [name, block] of [['light', light], ['dark', dark]] as const) {
      const m = block.match(/--glass-bg-thick:\s*rgba\([^)]*?,\s*([0-9.]+)\s*\)/);
      expect(m, `thick fill must be rgba in ${name}`).toBeTruthy();
      expect(Number(m![1]), `thick alpha too low in ${name}`).toBeGreaterThanOrEqual(0.9);
    }
  });

  it('defines the five-tier ladder with paired -webkit-backdrop-filter and no retired Clear tier', () => {
    for (const cls of [
      '.lu-glass-ultrathin',
      '.lu-glass-thin',
      '.lu-glass',
      '.lu-glass-thick',
      '.lu-glass-smoke',
    ]) {
      expect(css).toContain(cls);
    }
    // The Clear variant retired in v2.
    expect(css).not.toContain('.lu-glass-clear');
    // Safari needs the prefixed property alongside the standard one.
    const webkit = css.match(/-webkit-backdrop-filter/g) ?? [];
    const standard = css.match(/(?<!-webkit-)\bbackdrop-filter/g) ?? [];
    expect(webkit.length).toBeGreaterThanOrEqual(5);
    expect(standard.length).toBeGreaterThanOrEqual(5);
  });

  it('composes the layered floating-glass shadow (drop + inset top specular) in --shadow-glass', () => {
    const shadow = css.slice(css.indexOf('--shadow-glass:'));
    expect(shadow).toMatch(/0 14px 38px/); // separation drop shadow
    expect(shadow).toMatch(/inset 0 1\.5px 0/); // top specular rim
  });

  it('carries a reduce-transparency fallback that opaques the tokens', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-transparency:\s*reduce\)/);
    const block = css.slice(css.indexOf('prefers-reduced-transparency'));
    expect(block).toMatch(/--glass-bg:\s*var\(--bg-surface/);
    expect(block).toMatch(/backdrop-filter:\s*none/);
  });

  it('carries an increase-contrast fallback (Apple Increase Contrast)', () => {
    expect(css).toMatch(/@media\s*\(prefers-contrast:\s*more\)/);
    const block = css.slice(css.indexOf('prefers-contrast'));
    // Fills go near-opaque so text keeps a 4.5:1 ratio.
    expect(block).toMatch(/--glass-bg:\s*rgba\([^)]*0\.9/);
  });

  it('zeroes the blur/saturate tokens in every fallback so hand-rolled backdrop-filters degrade too', () => {
    // A consumer that writes `backdrop-filter: blur(var(--glass-blur))` on its
    // own selector (not a .lu-glass* class) must also lose the blur under each
    // fallback — otherwise the filter stays active behind an opaque fill.
    for (const anchor of [
      'prefers-reduced-transparency',
      'prefers-contrast',
      '@supports not (backdrop-filter',
    ]) {
      const start = css.indexOf(anchor);
      // Window covers the whole at-rule body (multiple inner blocks).
      const block = css.slice(start, start + 1200);
      expect(block, `${anchor} must zero --glass-blur`).toMatch(/--glass-blur:\s*0px/);
      expect(block, `${anchor} must neutralize --glass-saturate`).toMatch(/--glass-saturate:\s*100%/);
    }
  });

  it('carries a @supports capability fallback for browsers without backdrop-filter', () => {
    expect(css).toMatch(/@supports\s+not\s*\(backdrop-filter:/);
  });
});

describe('concentricRadius', () => {
  it('subtracts padding from the outer radius (Apple concentric rule)', () => {
    expect(concentricRadius('8px')).toBe('calc(var(--glass-radius, 22px) - 8px)');
    expect(concentricRadius('4px', '20px')).toBe('calc(20px - 4px)');
  });
});

describe('glassClass', () => {
  it('maps each tier to its utility class', () => {
    expect(glassClass('ultrathin')).toBe('lu-glass-ultrathin');
    expect(glassClass('thin')).toBe('lu-glass-thin');
    expect(glassClass('regular')).toBe('lu-glass');
    expect(glassClass('thick')).toBe('lu-glass-thick');
    expect(glassClass('smoke')).toBe('lu-glass-smoke');
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
