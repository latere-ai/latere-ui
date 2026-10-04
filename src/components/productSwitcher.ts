// Types + built-in product registry for ProductSwitcher, kept in a .ts module
// (not the .vue) so the package entrypoint can re-export them without a
// consumer's vue-tsc falling back to the default-only `*.vue` shim and losing
// the named members.
//
// The registry is the single source of truth for cross-product identity:
// slug, display name, console origin, the canonical inline SVG mark, and the
// primary brand color. The marks are copied verbatim from the marketing
// site's product registry, with only sizing attributes adjusted, so the
// switcher, the library footer, and the site all show the same logos.
// Footer application links reuse these URLs; footerNavigation owns their grouping.

export type ProductSlug =
  | 'chat'
  | 'topos'
  | 'cella'
  | 'lux'
  | 'identity';

export interface ProductInfo {
  /** Stable id; matches the `<slug>-brand` wordmark class in brand.css. */
  slug: ProductSlug | (string & {});
  /** English display name. Pass a translated `products` array to localize. */
  name: string;
  /**
   * Where the product is used, no trailing slash: an origin such as
   * "https://chat.latere.ai", or the product's section of the platform console
   * such as "https://platform.latere.ai/console/models".
   */
  url: string;
  /** Primary brand color, for hosts that need a single solid swatch. */
  color: string;
  /**
   * Complete inline SVG markup of the canonical product mark (aria-hidden,
   * colors baked in, or `currentColor` for a mark drawn in the ink of the
   * text), copied from the marketing site's registry with only sizing
   * attributes adjusted for the tile.
   */
  icon: string;
  /** Wordmark class from brand.css; omitted for neutral products. */
  brandClass?: string;
}

/**
 * Built-in product-switcher destinations. Footer navigation selects and groups
 * its destinations separately in footerNavigation.ts.
 */
