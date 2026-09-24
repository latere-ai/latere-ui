import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { activePath, flattenNavItems, hasChildren, isItemDisabled, navTarget, type NavGroup } from '../src/console/nav';
import {
  DEFAULT_NAV_OPEN_KEY,
  isNavOpen,
  openActivePath,
  readNavOpen,
  setNavOpen,
  writeNavOpen,
} from '../src/console/openState';
import { installLocalStorage } from './local-storage';

const groups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { id: 'home', label: 'Home', to: '/', icon: 'home' },
      {
        id: 'storage', label: 'Storage', to: '/storage', icon: 'folder', children: [
          { id: 'storage:files', label: 'Files', to: '/storage/files' },
          { id: 'storage:trash', label: 'Trash', to: '/storage/trash' },
        ],
      },
      {
        id: 'admin', label: 'Admin', icon: 'shield', children: [
          { id: 'admin:off', label: 'Off', to: '/admin/off', disabled: true },
          { id: 'admin:fleet', label: 'Fleet', to: '/admin/fleet' },
        ],
      },
    ],
  },
  { label: 'Other', pin: 'bottom', items: [{ id: 'soon', label: 'Soon' }] },
];

describe('nav tree helpers', () => {
  it('flattens children after their parent and names the parent', () => {
    const flat = flattenNavItems(groups);
    expect(flat.map((i) => i.id)).toEqual(['home', 'storage', 'storage:files', 'storage:trash', 'admin', 'admin:off', 'admin:fleet', 'soon']);
    const files = flat.find((i) => i.id === 'storage:files')!;
    expect(files.parentLabel).toBe('Storage');
    expect(files.groupLabel).toBe('Main');
    // A top-level row carries no parentLabel key at all.
    expect('parentLabel' in flat[0]).toBe(false);
  });

  it('treats a parent without a route as interactive', () => {
    const admin = groups[0].items[2];
    expect(hasChildren(admin)).toBe(true);
    expect(isItemDisabled(admin)).toBe(false);
    expect(isItemDisabled({ ...admin, disabled: true })).toBe(true);
    expect(isItemDisabled({ id: 'x', label: 'X', children: [] })).toBe(true);
  });

  it('finds the path to the active row', () => {
    expect(activePath(groups, 'storage:trash').map((i) => i.id)).toEqual(['storage', 'storage:trash']);
    expect(activePath(groups, 'home').map((i) => i.id)).toEqual(['home']);
    expect(activePath(groups, 'nope')).toEqual([]);
    expect(activePath(groups, undefined)).toEqual([]);
  });

  it('sends a parent without a route to its first enabled child', () => {
    expect(navTarget(groups[0].items[1])).toBe('/storage');
    expect(navTarget(groups[0].items[2])).toBe('/admin/fleet');
    expect(navTarget({ id: 'x', label: 'X' })).toBeUndefined();
  });
});

describe('open state', () => {
  beforeEach(() => installLocalStorage());
  afterEach(() => vi.restoreAllMocks());

  it('round-trips through localStorage and ignores foreign values', () => {
    writeNavOpen('k', { storage: true, admin: false });
    expect(readNavOpen('k')).toEqual({ storage: true, admin: false });
    window.localStorage.setItem('k', JSON.stringify({ storage: 'yes', admin: false }));
    expect(readNavOpen('k')).toEqual({ admin: false });
    window.localStorage.setItem('k', '[true]');
    expect(readNavOpen('k')).toEqual({});
    window.localStorage.setItem('k', '{not json');
    expect(readNavOpen('k')).toEqual({});
    expect(readNavOpen(null)).toEqual({});
    expect(readNavOpen('missing')).toEqual({});
    expect(DEFAULT_NAV_OPEN_KEY).toBe('latere-ui:console-nav-open');
  });

  it('keeps working when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(readNavOpen('k')).toEqual({});
    expect(() => writeNavOpen('k', { a: true })).not.toThrow();
  });

  it('does not write without a key', () => {
    writeNavOpen(null, { a: true });
    expect(window.localStorage.length).toBe(0);
  });

  it('opens an untouched parent only while it holds the current page', () => {
    const path = activePath(groups, 'storage:files');
    expect(isNavOpen({}, 'storage', path)).toBe(true);
    expect(isNavOpen({}, 'admin', path)).toBe(false);
    expect(isNavOpen({ storage: false }, 'storage', path)).toBe(false);
    expect(isNavOpen({ admin: true }, 'admin', path)).toBe(true);
  });

  it('opens every parent on the active path and reports no change as the same object', () => {
    const state = { admin: true };
    const next = openActivePath(state, activePath(groups, 'storage:files'));
    expect(next).toEqual({ admin: true, storage: true });
    expect(openActivePath(next, activePath(groups, 'storage:files'))).toBe(next);
    // A leaf on the path is never recorded.
    expect(openActivePath({}, activePath(groups, 'home'))).toEqual({});
  });

  it('sets one parent and keeps identity when nothing changes', () => {
    const state = { storage: true };
    expect(setNavOpen(state, 'storage', true)).toBe(state);
    expect(setNavOpen(state, 'storage', false)).toEqual({ storage: false });
  });
});
