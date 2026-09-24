// The command palette's entries and matching, shared by the Vue and React
// ConsolePalette. The palette lists every routable row of the nav model,
// children included, then the host's own entries (actions such as "Create
// an API key", or destinations outside the rail), and on a query adds what
// the host's search returns (for example documentation pages).

import { flattenNavItems, type NavGroup, type NavItem } from './nav';

/** One palette row. `group` is set at the row's end; `keywords` also match. */
export interface ConsolePaletteItem extends NavItem {
  group?: string;
  keywords?: string;
}

/** Search the host runs on a non-empty query; its rows follow the matches. */
export type ConsolePaletteSearch = (query: string) => ConsolePaletteItem[];

/**
 * The rows the palette offers before any query: routable, enabled nav rows
 * (a child names its parent as its group, and shows its parent's icon when
 * it has none, so every row of a section lines up) followed by the host's
 * entries that lead somewhere or run an action.
 */
export function paletteEntries(groups: NavGroup[], items: ConsolePaletteItem[] = []): ConsolePaletteItem[] {
  const parentIcon = new Map<string, string>();
  for (const g of groups) for (const item of g.items) {
    if (item.icon) for (const child of item.children ?? []) parentIcon.set(child.id, item.icon);
  }
  const nav = flattenNavItems(groups)
    .filter((item) => item.to && item.disabled !== true)
    .map((item) => {
      const icon = item.icon ?? parentIcon.get(item.id);
      return { ...item, ...(icon ? { icon } : {}), group: item.parentLabel ?? item.groupLabel };
    });
  return [...nav, ...items.filter((item) => item.disabled !== true && (item.to !== undefined || item.action === true))];
}

/**
 * The rows matching `query`: every whitespace-separated term must appear in
 * the label, the group or the keywords, ignoring case. The host's search
 * results follow, minus any id already listed. An empty query lists all.
 */
export function filterPalette(
  entries: ConsolePaletteItem[],
  query: string,
  search?: ConsolePaletteSearch,
): ConsolePaletteItem[] {
  const q = query.trim();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return entries;
  const hits = entries.filter((entry) => {
    const text = [entry.label, entry.group, entry.keywords].filter(Boolean).join(' ').toLowerCase();
    return terms.every((term) => text.includes(term));
  });
  if (!search) return hits;
  const seen = new Set(hits.map((entry) => entry.id));
  return [...hits, ...search(q).filter((entry) => !seen.has(entry.id))];
}
