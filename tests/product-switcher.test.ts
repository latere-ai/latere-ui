import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import ProductSwitcher from '../src/components/ProductSwitcher.vue';
import {
  DEFAULT_PRODUCT_SWITCHER_LABELS,
  LATERE_PRODUCTS,
  type ProductInfo,
} from '../src/components/productSwitcher';

describe('product registry', () => {
  it('lists all seven consoles with unique slugs', () => {
    const slugs = LATERE_PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect([...slugs].sort()).toEqual([
      'cella',
      'drive',
      'identity',
      'lectio',
      'lux',
      'topos',
      'wallfacer',
    ]);
  });

  it('points every product at an https latere.ai origin with no trailing slash', () => {
    for (const p of LATERE_PRODUCTS) {
      const u = new URL(p.url);
      expect(u.protocol).toBe('https:');
      expect(u.hostname.endsWith('latere.ai')).toBe(true);
      expect(p.url.endsWith('/')).toBe(false);
    }
  });

  it('gives every product a name, a hex brand color, and a complete SVG mark', () => {
    for (const p of LATERE_PRODUCTS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(p.icon.startsWith('<svg ')).toBe(true);
      expect(p.icon).toContain('aria-hidden="true"');
      expect(p.icon).toContain('width="22"');
    }
  });

  it('carries the canonical marketing-site marks, not invented glyphs', () => {
    const bySlug = Object.fromEntries(LATERE_PRODUCTS.map((p) => [p.slug, p.icon]));
    // Pixelated 16x16 rect marks for Wallfacer and Cella.
    for (const slug of ['wallfacer', 'cella']) {
      expect(bySlug[slug]).toContain('viewBox="0 0 16 16"');
      expect(bySlug[slug]).toContain('image-rendering:pixelated');
    }
    expect(bySlug.wallfacer).toContain('fill="#d97757"');
    expect(bySlug.cella).toContain('fill="#4a7558"');
    // Stroke marks with the brand stroke colors baked in.
    expect(bySlug.topos).toContain('stroke="#55707a"');
    expect(bySlug.lux).toContain('stroke="#3a4ed1"');
    expect(bySlug.lux).toContain('M12 4l8 14H4z'); // the Lux prism triangle
    expect(bySlug.lectio).toContain('stroke="#b87333"');
    expect(bySlug.drive).toContain('stroke="#c9a227"'); // gold folder
    expect(bySlug.identity).toContain('stroke="#6b5fc0"');
  });

  it('carries the brand.css wordmark class for products and none for identity', () => {
    for (const p of LATERE_PRODUCTS) {
      if (p.slug === 'identity') expect(p.brandClass).toBeUndefined();
      else expect(p.brandClass).toBe(`${p.slug}-brand`);
    }
  });

  it('has no em dashes in names or default labels', () => {
    expect(JSON.stringify(LATERE_PRODUCTS)).not.toContain('—');
    expect(JSON.stringify(DEFAULT_PRODUCT_SWITCHER_LABELS)).not.toContain('—');
  });
});

