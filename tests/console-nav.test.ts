import { describe, expect, it, vi } from 'vitest';

import { createCollapse } from '../src/console/collapse';
import {
  partitionGroups,
  isItemDisabled,
  type NavGroup,
} from '../src/console/nav';

describe('createCollapse()', () => {
  it('defaults to expanded and toggles', () => {
    const c = createCollapse();
    expect(c.collapsed.value).toBe(false);
    c.toggle();
    expect(c.collapsed.value).toBe(true);
    c.toggle();
    expect(c.collapsed.value).toBe(false);
  });

  it('honors the initial value', () => {
    expect(createCollapse({ initial: true }).collapsed.value).toBe(true);
  });

  it('calls onChange only on real transitions', () => {
    const onChange = vi.fn();
    const c = createCollapse({ onChange });
    c.set(false); // already false → no call
    expect(onChange).not.toHaveBeenCalled();
    c.set(true);
    c.toggle(); // back to false
    expect(onChange.mock.calls).toEqual([[true], [false]]);
  });
});

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
