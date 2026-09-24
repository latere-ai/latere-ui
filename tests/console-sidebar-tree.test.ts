// The expandable tree, the compact head, foot rows and built-in icons of the
// Vue ConsoleSidebar. src/react/__tests__/console-sidebar-tree.test.tsx holds
// the React twin.
import { beforeEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h } from 'vue';

import ConsoleIcon from '../src/components/ConsoleIcon.vue';
import ConsoleSidebar from '../src/components/ConsoleSidebar.vue';
import type { ConsoleNavModel } from '../src/console/nav';
import { installLocalStorage } from './local-storage';

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

const parent = (w: VueWrapper, id: string) => w.find<HTMLElement>(`.lu-cs-parent[data-nav-id="${id}"]`);
const row = (w: VueWrapper, id: string) => w.find<HTMLElement>(`.lu-cs-item[data-nav-id="${id}"]`);

function sidebar(props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
  return mount(ConsoleSidebar, { props: { model, ...props }, slots, attachTo: document.body });
}

beforeEach(() => {
  installLocalStorage();
  document.body.innerHTML = '';
});

describe('ConsoleSidebar icons (vue)', () => {
  it('renders a built-in icon for a known name and no slot for a row without one', () => {
    const w = sidebar();
    expect(row(w, 'home').find('.lu-cs-item-icon svg[data-icon="home"]').exists()).toBe(true);
    expect(row(w, 'plain').find('.lu-cs-item-icon').exists()).toBe(false);
    expect(row(w, 'plain').element.firstElementChild?.className).toBe('lu-cs-item-label');
    w.unmount();
  });

  it('falls back to the first letter only in the collapsed rail', () => {
    const w = sidebar({ collapsed: true });
    expect(row(w, 'plain').find('.lu-cs-item-icon').text()).toBe('P');
    w.unmount();
  });

  it('renders the host icon slot', () => {
    const w = sidebar({}, { icon: () => h('i', 'x') });
    expect(row(w, 'plain').find('.lu-cs-item-icon i').exists()).toBe(true);
    w.unmount();
  });

  it('renders nothing for an unknown icon name', () => {
    expect(mount(ConsoleIcon, { props: { name: 'nope' } }).html()).toBe('<!--v-if-->');
    const svg = mount(ConsoleIcon, { props: { name: 'key', size: 18 } }).find('svg');
    expect(svg.attributes('width')).toBe('18');
    expect(svg.attributes('stroke-width')).toBe('2');
    expect(svg.findAll('path').length + svg.findAll('circle').length).toBe(2);
  });
});

describe('ConsoleSidebar children (vue)', () => {
  it('folds a parent by default and names its group with aria-controls', () => {
    const w = sidebar();
    const storage = parent(w, 'storage');
    expect(storage.element.tagName).toBe('BUTTON');
    expect(storage.attributes('aria-expanded')).toBe('false');
    const group = document.getElementById(storage.attributes('aria-controls')!)!;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.hidden).toBe(true);
    expect(group.querySelectorAll('.lu-cs-child')).toHaveLength(2);
    w.unmount();
  });

  it('toggles on click and remembers the choice for the viewer', async () => {
    const w = sidebar({ openKey: 'k' });
    await parent(w, 'admin').trigger('click');
    expect(parent(w, 'admin').attributes('aria-expanded')).toBe('true');
    expect(JSON.parse(localStorage.getItem('k')!)).toEqual({ admin: true });
    w.unmount();
    const again = sidebar({ openKey: 'k' });
    expect(parent(again, 'admin').attributes('aria-expanded')).toBe('true');
    again.unmount();
  });

  it('opens the parent of the active page and marks the path', async () => {
    const w = sidebar({ activeKey: 'storage:trash', openKey: 'k' });
    expect(parent(w, 'storage').attributes('aria-expanded')).toBe('true');
    expect(parent(w, 'storage').attributes('data-path')).toBe('true');
    expect(row(w, 'storage:trash').attributes('data-active')).toBe('true');
    expect(row(w, 'storage:trash').attributes('aria-current')).toBe('page');
    expect(JSON.parse(localStorage.getItem('k')!)).toEqual({ storage: true });
    await parent(w, 'storage').trigger('click');
    expect(parent(w, 'storage').attributes('aria-expanded')).toBe('false');
    await w.setProps({ activeKey: 'storage:files' });
    expect(parent(w, 'storage').attributes('aria-expanded')).toBe('true');
    w.unmount();
  });

  it('keeps nothing in storage when openKey is null', async () => {
    const w = sidebar({ openKey: null });
    await parent(w, 'admin').trigger('click');
    expect(localStorage.length).toBe(0);
    w.unmount();
  });

  it('moves and toggles with the arrow keys', async () => {
    const w = sidebar();
    const key = async (id: string, k: string) => {
      const el = w.find<HTMLElement>(`[data-nav-id="${id}"]`);
      await el.trigger('keydown', { key: k });
    };
    row(w, 'home').element.focus();
    await key('home', 'ArrowDown');
    expect(document.activeElement).toBe(parent(w, 'storage').element);
    await key('storage', 'ArrowRight');
    expect(parent(w, 'storage').attributes('aria-expanded')).toBe('true');
    await key('storage', 'ArrowRight');
    expect(document.activeElement).toBe(row(w, 'storage:files').element);
    await key('storage:files', 'ArrowDown');
    expect(document.activeElement).toBe(row(w, 'storage:trash').element);
    await key('storage:trash', 'ArrowLeft');
    expect(document.activeElement).toBe(parent(w, 'storage').element);
    await key('storage', 'ArrowLeft');
    expect(parent(w, 'storage').attributes('aria-expanded')).toBe('false');
    await key('storage', 'ArrowDown');
    expect(document.activeElement).toBe(parent(w, 'admin').element);
    await key('admin', 'End');
    expect(document.activeElement).toBe(row(w, 'plain').element);
    await key('plain', 'Home');
    expect(document.activeElement).toBe(row(w, 'home').element);
    w.unmount();
  });

  it('links a parent to its page in the collapsed rail and carries the selection', async () => {
    const w = sidebar({ collapsed: true, activeKey: 'admin:fleet' });
    expect(w.find('.lu-cs-parent').exists()).toBe(false);
    expect(w.find('.lu-cs-children').exists()).toBe(false);
    const admin = row(w, 'admin');
    expect(admin.element.tagName).toBe('A');
    expect(admin.attributes('href')).toBe('/admin/fleet');
    expect(admin.attributes('data-active')).toBe('true');
    expect(admin.attributes('aria-current')).toBeUndefined();
    expect(admin.attributes('title')).toBe('Admin');
    expect(row(w, 'storage').attributes('href')).toBe('/storage');
    await admin.trigger('click');
    expect(w.emitted('navigate')?.[0]?.[0]).toMatchObject({ id: 'admin', to: '/admin/fleet' });
    w.unmount();
  });

  it('passes child rows through the item slot', () => {
    const w = sidebar({ activeKey: 'storage:files' }, {
      item: (({ item, active }: { item: { id: string; label: string }; active: boolean }) => h('b', { 'data-id': item.id, 'data-on': String(active) }, item.label)) as never,
    });
    expect(w.find('b[data-id="storage:files"]').attributes('data-on')).toBe('true');
    expect(parent(w, 'storage').exists()).toBe(true);
    w.unmount();
  });
});

