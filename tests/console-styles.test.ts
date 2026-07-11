import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles/console.css'), 'utf8');

describe('console.css', () => {
  it('imports the shared brand partial for wordmark gradients', () => {
    expect(css).toMatch(/@import\s+['"]\.\/brand\.css['"]/);
  });

  it('renders the rail as Liquid Glass with an opaque fallback', () => {
    const rail = css.slice(css.indexOf('.lu-cs {'), css.indexOf('.lu-cs[data-collapsed'));
    // Glass tint, falling back to --bg-surface for non-glass consumers.
    expect(rail).toMatch(/background:\s*var\(--glass-bg,\s*var\(--bg-surface/);
    // Paired backdrop-filter (Safari) driven by the glass blur token.
    expect(rail).toMatch(/-webkit-backdrop-filter:\s*blur\(var\(--glass-blur/);
    expect(rail).toMatch(/(?<!-webkit-)backdrop-filter:\s*blur\(var\(--glass-blur/);
  });

  it('shrinks an AccountMenu foot to its avatar when collapsed (fits the 64px rail)', () => {
    // Regression guard: without this rule the account control overflows the
    // collapsed rail into the main content (caught during the lux pilot).
    expect(css).toMatch(/\[data-collapsed="true"\][^}]*\.lu-cs-foot[\s\S]*\.lu-am-id/);
  });

  it('centers the collapsed account trigger under the brand mark', () => {
    // Regression guard: AccountMenu's sidebar variant (.lu-am-up) forces
    // width:100% on the wrapper, so the foot's justify-content:center never
    // applied — the intrinsically-sized trigger left-aligned inside the
    // full-width wrapper (avatar sat ~5px off the rail center in drive).
    expect(css).toMatch(/\[data-collapsed="true"\] \.lu-cs-foot \.lu-am \{[^}]*width:\s*auto/);
  });

  it('makes the collapsed account trigger a tight circle (not a wide rectangle)', () => {
    // The trigger rule must override the sidebar variant's width:100% so the
    // avatar reads as a square/circle, not a stretched rounded rectangle.
    const rule = css.slice(css.indexOf('.lu-cs-foot .lu-am-trigger'));
    expect(rule).toMatch(/width:\s*auto\s*!important/);
    expect(rule).toMatch(/border-radius:\s*999px\s*!important/);
  });

  it('keeps the collapsed account dropdown a usable width (not clamped to 64px)', () => {
    // Regression guard: the sidebar dropdown variant is width:auto, which
    // collapses to the trigger width in a folded rail and truncates the menu.
    const rule = css.slice(css.indexOf('.lu-cs-foot .lu-am-dd'));
    expect(rule).toMatch(/min-width:\s*248px\s*!important/);
  });
  it("v2: no chromatic accent fallback survives (ink accent only)", () => {
    // v1 leaked a #5b6cf0 fallback; v2 resolves the accent to ink.
    expect(css).not.toContain("#5b6cf0");
  });

  it("centers collapsed nav items as squares (v2 capsule rail)", () => {
    const blk = css.slice(css.indexOf("[data-collapsed=\"true\"] .lu-cs-item"));
    expect(blk).toMatch(/margin-left:\s*auto/);
  });

  it("v2: active row is a filled capsule, not a 3px accent bar", () => {
    const active = css.slice(css.indexOf('.lu-cs-item[data-active="true"] {'));
    // Pill fill carries the active state.
    expect(active).toMatch(/background:\s*var\(--glass-pill-fill/);
    // The v1 accent-bar pseudo-element is gone entirely.
    expect(css).not.toMatch(/\.lu-cs-item\[data-active="true"\]::before/);
    // Nav rows are capsules.
    const item = css.slice(css.indexOf('.lu-cs-item {'), css.indexOf('.lu-cs-item:hover'));
    expect(item).toMatch(/border-radius:\s*var\(--radius-pill/);
  });
});
