import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { AccountMenu } from '../src/react/AccountMenu';

const principal = { principal_id: 'p1', email: 'ada@example.com', org_id: '', orgs: [{ id: 'o1', name: 'Team' }] };
const extraItems = [{ id: 'action', label: 'Action' }];

describe('AccountMenu form safety', () => {
  it('trigger and actions never submit the enclosing form', () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const w = render(<form onSubmit={submit}><AccountMenu principal={principal} dashboardPath="/dashboard" extraItems={extraItems} /></form>);
    fireEvent.click(w.container.querySelector('.lu-am-trigger')!);
    expect(submit).not.toHaveBeenCalled();
    for (const button of w.container.querySelectorAll('button')) expect(button.type).toBe('button');
    fireEvent.click(w.container.querySelector('.lu-am-org')!);
    expect(submit).not.toHaveBeenCalled();
  });
});
