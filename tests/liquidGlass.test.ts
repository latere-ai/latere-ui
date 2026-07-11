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

  it('garbage-collects refraction filters whose element left the DOM', () => {
    document.body.innerHTML = '';
    // Environment shims: happy-dom has no layout, computed backdrop-filter, or
    // 2D canvas, so stub just enough for refract() to run its real code path.
    vi.stubGlobal('getComputedStyle', () => ({
      backdropFilter: 'blur(24px)',
      borderTopLeftRadius: '22px',
      backgroundColor: 'rgb(255,255,255)',
      position: 'relative',
    }));
    vi.stubGlobal('CSS', { supports: () => false }); // re-scan must prune even when it cannot refract
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    (HTMLCanvasElement.prototype as unknown as { getContext: unknown }).getContext = function () {
      return {
        createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
        putImageData() {},
      };
    };
    HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,AA==';

    try {
      const el = document.createElement('div');
      Object.defineProperty(el, 'offsetWidth', { value: 40 });
      Object.defineProperty(el, 'offsetHeight', { value: 40 });
      document.body.appendChild(el);
      refract(el);
      expect(document.querySelectorAll('body > svg filter').length).toBe(1);

      // The element leaves the DOM (route change); the next scan must drop
      // its filter instead of letting the shared defs grow forever.
      el.remove();
      initLiquidGlass();
      expect(document.querySelectorAll('body > svg filter').length).toBe(0);
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext;
      HTMLCanvasElement.prototype.toDataURL = origToDataURL;
      vi.unstubAllGlobals();
    }
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
