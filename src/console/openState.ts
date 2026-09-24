// Which parent rows of the console sidebar are open. Both adapters keep the
// same map, so the rule lives here: a parent the viewer has opened or closed
// keeps that choice, one they have not touched is open exactly when it holds
// the current page, and arriving at a page opens every parent above it. The
// map persists per viewer in localStorage under a host-chosen key; storage
// that is missing, full or blocked leaves the rail working without memory.

import { hasChildren, type NavItem } from './nav';

/** The storage key used when the host names none. */
export const DEFAULT_NAV_OPEN_KEY = 'latere-ui:console-nav-open';

/** Parent id to open (true) or closed (false). Absent means untouched. */
export type NavOpenState = Record<string, boolean>;

// The window's storage. Reading the property itself throws in a sandboxed
// frame, and there is no window during server rendering.
function storage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/** The stored map for `key`, or an empty one when there is none to read. */
export function readNavOpen(key: string | null | undefined): NavOpenState {
  if (!key) return {};
  try {
    const raw = storage()?.getItem(key);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const state: NavOpenState = {};
    for (const [id, open] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof open === 'boolean') state[id] = open;
    }
    return state;
  } catch {
    // Blocked storage or a value another version wrote: start untouched.
    return {};
  }
}

/** Store the map under `key`. A failed write keeps the in-memory state. */
export function writeNavOpen(key: string | null | undefined, state: NavOpenState): void {
  if (!key) return;
  try {
    storage()?.setItem(key, JSON.stringify(state));
  } catch {
    // Private mode, quota or a sandboxed frame: the rail still works this visit.
  }
}

/** Whether the parent `id` shows its children. */
export function isNavOpen(state: NavOpenState, id: string, path: NavItem[]): boolean {
  const choice = state[id];
  if (choice !== undefined) return choice;
  return path.some((item) => item.id === id);
}

/**
 * The map with every parent on the active path opened. Returns `state`
 * itself when nothing changes, so a caller can skip a render and a write.
 */
export function openActivePath(state: NavOpenState, path: NavItem[]): NavOpenState {
  let next = state;
  for (const item of path) {
    if (!hasChildren(item) || state[item.id] === true) continue;
    if (next === state) next = { ...state };
    next[item.id] = true;
  }
  return next;
}

/** The map with the parent `id` set to `open`. */
export function setNavOpen(state: NavOpenState, id: string, open: boolean): NavOpenState {
  return state[id] === open ? state : { ...state, [id]: open };
}
