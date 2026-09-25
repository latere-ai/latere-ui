import { afterEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';

import GlassMenu from '../src/components/GlassMenu.vue';

const mounted: VueWrapper[] = [];
function attach<T extends VueWrapper>(w: T): T { mounted.push(w); return w; }
afterEach(() => { while (mounted.length) mounted.pop()!.unmount(); document.body.innerHTML = ''; });

const choices = [
  { value: 'a', label: 'Alpha', checked: false },
  { value: 'b', label: 'Beta', checked: true },
  { value: 'x', label: 'Unavailable', checked: false, disabled: true },
  { value: 'c', label: 'Gamma', checked: false },
];

describe('GlassMenu as a choice menu', () => {
  it('renders menuitemradio rows with aria-checked and a check column on every row', () => {
    const w = attach(mount(GlassMenu, { props: { items: choices, label: 'Choice' } }));
    expect(w.attributes('role')).toBe('menu');
    expect(w.attributes('aria-label')).toBe('Choice');
    expect(w.classes()).toContain('lu-menu--checkable');
    const rows = w.findAll('[role="menuitemradio"]');
    expect(rows.map(r => r.attributes('aria-checked'))).toEqual(['false', 'true', 'false', 'false']);
    expect(rows.map(r => r.find('.lu-menu-check').exists())).toEqual([true, true, true, true]);
    expect(rows.map(r => r.find('.lu-menu-check svg').exists())).toEqual([false, true, false, false]);
    expect(rows.map(r => r.text())).toEqual(['Alpha', 'Beta', 'Unavailable', 'Gamma']);
  });

  it('keeps one row in the tab order, starting at the checked one', () => {
    const w = attach(mount(GlassMenu, { props: { items: choices } }));
    expect(w.findAll('button').map(b => b.attributes('tabindex'))).toEqual(['-1', '0', '-1', '-1']);
  });

  it('moves focus with the arrows, wrapping and skipping disabled rows, and jumps with Home and End', async () => {
    const w = attach(mount(GlassMenu, { props: { items: choices, autofocus: true }, attachTo: document.body }));
    const rows = w.findAll('button');
    expect(document.activeElement).toBe(rows[1].element);
    await w.trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement).toBe(rows[3].element);
    await w.trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement).toBe(rows[0].element);
    await w.trigger('keydown', { key: 'ArrowUp' });
    expect(document.activeElement).toBe(rows[3].element);
    await w.trigger('keydown', { key: 'Home' });
    expect(document.activeElement).toBe(rows[0].element);
    await w.trigger('keydown', { key: 'End' });
    expect(document.activeElement).toBe(rows[3].element);
    expect(rows.map(b => b.attributes('tabindex'))).toEqual(['-1', '-1', '-1', '0']);
  });

  it('moves focus under a mouse pointer but not under touch', async () => {
    const w = attach(mount(GlassMenu, { props: { items: choices, autofocus: true }, attachTo: document.body }));
    const rows = w.findAll('button');
    rows[3].element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse' }));
    await nextTick();
    expect(document.activeElement).toBe(rows[3].element);
    rows[0].element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'touch' }));
    await nextTick();
    expect(document.activeElement).toBe(rows[3].element);
  });

  it('stays an action menu when no item carries a selection state', () => {
    const w = attach(mount(GlassMenu, { props: { items: [{ value: 'copy', label: 'Copy' }, { value: 'rm', label: 'Delete', danger: true }] } }));
    expect(w.classes()).not.toContain('lu-menu--checkable');
    expect(w.findAll('[role="menuitem"]')).toHaveLength(2);
    expect(w.find('[aria-checked]').exists()).toBe(false);
    expect(w.find('.lu-menu-check').exists()).toBe(false);
  });
});
