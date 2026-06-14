import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import ConsolePalette from '../src/components/ConsolePalette.vue';
import { flattenNavItems, type ConsoleNavModel } from '../src/console/nav';

const model: ConsoleNavModel = {
  groups: [
    { label: 'Workspace', items: [
      { id: 'board', label: 'Board', to: '/' },
      { id: 'keys', label: 'Keys', to: '/keys' },
      { id: 'soon', label: 'Coming soon' }, // disabled (no route) — excluded
    ] },
    { label: 'Resources', items: [{ id: 'docs', label: 'Docs', to: '/docs' }] },
  ],
};

describe('flattenNavItems()', () => {
  it('flattens groups, tagging each item with its group label', () => {
    const flat = flattenNavItems(model.groups);
    expect(flat.map((i) => i.id)).toEqual(['board', 'keys', 'soon', 'docs']);
    expect(flat[3].groupLabel).toBe('Resources');
  });
});

describe('<ConsolePalette />', () => {
  it('lists only routable items when open', async () => {
    const w = mount(ConsolePalette, { props: { open: true, model }, global: { stubs: { teleport: true } } });
    await nextTick();
    const items = w.findAll('.lu-cp-item');
    expect(items.map((i) => i.find('.lu-cp-item-label').text())).toEqual(['Board', 'Keys', 'Docs']);
    w.unmount();
  });

  it('filters by query', async () => {
    const w = mount(ConsolePalette, { props: { open: true, model }, global: { stubs: { teleport: true } } });
    await nextTick();
    await w.find('.lu-cp-input').setValue('doc');
    const items = w.findAll('.lu-cp-item');
    expect(items.length).toBe(1);
    expect(items[0].text()).toContain('Docs');
    w.unmount();
  });

  it('emits navigate + close when an item is chosen', async () => {
    const w = mount(ConsolePalette, { props: { open: true, model }, global: { stubs: { teleport: true } } });
    await nextTick();
    await w.findAll('.lu-cp-item')[1].trigger('click');
    expect(w.emitted('navigate')?.[0]?.[0]).toMatchObject({ id: 'keys' });
    expect(w.emitted('close')).toBeTruthy();
    w.unmount();
  });

  it('renders nothing when closed', () => {
    const w = mount(ConsolePalette, { props: { open: false, model }, global: { stubs: { teleport: true } } });
    expect(w.find('.lu-cp').exists()).toBe(false);
    w.unmount();
  });
});
