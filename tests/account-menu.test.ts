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

  it('bottom-start variant marks the menu as opening upward (sidebar fit)', async () => {
    const w = mountOpen(base, 'bottom-start');
    await w.vm.$nextTick();
    expect(w.find('.lu-am-up').exists()).toBe(true);
    expect(w.find('.lu-am-dd-left').exists()).toBe(true);
  });
});
