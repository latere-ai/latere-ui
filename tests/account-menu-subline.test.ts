import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { identityLine, identityParts, DEFAULT_ACCOUNT_MENU_LABELS } from '../src/components/accountMenu';

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

describe('identity parts', () => {
  const labels = DEFAULT_ACCOUNT_MENU_LABELS;
  it('names the role and the account apart, for the sentence-case badge', () => {
    expect(identityParts({ role: 'platform_admin' }, labels)).toEqual({ role: 'Platform admin', context: 'Personal' });
    expect(identityParts({ role: 'org_admin', org_name: 'Design Studio' }, labels)).toEqual({ role: 'Admin', context: 'Design Studio' });
    expect(identityParts({ role: 'individual' }, labels)).toEqual({ role: '', context: 'Personal' });
    expect(identityParts(null, labels)).toEqual({ role: '', context: '' });
  });
});

describe('sentence-case role badge styles', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles/components/account-menu.css'), 'utf8');
  it('sets the badge in the interface face, sentence case, with no tracking', () => {
    const at = css.indexOf('.lu-am:is([data-subline="text"], [data-subline="role"]) .lu-am-role {');
    expect(at).toBeGreaterThan(0);
    const rule = css.slice(at, css.indexOf('}', at));
    expect(rule).toMatch(/font-family:\s*var\(--font-ui/);
    expect(rule).toMatch(/text-transform:\s*none/);
    expect(rule).toMatch(/letter-spacing:\s*normal/);
  });
});
