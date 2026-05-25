import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';

import { AccountMenu } from '../src';
import type { Principal } from '../src/session/types';

const base: Principal = {
  principal_id: 'p1',
  email: 'a@b.c',
  display_name: 'Ada Lovelace',
  initials: 'AL',
  org_id: '',
  orgs: [],
};

function mountOpen(principal: Principal | null, placement: 'top-end' | 'bottom-start' = 'top-end') {
  const w = mount(AccountMenu, {
    props: { principal, placement },
    slots: { prefs: () => h('div', { class: 'test-prefs' }, 'THEME+LANG') },
  });
  // open the dropdown
  w.find('.lu-am-trigger').trigger('click');
  return w;
}

describe('AccountMenu', () => {
  it('renders the #prefs slot when open (theme/language survive)', async () => {
    const w = mountOpen(base);
    await w.vm.$nextTick();
    expect(w.find('.test-prefs').exists()).toBe(true);
    expect(w.text()).toContain('THEME+LANG');
  });

  it('hides the org section when the principal has no orgs (no lonely Personal)', async () => {
    const w = mountOpen({ ...base, orgs: [] });
    await w.vm.$nextTick();
    expect(w.find('.lu-am-org').exists()).toBe(false);
    expect(w.text()).not.toContain('Organizations');
  });

  it('shows the org switcher (Personal + memberships) when orgs exist', async () => {
    const w = mountOpen({
      ...base,
      org_id: 'o1',
      orgs: [{ id: 'o1', name: 'Org One', slug: 'org-one', owner: true }],
    });
    await w.vm.$nextTick();
    const orgRows = w.findAll('.lu-am-org');
    // Personal row + one membership row
    expect(orgRows.length).toBe(2);
    expect(w.text()).toContain('Org One');
    expect(w.text()).toContain('Personal');
  });

  it('emits switch-org when a membership row is clicked', async () => {
    const w = mountOpen({
      ...base,
      org_id: '',
      orgs: [{ id: 'o1', name: 'Org One' }],
    });
    await w.vm.$nextTick();
    // second .lu-am-org is the membership (first is Personal)
    await w.findAll('.lu-am-org')[1].trigger('click');
    expect(w.emitted('switch-org')?.[0]).toEqual(['o1']);
  });

  it('renders data-driven extraItems styled as menu items', async () => {
    const w = mount(AccountMenu, {
      props: {
        principal: base,
        extraItems: [
          { label: 'Admin Panel', href: 'https://auth.test/admin' },
          { label: 'Deck access', to: '/admin/decks' },
          { label: 'Do thing', id: 'thing' },
        ],
      },
    });
    await w.find('.lu-am-trigger').trigger('click');
    await w.vm.$nextTick();
    const items = w.findAll('.lu-am-item');
    const labels = items.map((i) => i.text());
    expect(labels).toContain('Admin Panel');
    expect(labels).toContain('Deck access');
    // href item is an <a> with the url
    const a = w.find('a.lu-am-item');
    expect(a.attributes('href')).toBe('https://auth.test/admin');
    // `to` item emits navigate; `id` item emits item-select
    const buttons = w.findAll('button.lu-am-item');
    await buttons.find((b) => b.text() === 'Deck access')!.trigger('click');
    expect(w.emitted('navigate')?.some((e) => e[0] === '/admin/decks')).toBe(true);
  });

  it('logged out with no content: trigger is a direct Sign in (no dropdown)', async () => {
    const w = mount(AccountMenu, { props: { principal: null } });
    await w.find('.lu-am-trigger').trigger('click');
    await w.vm.$nextTick();
    // No dropdown panel, no chevron — clicking signs in directly. The pill
    // keeps its shape: "?" avatar + a single-line "Sign in" (no org sub-label).
    expect(w.find('.lu-am-dd').exists()).toBe(false);
    expect(w.find('.lu-am-chev').exists()).toBe(false);
    expect(w.find('.lu-am-avatar').text()).toBe('?');
    expect(w.find('.lu-am-id-name').text()).toBe('Sign in');
    expect(w.find('.lu-am-id-sub').exists()).toBe(false);
    expect(w.emitted('login')).toBeTruthy();
  });

  it('logged out WITH prefs: still opens a dropdown (theme/lang useful)', async () => {
    const w = mount(AccountMenu, {
      props: { principal: null },
      slots: { prefs: () => h('div', { class: 'test-prefs' }, 'PREFS') },
    });
    await w.find('.lu-am-trigger').trigger('click');
    await w.vm.$nextTick();
    expect(w.find('.lu-am-dd').exists()).toBe(true);
    expect(w.find('.test-prefs').exists()).toBe(true);
  });

  it('bottom-start variant marks the menu as opening upward (sidebar fit)', async () => {
    const w = mountOpen(base, 'bottom-start');
    await w.vm.$nextTick();
    expect(w.find('.lu-am-up').exists()).toBe(true);
    expect(w.find('.lu-am-dd-left').exists()).toBe(true);
  });

  // Regression: the head's `border-bottom` plus the first section's `border-top`
  // rendered a DOUBLED separator line, because the suppressing rule
  // `.lu-am-section:first-of-type { border-top: 0 }` is dead — `:first-of-type`
  // matches the first <div> sibling (the head), never a `.lu-am-section`. The
  // fix drops the head's border-bottom so the first section's border-top is the
  // single header separator. Guard the CSS so the doubling can't return.
  it('does not declare both a head border-bottom and a dead first-of-type guard', () => {
    const src = readFileSync(
      resolve(process.cwd(), 'src/components/AccountMenu.vue'),
      'utf8',
    );
    const styleBlock = src.slice(src.indexOf('<style'));
    const headRule = styleBlock.slice(
      styleBlock.indexOf('.lu-am-head {'),
      styleBlock.indexOf('}', styleBlock.indexOf('.lu-am-head {')),
    );
    expect(headRule).not.toContain('border-bottom');
    expect(styleBlock).not.toContain('.lu-am-section:first-of-type');
  });
});
