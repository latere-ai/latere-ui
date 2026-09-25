// Rows only admins are shown, and the bottom groups set in the foot, in the
// Vue ConsoleSidebar. src/react/__tests__/console-sidebar-audience.test.tsx
// holds the React twin.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';

import ConsoleSidebar from '../src/components/ConsoleSidebar.vue';
import type { ConsoleNavModel, NavFootItem } from '../src/console/nav';
import { installLocalStorage } from './local-storage';

const model: ConsoleNavModel = {
  groups: [
    { items: [{ id: 'home', label: 'Home', to: '/', icon: 'home' }, { id: 'keys', label: 'Keys', to: '/keys', icon: 'key' }] },
    {
      pin: 'bottom',
      items: [
        { id: 'org', label: 'Organization', to: '/org', icon: 'org', audience: 'admin', children: [{ id: 'org:members', label: 'Members', to: '/org/members' }] },
        { id: 'admin', label: 'Admin', to: '/admin', icon: 'shield', audience: 'admin', children: [{ id: 'admin:fleet', label: 'Fleet', to: '/admin/fleet' }] },
        { id: 'status', label: 'Status', to: '/status', audience: 'admin' },
      ],
    },
  ],
};
const footItems: NavFootItem[] = [
  { id: 'docs', label: 'Documentation', to: '/docs', icon: 'book' },
  { id: 'credits', label: 'Credits', to: '/billing', icon: 'coins', value: '$8.16' },
];
const row = (w: VueWrapper, id: string) => w.find<HTMLElement>(`.lu-cs-item[data-nav-id="${id}"]`);

function sidebar(props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
  return mount(ConsoleSidebar, { props: { model, ...props }, slots, attachTo: document.body });
}

beforeEach(() => {
  installLocalStorage();
  document.body.innerHTML = '';
});

describe('ConsoleSidebar audience (vue)', () => {
  it('marks an admin row and names the audience after the label', () => {
    const w = sidebar();
    const org = row(w, 'org');
    expect(org.attributes('data-audience')).toBe('admin');
    expect([...org.element.children].map((c) => c.className)).toEqual(['lu-cs-item-icon', 'lu-cs-item-label', 'lu-cs-audience', 'lu-cs-item-chevron']);
    expect(org.find('.lu-cs-audience').text()).toBe('Admin');
    expect(row(w, 'status').find('.lu-cs-audience').text()).toBe('Admin');
    expect(row(w, 'home').attributes('data-audience')).toBeUndefined();
    expect(row(w, 'home').find('.lu-cs-audience').exists()).toBe(false);
    w.unmount();
  });

  it('leaves the chip off a row whose label already names the audience', () => {
    const w = sidebar();
    expect(row(w, 'admin').attributes('data-audience')).toBe('admin');
    expect(row(w, 'admin').find('.lu-cs-audience').exists()).toBe(false);
    w.unmount();
  });

  it('takes a localized audience label', () => {
    const w = sidebar({ audienceLabel: 'Verwaltung' });
    expect(row(w, 'org').find('.lu-cs-audience').text()).toBe('Verwaltung');
    expect(row(w, 'admin').find('.lu-cs-audience').text()).toBe('Verwaltung');
    w.unmount();
  });

  it('drops the chip in the collapsed rail and names the audience in the tooltip', () => {
    const w = sidebar({ collapsed: true });
    expect(w.find('.lu-cs-audience').exists()).toBe(false);
    expect(row(w, 'org').attributes('data-audience')).toBe('admin');
    expect(row(w, 'org').attributes('title')).toBe('Organization · Admin');
    expect(row(w, 'admin').attributes('title')).toBe('Admin');
    w.unmount();
  });
});

