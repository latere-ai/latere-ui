// Headless console-navigation model. Holds the data shape every product
// console already uses (a list of grouped nav items) plus a tiny
// controlled/uncontrolled collapse primitive. No DOM, no router — the visual
// representation lives in the Vue adapter at src/components/ConsoleSidebar.vue,
// exactly as createOrgSwitcher relates to OrgSwitcher.vue.
//
// lux, agents and wallfacer each independently arrived at
// `groups: { group, items: NavItem[] }[]`; this is that shape, unified.

import { ref, type Ref } from 'vue';

/** A single navigation row. */
export interface NavItem {
  /** Stable id; also the key matched against `activeKey` for active styling. */
  id: string;
  /** Visible label (already localized by the host). */
  label: string;
  /** Route target. Omit to render the row disabled ("not yet wired"). */
  to?: string;
  /** Icon name passed through to the host's icon slot. */
  icon?: string;
  /**
   * Badge for the row: a number renders a count pill, the string 'live'
   * renders a pulsing dot + "live" label, undefined renders nothing.
   */
  badge?: number | 'live';
  /** Open `to` in a new tab (external links). */
  external?: boolean;
  /** Force the row disabled even when `to` is present. */
  disabled?: boolean;
}

/** A labeled section of nav rows, optionally pinned to the rail's bottom. */
export interface NavGroup {
  /** Section heading; omit for an unlabeled group. */
  label?: string;
  /** Pin the group to the top (default) or the bottom of the rail. */
  pin?: 'top' | 'bottom';
  items: NavItem[];
}

/** The full grouped model the sidebar renders. */
export interface ConsoleNavModel {
  groups: NavGroup[];
}

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

/**
 * Split groups into top- and bottom-pinned buckets, each preserving the
 * caller's original order. Groups without an explicit pin go to the top.
 */
export function partitionGroups(groups: NavGroup[]): {
  top: NavGroup[];
  bottom: NavGroup[];
} {
  const top: NavGroup[] = [];
  const bottom: NavGroup[] = [];
  for (const g of groups) {
    (g.pin === 'bottom' ? bottom : top).push(g);
  }
  return { top, bottom };
}

/** True when a row should not be interactive. */
export function isItemDisabled(item: NavItem): boolean {
  return item.disabled === true || item.to === undefined;
}
