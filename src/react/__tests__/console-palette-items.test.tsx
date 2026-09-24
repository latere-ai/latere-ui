// The React palette's host entries and search. tests/console-palette-items.test.ts
// holds the Vue twin.
import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConsolePalette } from '../ConsolePalette';
import type { ConsoleNavModel } from '../../console/nav';

const model: ConsoleNavModel = {
  groups: [{
    items: [
      { id: 'home', label: 'Home', to: '/', icon: 'home' },
      {
        id: 'storage', label: 'Storage', to: '/storage', icon: 'folder', children: [
          { id: 'storage:files', label: 'Files', to: '/storage/files' },
          { id: 'storage:trash', label: 'Trash', to: '/storage/trash' },
        ],
      },
      { id: 'admin', label: 'Admin', icon: 'shield', children: [{ id: 'admin:fleet', label: 'Fleet', to: '/admin/fleet' }] },
      { id: 'plain', label: 'Plain', to: '/plain' },
    ],
  }],
};

describe('ConsolePalette host entries (react)', () => {
  it('lists child pages and host entries, and runs the host search on a query', () => {
    const onNavigate = vi.fn();
    const search = vi.fn(() => [{ id: 'doc:1', label: 'Store a file', to: '/docs/store', group: 'Docs' }]);
    render(
      <ConsolePalette
        open
        model={model}
        items={[{ id: 'topup', label: 'Top up', action: true, group: 'Actions', icon: 'coins', keywords: 'credits wallet' }]}
        search={search}
        onNavigate={onNavigate}
      />,
    );
    const labels = () => Array.from(document.querySelectorAll('.lu-cp-item-label')).map((n) => n.textContent);
    expect(labels()).toEqual(['Home', 'Storage', 'Files', 'Trash', 'Fleet', 'Plain', 'Top up']);
    const files = Array.from(document.querySelectorAll('.lu-cp-item'))[2];
    expect(files.querySelector('.lu-cp-item-group')?.textContent).toBe('Storage');
    expect(document.querySelector('.lu-cp-item .lu-cp-item-icon svg[data-icon="home"]')).not.toBeNull();
    const input = document.querySelector<HTMLInputElement>('.lu-cp-input')!;
    act(() => { fireEvent.change(input, { target: { value: 'wallet' } }); });
    expect(labels()).toEqual(['Top up', 'Store a file']);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'doc:1' }));
  });
});
