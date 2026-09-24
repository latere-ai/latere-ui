import { describe, expect, it } from 'vitest';

import { identityLine, DEFAULT_ACCOUNT_MENU_LABELS } from '../src/components/accountMenu';

describe('identity line', () => {
  const labels = DEFAULT_ACCOUNT_MENU_LABELS;
  it('states the role and the account in one line', () => {
    expect(identityLine({ role: 'platform_admin' }, labels)).toBe('Platform admin · Personal');
    expect(identityLine({ role: 'org_admin', org_name: 'Design Studio' }, labels)).toBe('Admin · Design Studio');
    expect(identityLine({ role: 'org_member', org_name: 'Lab' }, labels)).toBe('Member · Lab');
    expect(identityLine({ role: 'individual' }, labels)).toBe('Personal');
    expect(identityLine({}, labels)).toBe('Personal');
    expect(identityLine(null, labels)).toBe('');
    expect(identityLine({ role: 'platform_admin' }, { personal: 'Persönlich', roleNames: { ...labels.roleNames!, platform_admin: 'Plattform-Admin' } })).toBe('Plattform-Admin · Persönlich');
  });
});