describe('ConsoleSidebar compact head and foot rows (vue)', () => {
  it('marks the rail compact and keeps one button in the collapsed head', async () => {
    const w = sidebar({ compact: true, brandName: 'Latere', brandSub: 'Console', collapsed: false }, { logo: () => h('svg', { 'data-logo': 'yes' }) });
    expect(w.find('.lu-cs').attributes('data-compact')).toBe('true');
    expect(w.find('.lu-cs-brand').exists()).toBe(true);
    expect(w.find('.lu-cs-fold-mark').exists()).toBe(false);
    await w.setProps({ collapsed: true });
    const head = w.find('.lu-cs-head');
    expect(head.element.children).toHaveLength(1);
    const fold = head.find('.lu-cs-fold');
    expect(fold.find('.lu-cs-fold-mark [data-logo="yes"]').exists()).toBe(true);
    expect(fold.find('.lu-cs-fold-glyph').exists()).toBe(true);
    await fold.trigger('click');
    expect(w.emitted('update:collapsed')?.at(-1)).toEqual([false]);
    w.unmount();
  });

  it('leaves the default head without the compact marker', () => {
    const w = sidebar({ collapsed: true });
    expect(w.find('.lu-cs').attributes('data-compact')).toBeUndefined();
    expect(w.find('.lu-cs-brand').exists()).toBe(true);
    w.unmount();
  });

  it('sets foot rows above the account control with a trailing value', async () => {
    const footItems = [
      { id: 'docs', label: 'Documentation', to: '/docs', icon: 'book' },
      { id: 'credits', label: 'Credits', to: '/billing', icon: 'coins', value: '$8.16' },
    ];
    const w = sidebar({ footItems }, { foot: () => h('div', { class: 'acct' }) });
    const foot = w.find('.lu-cs-foot').element;
    expect(foot.firstElementChild?.className).toBe('lu-cs-foot-items');
    expect(foot.lastElementChild?.className).toBe('acct');
    const credits = row(w, 'credits');
    expect(credits.classes()).toEqual(['lu-cs-item', 'lu-cs-foot-item']);
    expect(credits.find('.lu-cs-item-value').text()).toBe('$8.16');
    await credits.trigger('click');
    expect(w.emitted('navigate')?.[0]?.[0]).toMatchObject({ id: 'credits' });
    await w.setProps({ collapsed: true });
    expect(row(w, 'credits').attributes('title')).toBe('Credits $8.16');
    expect(row(w, 'credits').find('.lu-cs-item-value').exists()).toBe(false);
    w.unmount();
  });
});
