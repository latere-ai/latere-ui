// Vue entry point for the Liquid Glass runtime. Call once near the app root;
// it enhances qualifying glass surfaces after mount and re-scans whenever the
// optional `watchSource` changes (wire it to the route so newly-mounted screens
// get refraction + sheen too). Accessibility preference changes also trigger
// a rescan. SSR-safe — the runtime no-ops without a DOM.
import { nextTick, onMounted, onUnmounted, watch, type WatchSource } from 'vue';

import { initLiquidGlass } from './liquidGlass';

export interface UseLiquidGlassOptions {
  /** Re-scan when this changes (e.g. `() => route.fullPath`). */
  watchSource?: WatchSource<unknown>;
  /** Limit scanning to a subtree; defaults to the whole document. */
  root?: () => Document | HTMLElement | null | undefined;
}

export function useLiquidGlass(options: UseLiquidGlassOptions = {}): void {
  let disposed = false;
  const scan = () => {
    void nextTick(() => {
      if (!disposed) initLiquidGlass(options.root?.() ?? undefined);
    });
  };
  const preferences: MediaQueryList[] = [];
  onMounted(() => {
    for (const feature of ['motion', 'transparency']) {
      const query = window.matchMedia?.('(prefers-reduced-' + feature + ': reduce)');
      if (query) {
        query.addEventListener('change', scan);
        preferences.push(query);
      }
    }
    scan();
  });
  onUnmounted(() => {
    disposed = true;
    preferences.forEach((query) => query.removeEventListener('change', scan));
  });
  if (options.watchSource) {
    watch(options.watchSource, scan);
  }
}