export const LATERE_PRODUCTS: readonly ProductInfo[] = [
  // The chat, whose public name is Latere. Its mark is the Latere mark at
  // rest, five arcs and the dot, filled with `currentColor` so it takes the
  // ink of the tile's text; `color` is the accent the company site gives it.
  {
    slug: 'chat',
    name: 'Latere',
    url: 'https://chat.latere.ai',
    color: '#c4511f',
    brandClass: 'chat-brand',
    icon: '<svg width="22" height="22" viewBox="147 279 736 425" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 1024) scale(0.1 -0.1)"><path d="M7281 7439 c-263 -25 -575 -124 -883 -280 -385 -196 -764 -463 -1133 -799 -163 -148 -575 -562 -702 -704 -315 -353 -539 -670 -638 -905 -19 -45 -35 -87 -35 -93 0 -6 22 23 48 63 168 256 665 790 1042 1120 638 557 1244 947 1735 1115 304 105 506 139 760 131 175 -6 239 -17 385 -63 103 -32 144 -52 238 -117 225 -155 371 -428 402 -751 35 -378 -122 -885 -405 -1311 -209 -314 -531 -641 -865 -882 -505 -364 -1124 -588 -1747 -633 -196 -14 -423 -1 -648 36 -166 28 -381 81 -464 113 -82 33 -73 17 15 -27 387 -193 909 -283 1409 -242 878 73 1740 531 2341 1245 348 413 589 914 670 1390 23 136 24 434 1 566 -68 393 -280 698 -607 872 -244 130 -585 188 -919 156z"/><path d="M3790 7343 c-199 -13 -403 -45 -550 -84 -738 -199 -1279 -609 -1578 -1197 -73 -143 -122 -285 -159 -457 -24 -118 -27 -149 -26 -330 0 -175 3 -215 26 -321 59 -279 177 -525 353 -734 325 -388 794 -609 1348 -637 313 -15 763 72 1096 212 262 110 529 267 730 428 99 80 286 263 365 357 57 68 155 210 155 224 0 4 -43 -32 -96 -78 -286 -251 -789 -554 -1129 -679 -629 -232 -1234 -231 -1698 3 -127 64 -211 123 -311 219 -217 210 -357 460 -422 761 -15 68 -19 127 -19 290 0 186 3 215 27 315 171 719 788 1271 1658 1484 488 119 948 121 1424 6 55 -13 102 -23 103 -21 6 6 -184 85 -277 115 -274 89 -728 145 -1020 124z"/><path d="M4355 6874 c-431 -32 -757 -119 -1081 -288 -453 -236 -748 -562 -860 -951 -87 -303 -41 -671 114 -915 170 -269 431 -430 787 -487 140 -22 438 -14 589 16 141 29 289 77 402 133 93 46 209 116 203 123 -2 1 -44 -11 -94 -27 -218 -74 -505 -110 -709 -90 -268 27 -449 86 -641 209 -364 235 -484 682 -295 1099 207 458 718 825 1385 994 444 113 807 127 1130 43 13 -3 17 -2 10 5 -33 32 -307 102 -480 122 -100 11 -382 20 -460 14z"/><path d="M7115 6809 c-463 -70 -919 -303 -1510 -775 -518 -413 -995 -938 -1203 -1328 -24 -43 -41 -82 -40 -87 2 -4 38 36 80 89 256 323 656 710 1038 1008 596 465 1139 743 1568 805 118 17 317 7 412 -21 225 -64 378 -206 446 -412 25 -75 28 -98 28 -228 0 -105 -5 -169 -18 -230 -80 -368 -281 -709 -631 -1069 -258 -265 -535 -468 -865 -632 -531 -264 -991 -378 -1539 -380 -210 0 -213 -9 -13 -36 168 -22 500 -22 675 1 333 43 709 152 1027 299 169 77 407 220 570 340 566 418 941 947 1065 1502 25 112 31 372 10 480 -60 317 -255 543 -549 634 -152 47 -389 64 -551 40z"/><path d="M6770 6241 c-199 -43 -425 -141 -623 -271 -60 -40 -107 -74 -104 -76 2 -2 42 14 88 35 122 57 334 127 455 151 334 64 544 -32 595 -273 19 -88 6 -238 -30 -346 -40 -118 -133 -301 -218 -428 -198 -297 -501 -598 -818 -811 -264 -177 -470 -272 -845 -391 -59 -18 127 -5 260 19 226 41 432 114 693 247 647 330 1105 859 1233 1424 12 50 17 120 18 214 0 121 -3 149 -23 205 -54 155 -154 253 -305 299 -88 27 -253 28 -376 2z"/><circle cx="5640" cy="5248" r="294"/></g></svg>',
  },
  {
    slug: 'topos',
    name: 'Topos',
    url: 'https://platform.latere.ai/console/agents',
    color: '#55707a',
    brandClass: 'topos-brand',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#55707a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="7" r="2.2"/><circle cx="17" cy="6" r="2.2"/><circle cx="18" cy="17" r="2.2"/><circle cx="7" cy="18" r="2.2"/><path d="M8.1 7.4c2.3 1.3 4.8 1.1 6.9-.5M16.5 8.1c1.4 2 1.8 4.3 1.5 6.7M15.9 17.4c-2.1.9-4.4 1.1-6.7.6M6.8 15.8c-.7-2.2-.8-4.4-.2-6.6M9 9.1l6 6"/></svg>',
  },
  {
    slug: 'cella',
    name: 'Cella',
    url: 'https://platform.latere.ai/console/environments',
    color: '#6b9e7c',
    brandClass: 'cella-brand',
    icon: '<svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;"><rect x="0" y="0" width="16" height="3" fill="#4a7558"/><rect x="0" y="13" width="16" height="3" fill="#4a7558"/><rect x="0" y="3" width="3" height="10" fill="#4a7558"/><rect x="13" y="3" width="3" height="10" fill="#4a7558"/><rect x="3" y="3" width="6" height="4" fill="#8fb894"/><rect x="9" y="3" width="4" height="4" fill="#6b9e7c"/><rect x="3" y="7" width="4" height="3" fill="#6b9e7c"/><rect x="7" y="7" width="6" height="3" fill="#8fb894"/><rect x="3" y="10" width="7" height="3" fill="#8fb894"/><rect x="10" y="10" width="3" height="3" fill="#6b9e7c"/></svg>',
  },
  {
    slug: 'lux',
    name: 'Lux',
    url: 'https://platform.latere.ai/console/models',
    color: '#3a4ed1',
    brandClass: 'lux-brand',
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3a4ed1" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 4l8 14H4z"/><path d="M2 11h2M20 11h2M12 20v2" opacity="0.7"/></svg>',
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
