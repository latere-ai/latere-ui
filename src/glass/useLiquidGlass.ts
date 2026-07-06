// Vue entry point for the Liquid Glass runtime. Call once near the app root;
// it enhances qualifying glass surfaces after mount and re-scans whenever the
// optional `watchSource` changes (wire it to the route so newly-mounted screens
// get refraction + sheen too). SSR-safe — the runtime no-ops without a DOM.
import { nextTick, onMounted, watch, type WatchSource } from 'vue';

import { initLiquidGlass } from './liquidGlass';

export interface UseLiquidGlassOptions {
  /** Re-scan when this changes (e.g. `() => route.fullPath`). */
  watchSource?: WatchSource<unknown>;
  /** Limit scanning to a subtree; defaults to the whole document. */
  root?: () => Document | HTMLElement | null | undefined;
}

export function useLiquidGlass(options: UseLiquidGlassOptions = {}): void {
  const scan = () => {
    void nextTick(() => initLiquidGlass(options.root?.() ?? undefined));
  };
  onMounted(scan);
  if (options.watchSource) {
    watch(options.watchSource, scan);
  }
}
