import { describe, expect, it } from 'vitest';
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

  it('gives every product a name, a hex brand color, and an inline SVG glyph', () => {
    for (const p of LATERE_PRODUCTS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(p.icon).toMatch(/<(path|circle|rect)/);
    }
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

  it('tints each tile glyph with the product brand color', async () => {
    const w = render();
    await w.find('button.lu-iconbtn').trigger('click');
    const lux = w.findAll('.lu-ps-tile').find((t) => t.text().includes('Lux'))!;
    expect(lux.find('.lu-ps-ic').attributes('style')).toContain('color:');
  });
});
