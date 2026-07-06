import { describe, expect, it, vi } from 'vitest';

import { initLiquidGlass, refract, sheen, useLiquidGlass } from '../src';

describe('liquid glass runtime', () => {
  it('exposes the runtime + composable entry points', () => {
    expect(typeof initLiquidGlass).toBe('function');
    expect(typeof refract).toBe('function');
    expect(typeof sheen).toBe('function');
    expect(typeof useLiquidGlass).toBe('function');
  });

  it('scans the document without throwing (progressive enhancement)', () => {
    document.body.innerHTML = '<div id="p" style="backdrop-filter: blur(24px); border-radius: 22px; width:400px; height:200px"></div>';
    expect(() => initLiquidGlass()).not.toThrow();
  });

  it('never auto-attaches sheen to a wide panel (opt-in only)', () => {
    // A wide glass panel with NO data-lg-sheen must stay bare — the cursor-
    // following highlight used to smear across every footer / card as a stray blob.
    document.body.innerHTML =
      '<div id="w" style="backdrop-filter: blur(24px); border-radius: 22px; width:600px; height:220px"></div>';
    initLiquidGlass();
    const el = document.getElementById('w')!;
    expect(el.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('attaches sheen only when a surface opts in with data-lg-sheen', () => {
    document.body.innerHTML =
      '<div id="s" data-lg-sheen style="backdrop-filter: blur(24px); border-radius: 22px; width:600px; height:220px"></div>';
    initLiquidGlass();
    const el = document.getElementById('s')!;
    expect(el.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('respects data-lg-sheen="off" as an explicit opt-out', () => {
    document.body.innerHTML =
      '<div id="o" data-lg-sheen="off" style="backdrop-filter: blur(24px); border-radius: 22px; width:600px; height:220px"></div>';
    sheen(document.getElementById('o')!);
    expect(document.getElementById('o')!.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('honors reduce-transparency + reduce-motion by enhancing nothing', () => {
    // matchMedia → always matches (reduced): no refraction, no sheen attached.
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
    document.body.innerHTML = '<div id="q" style="backdrop-filter: blur(24px); border-radius: 22px; width:400px; height:200px"></div>';
    initLiquidGlass();
    const el = document.getElementById('q')!;
    // No sheen child element and no url(#…) appended to the filter chain.
    expect(el.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(el.style.backdropFilter).not.toContain('url(');
    vi.unstubAllGlobals();
  });
});
