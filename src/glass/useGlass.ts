// Headless glue for the Liquid Glass material. Framework-thin: it maps a tier
// to its utility class and exposes the live `prefers-reduced-transparency`
// state so components can branch behavior (e.g. drop a parallax) beyond what
// the pure-CSS fallback already handles. SSR-safe: without `window` it resolves
// to a stable, non-reactive default and never touches matchMedia.

import { readonly, ref, onScopeDispose, type Ref } from 'vue';

/** Material depth tiers. See `glass.css`. */
export type GlassTier = 'thin' | 'regular' | 'thick';

const TIER_CLASS: Record<GlassTier, string> = {
  thin: 'lu-glass-thin',
  regular: 'lu-glass',
  thick: 'lu-glass-thick',
};

/** The utility class that paints a given tier. */
export function glassClass(tier: GlassTier = 'regular'): string {
  return TIER_CLASS[tier];
}

export interface UseGlass {
  /** Resolve a tier to its utility class (reactive-friendly, pure). */
  glassClass: (tier?: GlassTier) => string;
  /** True when the user asked for reduced transparency; glass renders opaque. */
  reducedTransparency: Readonly<Ref<boolean>>;
}

const QUERY = '(prefers-reduced-transparency: reduce)';

/**
 * Reactive access to the glass material state. Call inside `setup()`; the
 * media-query listener is torn down with the component scope.
 */
export function useGlass(): UseGlass {
  const reduced = ref(false);

  // No `window`/matchMedia (SSR, older test envs) → stay at the opaque-safe
  // default and skip the listener entirely.
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mql = window.matchMedia(QUERY);
    reduced.value = mql.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reduced.value = e.matches;
    };
    // addEventListener is the modern API; guard for very old Safari.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      onScopeDispose(() => mql.removeEventListener('change', onChange));
    } else if (typeof mql.addListener === 'function') {
      mql.addListener(onChange);
      onScopeDispose(() => mql.removeListener(onChange));
    }
  }

  return {
    glassClass,
    reducedTransparency: readonly(reduced),
  };
}
