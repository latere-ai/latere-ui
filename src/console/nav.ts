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
  /**
   * Sub-pages of this row. In the expanded rail the row becomes a disclosure
   * that shows or hides them (folded until a descendant is active or the
   * viewer opens it); in the collapsed rail it is a link to `to`, or to its
   * first enabled child when it has no route of its own. The sidebar renders
   * one level: a child's own children are not shown.
   */
  children?: NavItem[];
}

/**
 * A row of the rail's foot, above the account control: a link or an action
 * with an icon and an optional trailing value (for example a balance).
 */
export interface NavFootItem extends NavItem {
  /** Short text set at the row's end, such as "$8.16". */
  value?: string;
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

/**
 * A nav item lifted out of its group, tagged with the group's label and, for
 * a child row, the label of the row it sits under.
 */
export interface FlatNavItem extends NavItem {
  groupLabel?: string;
  parentLabel?: string;
}

function flattenItem(item: NavItem, groupLabel: string | undefined, parentLabel?: string): FlatNavItem[] {
  const flat: FlatNavItem = parentLabel === undefined
    ? { ...item, groupLabel }
    : { ...item, groupLabel, parentLabel };
  return [flat, ...(item.children ?? []).flatMap((child) => flattenItem(child, groupLabel, item.label))];
}

/**
 * Flatten the grouped model into one in-order list (for palettes/search).
 * Children follow their parent, depth first.
 */
export function flattenNavItems(groups: NavGroup[]): FlatNavItem[] {
  return groups.flatMap((g) => g.items.flatMap((item) => flattenItem(item, g.label)));
}

/** True when the row carries at least one child row. */
export function hasChildren(item: NavItem): boolean {
  return (item.children?.length ?? 0) > 0;
}

/** True when a row should not be interactive. */
export function isItemDisabled(item: NavItem): boolean {
  if (item.disabled === true) return true;
  // A parent opens its children, so it is interactive without a route.
  if (hasChildren(item)) return false;
  // Action rows are interactive without a route; everything else needs a `to`.
  return item.to === undefined && item.action !== true;
}

/**
 * The rows from a top-level item down to the row whose id is `activeKey`,
 * inclusive, or an empty list when no row matches. The sidebar opens every
 * parent on this path and marks it as holding the current page.
 */
export function activePath(groups: NavGroup[], activeKey: string | undefined): NavItem[] {
  if (activeKey === undefined) return [];
  function walk(items: NavItem[]): NavItem[] | undefined {
    for (const item of items) {
      if (item.id === activeKey) return [item];
      const below = item.children ? walk(item.children) : undefined;
      if (below) return [item, ...below];
    }
    return undefined;
  }
  for (const g of groups) {
    const path = walk(g.items);
    if (path) return path;
  }
  return [];
}

/**
 * Where a row leads when it is followed as a link: its own route, or the
 * first enabled child's, depth first. A collapsed rail has no room for
 * children, so a parent row there goes to this address.
 */
export function navTarget(item: NavItem): string | undefined {
  if (item.to !== undefined) return item.to;
  for (const child of item.children ?? []) {
    if (child.disabled === true) continue;
    const to = navTarget(child);
    if (to !== undefined) return to;
  }
  return undefined;
}
