// The React account menu's text subline. tests/account-menu-subline-vue.test.ts
// holds the Vue twin.
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AccountMenu } from '../AccountMenu';

describe('AccountMenu text subline (react)', () => {
  const principal = { principal_id: 'p', email: 'a@example.test', name: 'Alex Morgan', initials: 'AM', org_id: '', role: 'platform_admin' as const, orgs: [] };

  it('states the role and account in one quiet line', () => {
    const { container, rerender } = render(<AccountMenu principal={principal} subline="text" placement="bottom-start" />);
    expect(container.querySelector('.lu-am-id-line')?.textContent).toBe('Platform admin · Personal');
    expect(container.querySelector('.lu-am-id-sub')).toBeNull();
    expect(container.querySelector('.lu-am-trigger .lu-am-role')).toBeNull();
    rerender(<AccountMenu principal={{ ...principal, role: 'org_admin', org_id: 'o', org_name: 'Design Studio' }} subline="text" labels={{ roleNames: { org_admin: 'Owner' } }} />);
    expect(container.querySelector('.lu-am-id-line')?.textContent).toBe('Owner · Design Studio');
  });

  it('keeps the badge subline by default', () => {
    const { container } = render(<AccountMenu principal={principal} />);
    expect(container.querySelector('.lu-am-id-line')).toBeNull();
    expect(container.querySelector('.lu-am-id-sub .lu-am-role')?.textContent).toBe('Platform Admin');
  });
});
