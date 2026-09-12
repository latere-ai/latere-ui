import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';

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
    vi.stubGlobal('CSS', { supports: () => true });
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
      vi.stubGlobal('CSS', { supports: () => false }); // prune even without browser support
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


describe('liquid glass updates', () => {
  let baseFilter: string;
  let background: string;
  let width: number;
  let reducedMotion: boolean;
  let reducedTransparency: boolean;
  let supported: boolean;
  let panel: HTMLElement;
  let media: Map<string, EventTarget>;

  beforeEach(() => {
    document.body.innerHTML = '';
    baseFilter = 'blur(24px) saturate(1.5)';
    background = 'rgb(255,255,255)';
    width = 80;
    reducedMotion = false;
    reducedTransparency = false;
    supported = true;
    media = new Map();
    vi.stubGlobal('matchMedia', (query: string) => {
      if (!media.has(query)) {
        const target = new EventTarget();
        Object.defineProperty(target, 'matches', {
          get: () => query.includes('transparency') ? reducedTransparency : reducedMotion,
        });
        media.set(query, target);
      }
      return media.get(query);
    });
    vi.stubGlobal('CSS', { supports: () => supported });
    vi.stubGlobal('getComputedStyle', (el: HTMLElement) => ({
      backdropFilter: el.style.backdropFilter || baseFilter,
      borderTopLeftRadius: '22px',
      backgroundColor: background,
      position: 'relative',
    }));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      createImageData: (w: number, height: number) => ({ data: new Uint8ClampedArray(w * height * 4) }),
      putImageData() {},
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,AA==');
    panel = document.createElement('div');
    panel.setAttribute('data-lg-sheen', '');
    Object.defineProperty(panel, 'offsetWidth', { get: () => width });
    Object.defineProperty(panel, 'offsetHeight', { value: 40 });
    document.body.appendChild(panel);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    initLiquidGlass();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('refreshes the CSS filter and displacement map after theme and size changes', () => {
    refract(panel);
    expect(panel.style.backdropFilter).toContain('saturate(1.5)');
    baseFilter = 'blur(32px) saturate(2)';
    width = 120;
    refract(panel);
    expect(panel.style.backdropFilter).toContain('blur(14px) saturate(2)');
    expect(document.querySelector('feImage')?.getAttribute('width')).toBe('120');
    expect(document.querySelectorAll('filter')).toHaveLength(1);
    const filter = document.querySelector('filter');
    refract(panel);
    expect(document.querySelector('filter')).toBe(filter);
  });

  it('removes existing effects when accessibility preferences change and restores them later', () => {
    refract(panel);
    sheen(panel);
    reducedMotion = true;
    reducedTransparency = true;
    initLiquidGlass();
    expect(panel.style.backdropFilter).toBe('');
    expect(panel.querySelector('[aria-hidden]')).toBeNull();
    expect(document.querySelectorAll('filter')).toHaveLength(0);
    reducedMotion = false;
    reducedTransparency = false;
    refract(panel);
    sheen(panel);
    expect(panel.style.backdropFilter).toContain('url(');
    expect(panel.querySelectorAll('[aria-hidden]')).toHaveLength(1);
  });

  it('refreshes a visible sheen intensity when the theme changes', () => {
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 80, height: 40 } as DOMRect);
    sheen(panel);
    const highlight = panel.querySelector<HTMLElement>('[aria-hidden]')!;
    // happy-dom does not parse radial gradients; capture the assigned CSS.
    let gradient = '';
    Object.defineProperty(highlight.style, 'background', {
      get: () => gradient,
      set: (value: string) => { gradient = value; },
    });
    panel.dispatchEvent(new MouseEvent('mousemove', { clientX: 40, clientY: 20 }));
    expect(highlight.style.background).toContain('0.16');
    background = 'rgb(24,24,24)';
    sheen(panel);
    expect(highlight.style.background).toContain('0.06');
    expect(highlight.style.opacity).toBe('1');
    expect(panel.querySelectorAll('[aria-hidden]')).toHaveLength(1);
  });

  it('preserves an original inline filter and priority when disabling refraction', () => {
    panel.style.setProperty('backdrop-filter', 'blur(28px)', 'important');
    refract(panel);
    panel.setAttribute('data-lg-refract', 'off');
    refract(panel);
    expect(panel.style.backdropFilter).toBe('blur(28px)');
    expect(panel.style.getPropertyPriority('backdrop-filter')).toBe('important');
  });

  it('direct helpers honor preferences, explicit opt-outs, and browser support', () => {
    reducedMotion = true;
    reducedTransparency = true;
    refract(panel);
    sheen(panel);
    expect(panel.style.backdropFilter).not.toContain('url(');
    expect(panel.children).toHaveLength(0);
    reducedTransparency = false;
    supported = false;
    refract(panel);
    expect(panel.style.backdropFilter).not.toContain('url(');
    supported = true;
    panel.setAttribute('data-lg-refract', 'off');
    refract(panel);
    expect(panel.style.backdropFilter).not.toContain('url(');
  });

  it('keeps a caller replacement when an enhanced inline filter changes', () => {
    refract(panel);
    panel.style.backdropFilter = 'blur(8px)';
    refract(panel);
    expect(panel.style.backdropFilter).toContain('blur(8px) url(');
    reducedTransparency = true;
    refract(panel);
    expect(panel.style.backdropFilter).toBe('blur(8px)');
  });

  it('removes refraction when CSS stops using glass or the panel exceeds the size budget', () => {
    refract(panel);
    baseFilter = 'none';
    refract(panel);
    expect(panel.style.backdropFilter).toBe('');
    expect(document.querySelectorAll('filter')).toHaveLength(0);
    baseFilter = 'blur(24px)';
    refract(panel);
    width = 20000;
    refract(panel);
    expect(panel.style.backdropFilter).toBe('');
    expect(document.querySelectorAll('filter')).toHaveLength(0);
  });

  it('recreates defs and effects when a detached panel is attached again', () => {
    refract(panel);
    panel.remove();
    initLiquidGlass();
    document.body.innerHTML = '';
    document.body.appendChild(panel);
    refract(panel);
    expect(document.querySelectorAll('filter')).toHaveLength(1);
    expect(panel.style.backdropFilter).toContain(document.querySelector('filter')!.id);
  });

  it('enhances the subtree root itself', () => {
    initLiquidGlass(panel);
    expect(panel.style.backdropFilter).toContain('url(');
    expect(panel.querySelector('[aria-hidden]')).not.toBeNull();
  });

  it('the composable responds to preference changes and removes its subscriptions on unmount', async () => {
    const wrapper = mount(defineComponent({
      setup() {
        useLiquidGlass({ root: () => document });
        return () => h('div');
      },
    }));
    await nextTick();
    expect(panel.querySelector('[aria-hidden]')).not.toBeNull();
    const query = media.get('(prefers-reduced-motion: reduce)')!;
    const remove = vi.spyOn(query, 'removeEventListener');
    reducedMotion = true;
    query.dispatchEvent(new Event('change'));
    await nextTick();
    expect(panel.querySelector('[aria-hidden]')).toBeNull();
    wrapper.unmount();
    expect(remove).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
