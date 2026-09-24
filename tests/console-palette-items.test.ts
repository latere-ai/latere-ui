// The Vue palette's host entries and search.
// src/react/__tests__/console-palette-items.test.tsx holds the React twin.
import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import ConsolePalette from '../src/components/ConsolePalette.vue';
import type { ConsoleNavModel } from '../src/console/nav';

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

describe('ConsolePalette host entries (vue)', () => {
  it('lists child pages and host entries, and runs the host search on a query', async () => {
    const search = vi.fn(() => [{ id: 'doc:1', label: 'Store a file', to: '/docs/store', group: 'Docs' }]);
    const w = mount(ConsolePalette, {
      props: {
        open: true,
        model,
        items: [{ id: 'topup', label: 'Top up', action: true, group: 'Actions', icon: 'coins', keywords: 'credits wallet' }],
        search,
      },
      global: { stubs: { teleport: true } },
    });
    await nextTick();
    const labels = () => w.findAll('.lu-cp-item-label').map((n) => n.text());
    expect(labels()).toEqual(['Home', 'Storage', 'Files', 'Trash', 'Fleet', 'Plain', 'Top up']);
    expect(w.findAll('.lu-cp-item')[2].find('.lu-cp-item-group').text()).toBe('Storage');
    expect(w.find('.lu-cp-item .lu-cp-item-icon svg[data-icon="home"]').exists()).toBe(true);
    await w.find('.lu-cp-input').setValue('wallet');
    expect(labels()).toEqual(['Top up', 'Store a file']);
    await w.find('.lu-cp-input').trigger('keydown', { key: 'ArrowDown' });
    await w.find('.lu-cp-input').trigger('keydown', { key: 'Enter' });
    expect(w.emitted('navigate')?.[0]?.[0]).toMatchObject({ id: 'doc:1' });
    w.unmount();
  });
});
