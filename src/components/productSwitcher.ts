// Types + built-in product registry for ProductSwitcher, kept in a .ts module
// (not the .vue) so the package entrypoint can re-export them without a
// consumer's vue-tsc falling back to the default-only `*.vue` shim and losing
// the named members.
//
// The registry is the single source of truth for cross-product identity:
// slug, display name, console origin, a small inline SVG glyph, and the brand
// color (the middle stop of the wordmark gradient in styles/brand.css, so the
// icon tint and the gradient text always agree). SiteFooter renders its
// product links from this registry too, so adding or retiring a product is a
// one-place change.

export type ProductSlug =
  | 'wallfacer'
  | 'topos'
  | 'cella'
  | 'lux'
  | 'lectio'
  | 'drive'
  | 'identity';

export interface ProductInfo {
  /** Stable id; matches the `<slug>-brand` wordmark class in brand.css. */
  slug: ProductSlug | (string & {});
  /** English display name. Pass a translated `products` array to localize. */
  name: string;
  /** Console origin, no trailing slash (e.g. "https://lux.latere.ai"). */
  url: string;
  /** Solid brand color used to tint the tile glyph. */
  color: string;
  /**
   * Inline SVG inner markup for a 24x24 viewBox, stroke-based on
   * currentColor, matching the sidebar/footer icon language.
   */
  icon: string;
  /** Gradient wordmark class from brand.css; omitted for neutral products. */
  brandClass?: string;
}

/**
 * All Latere product consoles, in the same order the SiteFooter lists them
 * (Identity last, as the platform-wide sign-in rather than a product).
 */
export const LATERE_PRODUCTS: readonly ProductInfo[] = [
  {
    slug: 'wallfacer',
    name: 'Wallfacer',
    url: 'https://wf.latere.ai',
    color: '#c4623f',
    brandClass: 'wallfacer-brand',
    icon: '<path d="M12 3l7 3v5c0 4.6-3 7.6-7 9-4-1.4-7-4.4-7-9V6l7-3z"/>',
  },
  {
    slug: 'topos',
    name: 'Topos',
    url: 'https://topos.latere.ai',
    color: '#6f8a56',
    brandClass: 'topos-brand',
    icon: '<path d="M12 21s-6.5-5.1-6.5-10a6.5 6.5 0 0 1 13 0C18.5 15.9 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.3"/>',
  },
  {
    slug: 'cella',
    name: 'Cella',
    url: 'https://cella.latere.ai',
    color: '#6b9e7c',
    brandClass: 'cella-brand',
    icon: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  },
  {
    slug: 'lux',
    name: 'Lux',
    url: 'https://lux.latere.ai',
    color: '#3a4ed1',
    brandClass: 'lux-brand',
    icon: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5m0 14v2.5M2.5 12H5m14 0h2.5M5.3 5.3L7 7m10 10l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7"/>',
  },
  {
    slug: 'lectio',
    name: 'Lectio',
    url: 'https://lectio.latere.ai',
    color: '#b87333',
    brandClass: 'lectio-brand',
    icon: '<path d="M12 6c-1.5-1.3-3.6-2-6-2v14c2.4 0 4.5.7 6 2 1.5-1.3 3.6-2 6-2V4c-2.4 0-4.5.7-6 2z"/><path d="M12 6v14"/>',
  },
  {
    slug: 'drive',
    name: 'Drive',
    url: 'https://drive.latere.ai',
    color: '#c9a227',
    brandClass: 'drive-brand',
    icon: '<path d="M3 8a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/>',
  },
  {
    slug: 'identity',
    name: 'Identity',
    url: 'https://auth.latere.ai',
    color: '#8a8a8a',
    icon: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.2 3.6-5 7-5s6.2 1.8 7 5"/>',
  },
];

/** A11y strings for ProductSwitcher; override per locale via `labels`. */
export interface ProductSwitcherLabels {
  /** Accessible label of the grid trigger button. */
  switchProduct: string;
  /** Accessible label of the product grid. */
  products: string;
  /** Visually hidden marker appended to the current product tile. */
  current: string;
}

export type ProductSwitcherLabelOverrides = Partial<ProductSwitcherLabels>;

export const DEFAULT_PRODUCT_SWITCHER_LABELS: ProductSwitcherLabels = {
  switchProduct: 'Switch product',
  products: 'Latere products',
  current: 'Current product',
};
