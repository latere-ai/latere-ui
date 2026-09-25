// The React account menu's text subline. tests/account-menu-subline-vue.test.ts
// holds the Vue twin.
import { fireEvent, render } from '@testing-library/react';
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

  it('sets the role as a sentence-case badge, then the account in quiet text', () => {
    const { container, rerender } = render(<AccountMenu principal={principal} subline="role" placement="bottom-start" />);
    expect(container.querySelector('.lu-am')?.getAttribute('data-subline')).toBe('role');
    const line = container.querySelector('.lu-am-trigger .lu-am-id-role')!;
    expect([...line.children].map((c) => c.classList[0])).toEqual(['lu-am-role', 'lu-am-id-context']);
    expect(line.querySelector('.lu-am-role')?.textContent).toBe('Platform admin');
    expect(line.querySelector('.lu-am-role')?.classList.contains('lu-am-role-platform_admin')).toBe(true);
    expect(line.querySelector('.lu-am-id-context')?.textContent).toBe('Personal');
    expect(container.querySelector('.lu-am-id-sub')).toBeNull();
    rerender(<AccountMenu principal={{ ...principal, role: 'individual' }} subline="role" placement="bottom-start" />);
    expect(container.querySelector('.lu-am-id-role .lu-am-role')).toBeNull();
    expect(container.querySelector('.lu-am-id-context')?.textContent).toBe('Personal');
  });

  it('states the role in the dropdown header in the same case', () => {
    const { container } = render(<AccountMenu principal={{ ...principal, org_id: 'o', org_name: 'Design Studio' }} subline="role" placement="bottom-start" />);
    fireEvent.click(container.querySelector('.lu-am-trigger')!);
    expect(container.querySelector('.lu-am-head-meta .lu-am-role')?.textContent).toBe('Platform admin');
    expect(container.querySelector('.lu-am-head-meta .lu-am-head-context')?.textContent).toBe('Design Studio');
  });

  it('keeps the uppercase badge in the header by default', () => {
    const { container } = render(<AccountMenu principal={principal} />);
    fireEvent.click(container.querySelector('.lu-am-trigger')!);
    expect(container.querySelector('.lu-am-head-meta .lu-am-role')?.textContent).toBe('Platform Admin');
    expect(container.querySelector('.lu-am-head-meta .lu-am-head-context')?.textContent).toBe('Individual');
  });
});
