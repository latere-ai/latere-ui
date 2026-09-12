import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { fireEvent, render } from '@testing-library/react';
import { h } from 'vue';
import VueAccountMenu from '../src/components/AccountMenu.vue';
import { AccountMenu as ReactAccountMenu } from '../src/react/AccountMenu';

const principal = { principal_id: 'p1', email: 'ada@example.com', org_id: '', orgs: [{ id: 'o1', name: 'Team' }] };
const extraItems = [{ id: 'action', label: 'Action' }];

describe('AccountMenu form safety', () => {
  it('Vue trigger and actions never submit the enclosing form', async () => {
    const submit = vi.fn((event: Event) => event.preventDefault());
    const w = mount({ render: () => h('form', { onSubmit: submit }, h(VueAccountMenu, { principal, dashboardPath: '/dashboard', extraItems })) }, { attachTo: document.body });
    try {
      expect((w.get('.lu-am-trigger').element as HTMLButtonElement).type).toBe('button');
      (w.get('.lu-am-trigger').element as HTMLButtonElement).click();
      await w.vm.$nextTick();
      expect(submit).not.toHaveBeenCalled();
      for (const button of w.findAll('button')) expect((button.element as HTMLButtonElement).type).toBe('button');
      (w.get('.lu-am-org').element as HTMLButtonElement).click();
      expect(submit).not.toHaveBeenCalled();
    } finally { w.unmount(); }
  });

  it('React trigger and actions never submit the enclosing form', () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const w = render(<form onSubmit={submit}><ReactAccountMenu principal={principal} dashboardPath="/dashboard" extraItems={extraItems} /></form>);
    fireEvent.click(w.container.querySelector('.lu-am-trigger')!);
    expect(submit).not.toHaveBeenCalled();
    for (const button of w.container.querySelectorAll('button')) expect(button.type).toBe('button');
    fireEvent.click(w.container.querySelector('.lu-am-org')!);
    expect(submit).not.toHaveBeenCalled();
  });
});
