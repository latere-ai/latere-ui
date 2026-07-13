// Uncontrolled collapse primitive for the console rail. Split out of
// `console/nav.ts` (react-support v1.27) because this is the one piece of
// that module that isn't framework-agnostic: it holds reactive Vue state.
// nav.ts's data shapes (NavItem/NavGroup/ConsoleNavModel) and pure functions
// (partitionGroups/isItemDisabled/flattenNavItems) stay vue-free so the React
// ConsoleSidebar can value-import them without pulling `vue` in transitively;
// hosts that want the Vue collapse ref keep importing it from here.
import { ref, type Ref } from 'vue';

export interface CollapseOptions {
  /** Starting collapsed state. Default: `false` (expanded). */
  initial?: boolean;
  /**
   * Called on every change so the host can persist the value
   * (e.g. to localStorage / a prefs store).
   */
  onChange?: (collapsed: boolean) => void;
}

export interface CollapseState {
  /** Reactive collapsed flag. */
  collapsed: Ref<boolean>;
  /** Flip the current value. */
  toggle: () => void;
  /** Set an explicit value. */
  set: (v: boolean) => void;
}

/**
 * Uncontrolled collapse helper. Hosts that own the state (e.g. wallfacer,
 * which persists it) can ignore this and drive `v-model:collapsed` directly;
 * hosts that want the sidebar to manage its own state use this.
 */
export function createCollapse(opts: CollapseOptions = {}): CollapseState {
  const collapsed = ref(opts.initial ?? false);
  function set(v: boolean) {
    if (collapsed.value === v) return;
    collapsed.value = v;
    opts.onChange?.(v);
  }
  return {
    collapsed,
    toggle: () => set(!collapsed.value),
    set,
  };
}
