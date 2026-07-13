// Headless console-navigation model. Holds the data shape every product
// console already uses (a list of grouped nav items) plus the pure
// partition/flatten/disabled helpers. No DOM, no router, no framework runtime
// import — both the Vue adapter (src/components/ConsoleSidebar.vue) and the
// React adapter (src/react/ConsoleSidebar.tsx) value-import this module
// directly, so it must stay import-clean of `vue`. The one piece of the
// original console-nav primitive that held Vue state — the uncontrolled
// collapse ref — lives in `./collapse` instead (react-support v1.27).
//
// lux, agents and wallfacer each independently arrived at
// `groups: { group, items: NavItem[] }[]`; this is that shape, unified.

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
  /** Small trailing attention dot (e.g. an unread indicator). */
  dot?: boolean;
  /**
   * Action row: interactive without a route (renders as a button). Clicking
   * emits `navigate`; the host runs the side effect (toggle a panel, open a
   * modal). Lets non-navigational controls live in the nav.
   */
  action?: boolean;
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

/** A nav item lifted out of its group, tagged with the group's label. */
export interface FlatNavItem extends NavItem {
  groupLabel?: string;
}

/** Flatten the grouped model into one in-order list (for palettes/search). */
export function flattenNavItems(groups: NavGroup[]): FlatNavItem[] {
  const out: FlatNavItem[] = [];
  for (const g of groups) {
    for (const item of g.items) out.push({ ...item, groupLabel: g.label });
  }
  return out;
}

/** True when a row should not be interactive. */
export function isItemDisabled(item: NavItem): boolean {
  if (item.disabled === true) return true;
  // Action rows are interactive without a route; everything else needs a `to`.
  return item.to === undefined && item.action !== true;
}