describe('<ProductSwitcher />', () => {
  function render(props: Record<string, unknown> = {}) {
    return mount(ProductSwitcher, { props: { current: 'lux', ...props } });
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a labeled grid trigger, closed by default', () => {
    const w = render();
    const btn = w.find('button.lu-iconbtn');
    expect(btn.attributes('aria-label')).toBe('Switch product');
    expect(btn.attributes('aria-haspopup')).toBe('true');
    expect(btn.attributes('aria-expanded')).toBe('false');
    expect(w.find('.lu-ps-grid').exists()).toBe(false);
  });

  it('opens on trigger click with one tile per product', async () => {
    const w = render();
    await w.find('button.lu-iconbtn').trigger('click');
    expect(w.find('button.lu-iconbtn').attributes('aria-expanded')).toBe('true');
    const grid = w.find('.lu-ps-grid');
    expect(grid.attributes('aria-label')).toBe('Latere products');
    expect(w.findAll('.lu-ps-tile').length).toBe(LATERE_PRODUCTS.length);
    expect(grid.text()).toContain('Wallfacer');
    expect(grid.text()).toContain('Identity');
  });

  it('links every other console via a plain anchor to its origin', async () => {
    const w = render();
    await w.find('button.lu-iconbtn').trigger('click');
    const hrefs = w.findAll('a.lu-ps-tile').map((a) => a.attributes('href'));
    expect(hrefs).toContain('https://drive.latere.ai');
    expect(hrefs).toContain('https://auth.latere.ai');
    expect(hrefs.length).toBe(LATERE_PRODUCTS.length - 1);
  });

  it('marks the current product with a ring and renders it non-navigating', async () => {
    const w = render({ current: 'drive' });
    await w.find('button.lu-iconbtn').trigger('click');
    const current = w.find('.lu-ps-tile.is-current');
    expect(current.exists()).toBe(true);
    expect(current.element.tagName).toBe('SPAN');
    expect(current.attributes('href')).toBeUndefined();
    expect(current.attributes('aria-current')).toBe('true');
    expect(current.text()).toContain('Drive');
    // Screen readers get an explicit current marker.
    expect(current.find('.lu-ps-sr').text()).toBe('Current product');
    // And no anchor points back at the console we are already in.
    const hrefs = w.findAll('a.lu-ps-tile').map((a) => a.attributes('href'));
    expect(hrefs).not.toContain('https://drive.latere.ai');
  });

  it('closes on Escape', async () => {
    const w = render();
    await w.find('button.lu-iconbtn').trigger('click');
    expect(w.find('.lu-ps-grid').exists()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await w.vm.$nextTick();
    expect(w.find('.lu-ps-grid').exists()).toBe(false);
  });

  it('closes on outside click', async () => {
    const w = render();
    await w.find('button.lu-iconbtn').trigger('click');
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await w.vm.$nextTick();
    expect(w.find('.lu-ps-grid').exists()).toBe(false);
  });

  it('accepts a products override for filtered lineups', async () => {
    const products: ProductInfo[] = LATERE_PRODUCTS.filter(
      (p) => p.slug === 'lux' || p.slug === 'drive',
    );
    const w = render({ products });
    await w.find('button.lu-iconbtn').trigger('click');
    expect(w.findAll('.lu-ps-tile').length).toBe(2);
    expect(w.find('.lu-ps-grid').text()).not.toContain('Cella');
  });

  it('applies per-locale label overrides to the a11y strings', async () => {
    const w = render({
      labels: { switchProduct: 'Produkt wechseln', products: 'Latere Produkte', current: 'Aktuell' },
    });
    expect(w.find('button.lu-iconbtn').attributes('aria-label')).toBe('Produkt wechseln');
    await w.find('button.lu-iconbtn').trigger('click');
    expect(w.find('.lu-ps-grid').attributes('aria-label')).toBe('Latere Produkte');
    expect(w.find('.lu-ps-sr').text()).toBe('Aktuell');
  });

  it('renders each tile glyph from the canonical inline mark', async () => {
    const w = render();
    await w.find('button.lu-iconbtn').trigger('click');
    const lux = w.findAll('.lu-ps-tile').find((t) => t.text().includes('Lux'))!;
    expect(lux.find('.lu-ps-ic svg path[d="M12 4l8 14H4z"]').exists()).toBe(true);
    const wallfacer = w.findAll('.lu-ps-tile').find((t) => t.text().includes('Wallfacer'))!;
    expect(wallfacer.find('.lu-ps-ic svg rect[fill="#d97757"]').exists()).toBe(true);
  });

  it('opens on an opaque own panel anchored below/start by default', async () => {
    const w = render();
    await w.find('button.lu-iconbtn').trigger('click');
    await w.vm.$nextTick();
    const panel = w.find('.lu-ps-panel');
    expect(panel.exists()).toBe(true);
    // Anchored to the trigger, default placement: below, start-aligned.
    expect(panel.attributes('data-side')).toBe('bottom');
    expect(panel.attributes('data-align')).toBe('start');
    // Not the translucent glass material: the panel owns an opaque composite.
    expect(panel.classes()).not.toContain('lu-glass-thick');
  });

  it('flips to top/end when the viewport would clip the default placement', async () => {
    // Viewport 1000x600; trigger sits near the bottom-right corner; the
    // panel measures 280x240, so bottom/start would clip both edges.
    Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });
    const rect = (r: Partial<DOMRect>): DOMRect =>
      ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}), ...r }) as DOMRect;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this.classList.contains('lu-ps-panel')) return rect({ width: 280, height: 240 });
      return rect({ left: 900, right: 930, top: 520, bottom: 548, width: 30, height: 28 });
    });
    const w = render();
    await w.find('button.lu-iconbtn').trigger('click');
    await w.vm.$nextTick();
    const panel = w.find('.lu-ps-panel');
    expect(panel.attributes('data-side')).toBe('top');
    expect(panel.attributes('data-align')).toBe('end');
  });

  it('keeps the default placement when a flip would not fit either', async () => {
    // Anchor at the very left edge of a viewport narrower than the panel:
    // start clips, but end would clip even harder, so stay start-aligned.
    Object.defineProperty(window, 'innerWidth', { value: 240, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    const rect = (r: Partial<DOMRect>): DOMRect =>
      ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}), ...r }) as DOMRect;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this.classList.contains('lu-ps-panel')) return rect({ width: 280, height: 240 });
      return rect({ left: 12, right: 42, top: 20, bottom: 48, width: 30, height: 28 });
    });
    const w = render();
    await w.find('button.lu-iconbtn').trigger('click');
    await w.vm.$nextTick();
    const panel = w.find('.lu-ps-panel');
    expect(panel.attributes('data-side')).toBe('bottom');
    expect(panel.attributes('data-align')).toBe('start');
  });
});
