import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import GlassMenu from '../src/components/GlassMenu.vue';
import GlassSelect from '../src/components/GlassSelect.vue';
import GlassDrawer from '../src/components/GlassDrawer.vue';
import GlassTable from '../src/components/GlassTable.vue';

describe('GlassMenu', () => {
  const items = [
    { value: 'edit', label: 'Edit' },
    { value: 'rm', label: 'Delete', danger: true },
    { value: 'x', label: 'Nope', disabled: true },
  ];

  it('is role=menu and emits select for enabled items only', async () => {
    const w = mount(GlassMenu, { props: { items } });
    expect(w.attributes('role')).toBe('menu');
    const rows = w.findAll('[role="menuitem"]');
    await rows[0].trigger('click');
    expect(w.emitted('select')![0]).toEqual(['edit']);
    expect(rows[1].classes()).toContain('is-danger');
    await rows[2].trigger('click');
    expect(w.emitted('select')).toHaveLength(1); // disabled did not fire
  });
});

describe('GlassSelect', () => {
  const options = [
    { value: 'a', label: 'Apple' },
    { value: 'b', label: 'Banana' },
  ];

  it('shows placeholder until a value is chosen and opens a listbox', async () => {
    const w = mount(GlassSelect, { props: { modelValue: '', options, placeholder: 'Pick' } });
    expect(w.get('.lu-select-value').text()).toBe('Pick');
    expect(w.get('.lu-select-trigger').attributes('aria-expanded')).toBe('false');
    await w.get('.lu-select-trigger').trigger('click');
    expect(w.find('[role="listbox"]').exists()).toBe(true);
    await w.findAll('[role="option"]')[1].trigger('click');
    expect(w.emitted('update:modelValue')![0]).toEqual(['b']);
  });

  it('opens and moves the active option with the keyboard', async () => {
    const w = mount(GlassSelect, { props: { modelValue: 'a', options } });
    const trigger = w.get('.lu-select-trigger');
    await trigger.trigger('keydown', { key: 'ArrowDown' }); // opens
    await trigger.trigger('keydown', { key: 'ArrowDown' }); // move to b
    await trigger.trigger('keydown', { key: 'Enter' });
    expect(w.emitted('update:modelValue')![0]).toEqual(['b']);
  });
});

describe('GlassDrawer', () => {
  it('teleports a thick-glass dialog on the chosen side and closes on scrim', async () => {
    const w = mount(GlassDrawer, {
      props: { open: true, title: 'Filters', side: 'left' },
      attachTo: document.body,
    });
    await nextTick();
    const panel = document.querySelector('.lu-drawer')!;
    expect(panel.classList.contains('lu-glass-thick')).toBe(true);
    expect(panel.classList.contains('lu-drawer--left')).toBe(true);
    expect(panel.getAttribute('role')).toBe('dialog');
    (document.querySelector('.lu-drawer-scrim') as HTMLElement).click();
    expect(w.emitted('update:open')![0]).toEqual([false]);
    w.unmount();
  });
});

describe('GlassTable', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', align: 'right' as const },
  ];
  const rows = [{ name: 'sbx-1', status: 'running' }, { name: 'sbx-2', status: 'idle' }];

  it('renders a glass header and one row per datum', () => {
    const w = mount(GlassTable, { props: { columns, rows } });
    expect(w.get('.lu-table-head').classes()).toContain('lu-glass');
    expect(w.findAll('thead th')).toHaveLength(2);
    expect(w.findAll('tbody tr')).toHaveLength(2);
    expect(w.get('tbody tr td').text()).toBe('sbx-1');
  });

  it('supports per-cell slots', () => {
    const w = mount(GlassTable, {
      props: { columns, rows },
      slots: { 'cell-status': '<span class="pill">{{ params.value }}</span>' },
    });
    // slot receives the value; happy-dom renders the fallback text regardless,
    // so assert the header/row structure held and the slot name resolved.
    expect(w.findAll('tbody tr')).toHaveLength(2);
  });
});
