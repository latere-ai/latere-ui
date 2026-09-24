import { describe, expect, it, vi } from 'vitest';

import type { NavGroup } from '../src/console/nav';
import { filterPalette, paletteEntries } from '../src/console/palette';

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

describe('palette entries', () => {
  it('lists routable rows with the parent as a child row\'s group, then host entries', () => {
    const entries = paletteEntries(groups, [
      { id: 'new', label: 'New workload', action: true, group: 'Actions', keywords: 'create environment' },
      { id: 'off', label: 'Off', action: true, disabled: true },
      { id: 'dead', label: 'Nowhere' },
    ]);
    expect(entries.map((e) => [e.id, e.group, e.icon])).toEqual([
      ['home', 'Main', 'home'], ['storage', 'Main', 'folder'], ['storage:files', 'Storage', 'folder'], ['storage:trash', 'Storage', 'folder'],
      ['admin:fleet', 'Admin', 'shield'], ['new', 'Actions', undefined],
    ]);
    // A row without an icon of its own or a parent's gains no icon key.
    expect('icon' in paletteEntries([{ items: [{ id: 'x', label: 'X', to: '/x' }] }])[0]).toBe(false);
  });

  it('matches every term against label, group and keywords, then adds search results', () => {
    const entries = paletteEntries(groups, [{ id: 'new', label: 'New workload', action: true, group: 'Actions', keywords: 'create environment' }]);
    expect(filterPalette(entries, '')).toBe(entries);
    expect(filterPalette(entries, 'storage').map((e) => e.id)).toEqual(['storage', 'storage:files', 'storage:trash']);
    expect(filterPalette(entries, 'storage trash').map((e) => e.id)).toEqual(['storage:trash']);
    expect(filterPalette(entries, 'CREATE').map((e) => e.id)).toEqual(['new']);
    const search = vi.fn((q: string) => [
      { id: 'docs:files', label: `Guide about ${q}`, to: '/docs/files', group: 'Docs' },
      { id: 'storage:files', label: 'Duplicate', to: '/x' },
    ]);
    expect(filterPalette(entries, ' files ', search).map((e) => e.id)).toEqual(['storage:files', 'docs:files']);
    expect(search).toHaveBeenCalledWith('files');
  });
});
