// The Vue account menu's text subline.
// src/react/__tests__/account-menu-subline.test.tsx holds the React twin.
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import AccountMenu from '../src/components/AccountMenu.vue';

describe('AccountMenu text subline (vue)', () => {
  const principal = { principal_id: 'p', email: 'a@example.test', name: 'Alex Morgan', initials: 'AM', org_id: '', role: 'platform_admin' as const, orgs: [] };

  it('states the role and account in one quiet line', async () => {
    const w = mount(AccountMenu, { props: { principal, subline: 'text', placement: 'bottom-start' } });
    expect(w.find('.lu-am-id-line').text()).toBe('Platform admin · Personal');
    expect(w.find('.lu-am-id-sub').exists()).toBe(false);
    await w.setProps({ principal: { ...principal, role: 'org_admin', org_id: 'o', org_name: 'Design Studio' }, labels: { roleNames: { org_admin: 'Owner' } } });
    expect(w.find('.lu-am-id-line').text()).toBe('Owner · Design Studio');
  });

  it('keeps the badge subline by default', () => {
    const w = mount(AccountMenu, { props: { principal } });
    expect(w.find('.lu-am-id-line').exists()).toBe(false);
    expect(w.find('.lu-am-id-sub .lu-am-role').text()).toBe('Platform Admin');
  });

  it('sets the role as a sentence-case badge, then the account in quiet text', async () => {
    const w = mount(AccountMenu, { props: { principal, subline: 'role', placement: 'bottom-start' } });
    expect(w.attributes('data-subline')).toBe('role');
    const line = w.get('.lu-am-trigger .lu-am-id-role');
    expect([...line.element.children].map((c) => c.classList[0])).toEqual(['lu-am-role', 'lu-am-id-context']);
    expect(line.get('.lu-am-role').text()).toBe('Platform admin');
    expect(line.get('.lu-am-role').classes()).toContain('lu-am-role-platform_admin');
    expect(line.get('.lu-am-id-context').text()).toBe('Personal');
    expect(w.find('.lu-am-id-sub').exists()).toBe(false);
    await w.setProps({ principal: { ...principal, role: 'individual' } });
    expect(w.find('.lu-am-id-role .lu-am-role').exists()).toBe(false);
    expect(w.get('.lu-am-id-context').text()).toBe('Personal');
  });

  it('states the role in the dropdown header in the same case', async () => {
    const w = mount(AccountMenu, { props: { principal: { ...principal, org_id: 'o', org_name: 'Design Studio' }, subline: 'role', placement: 'bottom-start' } });
    await w.get('.lu-am-trigger').trigger('click');
    expect(w.get('.lu-am-head-meta .lu-am-role').text()).toBe('Platform admin');
    expect(w.get('.lu-am-head-meta .lu-am-head-context').text()).toBe('Design Studio');
  });

  it('keeps the uppercase badge in the header by default', async () => {
    const w = mount(AccountMenu, { props: { principal } });
    await w.get('.lu-am-trigger').trigger('click');
    expect(w.get('.lu-am-head-meta .lu-am-role').text()).toBe('Platform Admin');
    expect(w.get('.lu-am-head-meta .lu-am-head-context').text()).toBe('Individual');
  });
});
