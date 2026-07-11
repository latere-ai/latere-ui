// Types + built-in product registry for ProductSwitcher, kept in a .ts module
// (not the .vue) so the package entrypoint can re-export them without a
// consumer's vue-tsc falling back to the default-only `*.vue` shim and losing
// the named members.
//
// The registry is the single source of truth for cross-product identity:
// slug, display name, console origin, the canonical inline SVG mark, and the
// primary brand color. The marks are copied verbatim from the marketing
// site's product registry (latere-ai/frontend/src/data/products.ts), with
// only sizing attributes adjusted, so the switcher, the library footer, and
// the site all show the same founder-approved logos. SiteFooter renders its
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
  /** Primary brand color, for hosts that need a single solid swatch. */
  color: string;
  /**
   * Complete inline SVG markup of the canonical product mark (aria-hidden,
   * colors baked in), copied from the marketing site's registry with only
   * sizing attributes adjusted for the tile.
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
    icon: '<svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;"><rect x="0" y="0" width="6" height="3" fill="#d97757"/><rect x="7" y="0" width="9" height="3" fill="#c4623f"/><rect x="0" y="4" width="4" height="3" fill="#a84e2e"/><rect x="5" y="4" width="6" height="3" fill="#d97757"/><rect x="12" y="4" width="4" height="3" fill="#c4623f"/><rect x="0" y="8" width="7" height="3" fill="#c4623f"/><rect x="8" y="8" width="8" height="3" fill="#a84e2e"/><rect x="0" y="12" width="3" height="4" fill="#d97757"/><rect x="4" y="12" width="6" height="4" fill="#a84e2e"/><rect x="11" y="12" width="5" height="4" fill="#d97757"/></svg>',
  },
  {
    slug: 'topos',
    name: 'Topos',
    url: 'https://topos.latere.ai',
    color: '#55707a',
    brandClass: 'topos-brand',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#55707a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="7" r="2.2"/><circle cx="17" cy="6" r="2.2"/><circle cx="18" cy="17" r="2.2"/><circle cx="7" cy="18" r="2.2"/><path d="M8.1 7.4c2.3 1.3 4.8 1.1 6.9-.5M16.5 8.1c1.4 2 1.8 4.3 1.5 6.7M15.9 17.4c-2.1.9-4.4 1.1-6.7.6M6.8 15.8c-.7-2.2-.8-4.4-.2-6.6M9 9.1l6 6"/></svg>',
  },
  {
    slug: 'cella',
    name: 'Cella',
    url: 'https://cella.latere.ai',
    color: '#6b9e7c',
    brandClass: 'cella-brand',
    icon: '<svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;"><rect x="0" y="0" width="16" height="3" fill="#4a7558"/><rect x="0" y="13" width="16" height="3" fill="#4a7558"/><rect x="0" y="3" width="3" height="10" fill="#4a7558"/><rect x="13" y="3" width="3" height="10" fill="#4a7558"/><rect x="3" y="3" width="6" height="4" fill="#8fb894"/><rect x="9" y="3" width="4" height="4" fill="#6b9e7c"/><rect x="3" y="7" width="4" height="3" fill="#6b9e7c"/><rect x="7" y="7" width="6" height="3" fill="#8fb894"/><rect x="3" y="10" width="7" height="3" fill="#8fb894"/><rect x="10" y="10" width="3" height="3" fill="#6b9e7c"/></svg>',
  },
  {
    slug: 'lux',
    name: 'Lux',
    url: 'https://lux.latere.ai',
    color: '#3a4ed1',
    brandClass: 'lux-brand',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3a4ed1" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 4l8 14H4z"/><path d="M2 11h2M20 11h2M12 20v2" opacity="0.7"/></svg>',
  },
  {
    slug: 'lectio',
    name: 'Lectio',
    url: 'https://lectio.latere.ai',
    color: '#b87333',
    brandClass: 'lectio-brand',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b87333" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3 H14 L18 7 V21 H6 Z"/><path d="M14 3 V7 H18"/><path d="M9 12 H15M9 15.5 H15" opacity="0.7"/></svg>',
  },
  {
    slug: 'drive',
    name: 'Drive',
    url: 'https://drive.latere.ai',
    color: '#c9a227',
    brandClass: 'drive-brand',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a227" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 7.2a1.2 1.2 0 011.2-1.2h4.6l2 2.4h8a1.2 1.2 0 011.2 1.2v8.2a1.2 1.2 0 01-1.2 1.2H4.7a1.2 1.2 0 01-1.2-1.2z"/><path d="M8 14.6h8" opacity="0.7"/></svg>',
  },
  {
    slug: 'identity',
    name: 'Identity',
    url: 'https://auth.latere.ai',
    color: '#6b5fc0',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b5fc0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="4"/><path d="M10.8 10.8 19 19M15.6 15.6 18 13M18 18 20.4 15.6"/></svg>',
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
