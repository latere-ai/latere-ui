import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import ConsoleSidebar from '../src/components/ConsoleSidebar.vue';
import type { ConsoleNavModel } from '../src/console/nav';

const model: ConsoleNavModel = {
  groups: [
    {
      label: 'Workspace',
      items: [
        { id: 'requests', label: 'Requests', to: '/requests', badge: 'live' },
        { id: 'keys', label: 'Keys', to: '/keys', badge: 3 },
        { id: 'soon', label: 'Coming soon' }, // no `to` → disabled
      ],
    },
    {
      label: 'Settings',
      pin: 'bottom',
      items: [{ id: 'org', label: 'Organization', to: '/org' }],
    },
  ],
};

const RouterLinkStub = defineComponent({
  props: { to: { type: String, required: true } },
  setup: (p, { slots }) => () => h('a', { 'data-rl': p.to }, slots.default?.()),
});

function render(
  props: Record<string, unknown> = {},
  slots: Record<string, () => unknown> = {},
) {
  return mount(ConsoleSidebar, { props: { model, ...props }, slots });
}

describe('<ConsoleSidebar />', () => {
  it('renders grouped rows with their labels', () => {
    const w = render();
    expect(w.findAll('.lu-cs-group-label').map((g) => g.text())).toEqual([
      'Workspace',
      'Settings',
    ]);
    expect(w.findAll('.lu-cs-item').length).toBe(4);
    expect(w.text()).toContain('Requests');
    expect(w.text()).toContain('Organization');
  });

  it('marks the active row from activeKey', () => {
    const w = render({ activeKey: 'keys' });
    const active = w.findAll('.lu-cs-item').filter((i) => i.attributes('data-active') === 'true');
    expect(active.length).toBe(1);
    expect(active[0].text()).toContain('Keys');
    expect(active[0].attributes('aria-current')).toBe('page');
  });

  it('pins bottom groups with the pinned class so CSS pushes them down', () => {
    const w = render();
    const pinned = w.find('.lu-cs-group-pinned');
    expect(pinned.exists()).toBe(true);
    expect(pinned.attributes('data-pin')).toBe('bottom');
    expect(pinned.text()).toContain('Settings');
  });

  it('renders disabled rows as non-interactive spans that do not navigate', async () => {
    const w = render();
    const soon = w.findAll('.lu-cs-item').find((i) => i.text().includes('Coming soon'))!;
    expect(soon.element.tagName).toBe('SPAN');
    expect(soon.attributes('data-disabled')).toBe('true');
    await soon.trigger('click');
    expect(w.emitted('navigate')).toBeFalsy();
  });

  it('emits navigate with the item on an enabled row click', async () => {
    const w = render();
    const keys = w.findAll('.lu-cs-item').find((i) => i.text().includes('Keys'))!;
    await keys.trigger('click');
    const ev = w.emitted('navigate');
    expect(ev?.[0]?.[0]).toMatchObject({ id: 'keys', to: '/keys' });
  });

  it('renders badge variants (numeric pill + live dot)', () => {
    const w = render();
    expect(w.find('.lu-cs-badge-live').exists()).toBe(true);
    expect(w.find('.lu-cs-badge-dot').exists()).toBe(true);
    const numeric = w.findAll('.lu-cs-badge').find((b) => b.text() === '3');
    expect(numeric).toBeTruthy();
  });

  it('renders the brand as a non-navigating button when collapsed with expand-on-brand-click', async () => {
    const w = render({
      collapsed: true,
      expandOnBrandClick: true,
      routerLink: RouterLinkStub,
      homeTo: '/home',
    });
    const brand = w.find('.lu-cs-brand');
    // A button cannot navigate, so clicking it to expand can't jump to homeTo.
    expect(brand.element.tagName).toBe('BUTTON');
    expect(brand.attributes('data-rl')).toBeUndefined();
    await brand.trigger('click');
    // It only expands the rail.
    expect(w.emitted('update:collapsed')?.[0]).toEqual([false]);
  });

  it('renders the brand as a home link when expanded', () => {
    const w = render({
      collapsed: false,
      expandOnBrandClick: true,
      routerLink: RouterLinkStub,
      homeTo: '/home',
    });
    const brand = w.find('.lu-cs-brand');
    expect(brand.element.tagName).toBe('A');
    expect(brand.attributes('data-rl')).toBe('/home');
  });

  it('toggles its own collapsed state and emits update:collapsed (uncontrolled)', async () => {
    const w = render();
    expect(w.find('.lu-cs').attributes('data-collapsed')).toBe('false');
    await w.find('.lu-cs-fold').trigger('click');
    expect(w.emitted('update:collapsed')?.[0]).toEqual([true]);
    expect(w.find('.lu-cs').attributes('data-collapsed')).toBe('true');
    // labels are hidden when collapsed
    expect(w.find('.lu-cs-item-label').exists()).toBe(false);
  });

  it('respects a controlled collapsed prop (does not self-toggle)', async () => {
    const w = render({ collapsed: false });
    await w.find('.lu-cs-fold').trigger('click');
    expect(w.emitted('update:collapsed')?.[0]).toEqual([true]);
    // still false: the parent owns the value until it updates the prop
    expect(w.find('.lu-cs').attributes('data-collapsed')).toBe('false');
    await w.setProps({ collapsed: true });
    expect(w.find('.lu-cs').attributes('data-collapsed')).toBe('true');
  });

  it('hides the fold button when collapsible is false (fixed rail)', () => {
    expect(render({ collapsible: false }).find('.lu-cs-fold').exists()).toBe(false);
  });

  it('routes enabled rows through an injected routerLink', () => {
    const w = render({ routerLink: RouterLinkStub });
    const tos = w.findAll('[data-rl]').map((a) => a.attributes('data-rl'));
    expect(tos).toContain('/requests');
    expect(tos).toContain('/org');
    // disabled row still a span, not routed
    expect(tos).not.toContain(undefined);
  });

  it('renders the #foot and #brand slots', () => {
    const w = render(
      { brandName: 'Lux' },
      {
        foot: () => h('div', { class: 'test-foot' }, 'ACCOUNT'),
        brand: () => h('div', { class: 'test-brand' }, 'BRAND'),
      },
    );
    expect(w.find('.test-foot').text()).toBe('ACCOUNT');
    expect(w.find('.test-brand').text()).toBe('BRAND');
    // default brand replaced by slot
    expect(w.find('.lu-cs-brand-mark').exists()).toBe(false);
  });

  it('renders the built-in search bar and emits search on click + ⌘K', async () => {
    const w = render({ search: true, searchLabel: 'Search & run', searchHint: '⌘K' });
    const bar = w.find('.lu-cs-search');
    expect(bar.exists()).toBe(true);
    expect(bar.text()).toContain('Search & run');
    await bar.trigger('click');
    expect(w.emitted('search')?.length).toBe(1);
    // ⌘K dispatches a global keydown that the mounted listener handles
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    expect(w.emitted('search')?.length).toBe(2);
  });

  it('omits the search bar unless search is enabled', () => {
    expect(render().find('.lu-cs-search').exists()).toBe(false);
  });

  it('renders a #logo slot and a colored brand box from brandColor', () => {
    const w = render(
      { brandName: 'Lux', brandColor: '#3a4ed1' },
      { logo: () => h('svg', { class: 'test-logo' }) },
    );
    const mark = w.find('.lu-cs-brand-mark');
    expect(w.find('.test-logo').exists()).toBe(true);
    expect(mark.classes()).toContain('lu-cs-brand-mark--colored');
    expect(mark.attributes('style')).toContain('3a4ed1');
  });

  it('renders the #top slot between the head and the nav (e.g. command palette)', () => {
    const w = render({}, { top: () => h('button', { class: 'test-top' }, 'CMDK') });
    const top = w.find('.test-top');
    expect(top.exists()).toBe(true);
    // it precedes the nav in document order
    const html = w.html();
    expect(html.indexOf('test-top')).toBeLessThan(html.indexOf('lu-cs-nav'));
  });

  it('renders the #extra slot below the nav groups, above the foot', () => {
    const w = render({}, {
      extra: () => h('div', { class: 'test-extra' }, 'RECENT'),
      foot: () => h('div', { class: 'test-foot2' }, 'ACCT'),
    });
    expect(w.find('.test-extra').exists()).toBe(true);
    const html = w.html();
    expect(html.indexOf('lu-cs-nav')).toBeLessThan(html.indexOf('test-extra'));
    expect(html.indexOf('test-extra')).toBeLessThan(html.indexOf('test-foot2'));
  });

  it('renders an action item (no route) as a clickable button that emits navigate', async () => {
    const m = { groups: [{ items: [{ id: 'terminal', label: 'Terminal', action: true }] }] };
    const w = mount(ConsoleSidebar, { props: { model: m } });
    const row = w.find('.lu-cs-item');
    expect(row.element.tagName).toBe('BUTTON');
    expect(row.attributes('data-disabled')).toBe('false');
    await row.trigger('click');
    expect(w.emitted('navigate')?.[0]?.[0]).toMatchObject({ id: 'terminal', action: true });
  });

  it('renders a trailing dot for items with dot:true', () => {
    const m = { groups: [{ items: [{ id: 'board', label: 'Board', to: '/', dot: true }] }] };
    const w = mount(ConsoleSidebar, { props: { model: m } });
    expect(w.find('.lu-cs-dot').exists()).toBe(true);
  });

  it('uses the default brand with a gradient wordmark theme', () => {
    const w = render({ brandName: 'Lux', brandSub: 'Console', brandTheme: 'lux' });
    expect(w.find('.lu-cs-brand-name').classes()).toContain('lux-brand');
    expect(w.find('.lu-cs-brand-sub').text()).toBe('Console');
  });
});