describe('ConsoleSidebar bottom groups (vue)', () => {
  it('ends the nav with the bottom groups by default', () => {
    const w = sidebar({ footItems });
    expect(w.find('.lu-cs-nav .lu-cs-group-pinned [data-nav-id="org"]').exists()).toBe(true);
    expect(w.find('.lu-cs-foot-nav').exists()).toBe(false);
    expect(w.find('.lu-cs-foot').classes()).toEqual(['lu-cs-foot']);
    w.unmount();
  });

  it('sets the bottom groups in the foot with the foot rows, above the account control', () => {
    const w = sidebar({ footItems, bottomGroups: 'foot' }, { foot: () => h('div', { class: 'acct' }) });
    expect(w.find('.lu-cs-nav [data-nav-id="org"]').exists()).toBe(false);
    expect(w.find('.lu-cs-group-pinned').exists()).toBe(false);
    const foot = w.get('.lu-cs-foot');
    expect(foot.classes()).toEqual(['lu-cs-foot', 'lu-cs-foot-has-nav']);
    expect([...foot.element.children].map((c) => c.className)).toEqual(['lu-cs-foot-nav', 'acct']);
    const ids = foot.findAll('.lu-cs-foot-nav .lu-cs-item').map((el) => el.attributes('data-nav-id'));
    expect(ids).toEqual(['org', 'org:members', 'admin', 'admin:fleet', 'status', 'docs', 'credits']);
    w.unmount();
  });

  it('opens a parent in the foot and moves through the foot rows with the arrow keys', async () => {
    const w = sidebar({ footItems, bottomGroups: 'foot', openKey: null });
    const admin = row(w, 'admin');
    expect(admin.attributes('aria-expanded')).toBe('false');
    await admin.trigger('click');
    expect(row(w, 'admin').attributes('aria-expanded')).toBe('true');
    (row(w, 'admin').element as HTMLElement).focus();
    await row(w, 'admin').trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement?.getAttribute('data-nav-id')).toBe('admin:fleet');
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await nextTick();
    expect(document.activeElement?.getAttribute('data-nav-id')).toBe('credits');
    w.unmount();
  });

  it('keeps the foot as before when nothing is pinned to the bottom', () => {
    const w = sidebar({ model: { groups: [model.groups[0]] }, footItems: [], bottomGroups: 'foot' });
    expect(w.get('.lu-cs-foot').element.innerHTML.replace(/<!--[\s\S]*?-->/g, '')).toBe('');
    expect(w.get('.lu-cs-foot').classes()).toEqual(['lu-cs-foot']);
    w.unmount();
  });

  it('passes foot rows through the item slot like nav rows', () => {
    const w = sidebar({ footItems, bottomGroups: 'foot' }, { item: ((p: { item: { id: string } }) => h('i', { class: 'slotted', 'data-id': p.item.id })) as never });
    expect(w.findAll('.lu-cs-foot-nav i.slotted').map((el) => el.attributes('data-id'))).toEqual(['org:members', 'admin:fleet', 'status']);
    w.unmount();
  });
});

describe('audience and foot group styles', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles/console.css'), 'utf8');
  it('tints an admin row icon and its chip from one token', () => {
    expect(css).toMatch(/\.lu-cs-item\[data-audience="admin"\] \.lu-cs-item-icon \{\s*color: var\(--lu-audience-admin, currentColor\);/);
    const chip = css.slice(css.indexOf('.lu-cs-audience {'), css.indexOf('}', css.indexOf('.lu-cs-audience {')));
    expect(chip).toMatch(/color: var\(--lu-audience-admin/);
    expect(chip).toMatch(/background: color-mix\(in srgb, var\(--lu-audience-admin/);
  });
  it('lets the foot group area scroll while the account control keeps its height', () => {
    const nav = css.slice(css.indexOf('.lu-cs-foot-nav {'), css.indexOf('}', css.indexOf('.lu-cs-foot-nav {')));
    expect(nav).toMatch(/min-height: 0;/);
    expect(nav).toMatch(/overflow-y: auto;/);
    expect(nav).toMatch(/overscroll-behavior: contain;/);
  });
});
