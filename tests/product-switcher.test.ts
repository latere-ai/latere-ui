import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import ProductSwitcher from '../src/components/ProductSwitcher.vue';
import {
  DEFAULT_PRODUCT_SWITCHER_LABELS,
  LATERE_PRODUCTS,
  type ProductInfo,
} from '../src/components/productSwitcher';

describe('product registry', () => {
  it('lists all six destinations with unique slugs', () => {
    const slugs = LATERE_PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect([...slugs].sort()).toEqual([
      'cella',
      'chat',
      'identity',
      'lux',
      'topos',
      'wallfacer',
    ]);
  });

  // Drive shut down on 2026-09-19; durable storage is the platform's Storage
  // section, so nothing in the registry may still point a reader at it.
  it('no longer carries the retired Drive console', () => {
    expect(LATERE_PRODUCTS.map((p) => p.slug)).not.toContain('drive');
    for (const p of LATERE_PRODUCTS) {
      expect(new URL(p.url).hostname).not.toBe('drive.latere.ai');
      expect(p.name).not.toBe('Drive');
    }
  });

  // The hosted Lectio service was retired on 2026-10-03, so the registry may
  // not still point a reader at its host.
  it('no longer carries the retired Lectio service', () => {
    expect(LATERE_PRODUCTS.map((p) => p.slug)).not.toContain('lectio');
    for (const p of LATERE_PRODUCTS) {
      expect(new URL(p.url).hostname).not.toBe('lectio.latere.ai');
      expect(p.name).not.toBe('Lectio');
      expect(p.brandClass).not.toBe('lectio-brand');
    }
  });

  // The hosted Lux gateway and its host were deleted on 2026-09-25; models are
  // managed in the platform console's Models section.
  it('sends Lux to the platform console, not the retired gateway host', () => {
    const lux = LATERE_PRODUCTS.find((p) => p.slug === 'lux')!;
    expect(lux.url).toBe('https://platform.latere.ai/console/models');
    for (const p of LATERE_PRODUCTS) {
      expect(new URL(p.url).hostname).not.toBe('lux.latere.ai');
    }
  });

  // topos.latere.ai and cella.latere.ai stopped resolving when their hosted
  // services were retired; Agents and Environments are platform console
  // sections, as Models is.
  it('sends Topos and Cella to the platform console, not their retired hosts', () => {
    const url = (slug: string) => LATERE_PRODUCTS.find((p) => p.slug === slug)!.url;
    expect(url('topos')).toBe('https://platform.latere.ai/console/agents');
    expect(url('cella')).toBe('https://platform.latere.ai/console/environments');
    for (const p of LATERE_PRODUCTS) {
      expect(['topos.latere.ai', 'cella.latere.ai']).not.toContain(new URL(p.url).hostname);
    }
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
    expect(bySlug.identity).toContain('stroke="#6b5fc0"');
  });

  // The chat's public name is Latere, and it leads the applications.
  it('leads with the chat, named Latere, at chat.latere.ai in its accent', () => {
    const chat = LATERE_PRODUCTS[0];
    expect(chat.slug).toBe('chat');
    expect(chat.name).toBe('Latere');
    expect(chat.url).toBe('https://chat.latere.ai');
    expect(chat.color).toBe('#c4511f');
    expect(chat.brandClass).toBe('chat-brand');
  });

  // The chat's mark is the Latere mark at rest, copied from the company site,
  // which draws it from this package's LatereLogoMark. Its arcs and dot must
  // stay that mark's, so an edit to the mark that skips this copy fails here.
  it("draws the chat's mark as the Latere mark, in the ink of the tile", () => {
    const icon = LATERE_PRODUCTS.find((p) => p.slug === 'chat')!.icon;
    const mark = readFileSync(resolve(process.cwd(), 'src/components/LatereLogoMark.vue'), 'utf8');
    const paths = (svg: string) => Array.from(svg.matchAll(/<path d="([^"]+)"/g), (m) => m[1]);
    const attr = (svg: string, name: string) => svg.match(new RegExp(`${name}="([^"]+)"`))![1];
    const markPaths = paths(mark);
    expect(markPaths).toHaveLength(6);
    expect(paths(icon)).toEqual(markPaths.slice(0, 5));
    // LatereLogoMark draws the dot as two arcs from its leftmost point; the
    // icon draws the same circle as a <circle>.
    const [x, y, r] = markPaths[5].match(/^M(\d+) (\d+) a(\d+)/)!.slice(1).map(Number);
    expect(icon).toContain(`<circle cx="${x + r}" cy="${y}" r="${r}"/>`);
    for (const name of ['viewBox', 'fill', 'transform']) expect(attr(icon, name)).toBe(attr(mark, name));
    expect(attr(icon, 'fill')).toBe('currentColor');
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
    expect(grid.text()).toContain('Latere');
    expect(grid.text()).toContain('Wallfacer');
    expect(grid.text()).toContain('Identity');
  });

  it('links every other console via a plain anchor to its origin', async () => {
    const w = render();
    await w.find('button.lu-iconbtn').trigger('click');
    const hrefs = w.findAll('a.lu-ps-tile').map((a) => a.attributes('href'));
    expect(hrefs).toContain('https://chat.latere.ai');
    expect(hrefs).toContain('https://wf.latere.ai');
    expect(hrefs).toContain('https://auth.latere.ai');
    expect(hrefs.length).toBe(LATERE_PRODUCTS.length - 1);
  });

  it('marks the current product with a ring and renders it non-navigating', async () => {
    const w = render({ current: 'wallfacer' });
    await w.find('button.lu-iconbtn').trigger('click');
    const current = w.find('.lu-ps-tile.is-current');
    expect(current.exists()).toBe(true);
    expect(current.element.tagName).toBe('SPAN');
    expect(current.attributes('href')).toBeUndefined();
    expect(current.attributes('aria-current')).toBe('true');
    expect(current.text()).toContain('Wallfacer');
    // Screen readers get an explicit current marker.
    expect(current.find('.lu-ps-sr').text()).toBe('Current product');
    // And no anchor points back at the console we are already in.
    const hrefs = w.findAll('a.lu-ps-tile').map((a) => a.attributes('href'));
    expect(hrefs).not.toContain('https://wf.latere.ai');
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
      (p) => p.slug === 'lux' || p.slug === 'wallfacer',
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
    const chat = w.findAll('.lu-ps-tile').find((t) => t.find('.lu-ps-name').text() === 'Latere')!;
    expect(chat.find('.lu-ps-name').classes()).toContain('chat-brand');
    expect(chat.findAll('.lu-ps-ic svg g path')).toHaveLength(5);
    expect(chat.find('.lu-ps-ic svg circle').exists()).toBe(true);
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
