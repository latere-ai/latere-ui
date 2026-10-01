import { describe, expect, it } from 'vitest';

import { orgSwitcherItems, orgSwitcherLabel } from '../src/session/orgSwitcherModel';
import type { OrgEntry } from '../src/session/types';

const ORGS: OrgEntry[] = [
  { id: 'o1', name: 'Org One', slug: 'org-one', owner: true },
  { id: 'o2', name: 'Org Two' },
];

describe('orgSwitcherItems()', () => {
  it('lists Personal first, then the orgs in API order', () => {
    const items = orgSwitcherItems(ORGS, '', 'Personal');
    expect(items.map((i) => i.id)).toEqual(['', 'o1', 'o2']);
    expect(items[0]).toEqual({ id: '', name: 'Personal', active: true });
    expect(items[1]).toMatchObject({ name: 'Org One', slug: 'org-one', owner: true, active: false });
    expect(items[2].owner).toBeFalsy();
  });

  it('holds only the Personal row before any org is known', () => {
    expect(orgSwitcherItems([], '', 'Personal').map((i) => i.id)).toEqual(['']);
  });

  it('marks the current org active and nothing else', () => {
    const items = orgSwitcherItems(ORGS, 'o2', 'Personal');
    expect(items.map((i) => i.active)).toEqual([false, false, true]);
  });
});

describe('orgSwitcherLabel()', () => {
  it('names the personal context with the given label', () => {
    expect(orgSwitcherLabel(ORGS, '', 'My Personal Account')).toBe('My Personal Account');
  });

  it('names the current org', () => {
    expect(orgSwitcherLabel(ORGS, 'o2', 'Personal')).toBe('Org Two');
  });

  it('falls back to the org id when the list does not hold it', () => {
    expect(orgSwitcherLabel([], 'unknown', 'Personal')).toBe('unknown');
  });
});
