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
});
