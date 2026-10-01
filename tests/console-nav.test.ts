import { describe, expect, it } from 'vitest';

import {
  partitionGroups,
  isItemDisabled,
  type NavGroup,
} from '../src/console/nav';

describe('partitionGroups()', () => {
  const groups: NavGroup[] = [
    { label: 'Workspace', items: [] },
    { label: 'Settings', pin: 'bottom', items: [] },
    { label: 'Configure', pin: 'top', items: [] },
    { label: 'Org', pin: 'bottom', items: [] },
  ];

  it('splits by pin while preserving order', () => {
    const { top, bottom } = partitionGroups(groups);
    expect(top.map((g) => g.label)).toEqual(['Workspace', 'Configure']);
    expect(bottom.map((g) => g.label)).toEqual(['Settings', 'Org']);
  });

  it('treats a missing pin as top', () => {
    const { top, bottom } = partitionGroups([{ items: [] }]);
    expect(top.length).toBe(1);
    expect(bottom.length).toBe(0);
  });
});

describe('isItemDisabled()', () => {
  it('is disabled without a route target', () => {
    expect(isItemDisabled({ id: 'x', label: 'X' })).toBe(true);
  });
  it('is enabled with a route target', () => {
    expect(isItemDisabled({ id: 'x', label: 'X', to: '/x' })).toBe(false);
  });
  it('respects an explicit disabled flag even with a target', () => {
    expect(isItemDisabled({ id: 'x', label: 'X', to: '/x', disabled: true })).toBe(true);
  });
});
