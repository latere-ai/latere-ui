import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { OrgSwitcher, useOrgSwitcher } from '../OrgSwitcher';
import type { OrgEntry } from '../../session/types';
const orgs = [{ id: 'a', name: 'Studio', owner: true }, { id: 'b', name: 'Research' }];

describe('React organization state', () => {
  it('refreshes, tracks props and delegates switching with personal first', async () => {
    const switchOrg = vi.fn(async () => {}); const getOrgs = vi.fn(async () => orgs);
    const hook = renderHook(({ current, personalLabel }) => useOrgSwitcher({ getOrgs, switchOrg, getCurrentOrgID: () => current, personalLabel }), { initialProps: { current: 'a', personalLabel: 'Personal' } });
    expect(hook.result.current.currentLabel).toBe('a'); expect(getOrgs).not.toHaveBeenCalled();
    await act(() => hook.result.current.refresh());
    expect(hook.result.current.items.map(item => item.name)).toEqual(['Personal', 'Studio', 'Research']);
    expect(hook.result.current.items[1]).toMatchObject({ active: true, owner: true });
    expect(hook.result.current.currentLabel).toBe('Studio');
    hook.rerender({ current: '', personalLabel: 'Private' }); expect(hook.result.current.currentLabel).toBe('Private');
    await act(() => hook.result.current.select('b')); await act(() => hook.result.current.selectPersonal());
    expect(switchOrg.mock.calls).toEqual([['b'], ['']]);
  });
  it('shows loading/errors, allows retry, and ignores stale/unmounted refresh results', async () => {
    let resolveFirst!: (value: OrgEntry[]) => void;
    const getOrgs = vi.fn<() => Promise<OrgEntry[]>>().mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; })).mockResolvedValueOnce(orgs).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([]);
    const hook = renderHook(() => useOrgSwitcher({ getOrgs, switchOrg: async () => {}, getCurrentOrgID: () => undefined, eager: true }));
    expect(hook.result.current.loading).toBe(true);
    await act(() => hook.result.current.refresh()); expect(hook.result.current.items).toHaveLength(3);
    await act(async () => resolveFirst([])); expect(hook.result.current.items).toHaveLength(3);
    await act(() => hook.result.current.refresh()); expect((hook.result.current.error as Error).message).toBe('offline'); expect(hook.result.current.loading).toBe(false);
    await act(() => hook.result.current.refresh()); expect(hook.result.current.error).toBeNull();
    let resolveLast!: (value: OrgEntry[]) => void;
    getOrgs.mockImplementationOnce(() => new Promise(resolve => { resolveLast = resolve; }));
    act(() => { void hook.result.current.refresh(); }); hook.unmount(); await act(async () => resolveLast(orgs));
  });
  it('survives StrictMode setup cleanup and renders default/custom rows and errors', async () => {
    const select = vi.fn(async () => {});
    function Fixture() {
      const state = useOrgSwitcher({ getOrgs: async () => orgs, getCurrentOrgID: () => 'a', switchOrg: select, eager: true });
      return <OrgSwitcher state={state} header={label => <h2>{label}</h2>} />;
    }
    const view = render(<StrictMode><Fixture /></StrictMode>);
    await act(async () => {});
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    expect(screen.getByRole('heading').textContent).toBe('Studio');
    fireEvent.click(screen.getByRole('menuitem', { name: 'Personal' })); expect(select).toHaveBeenCalledWith('');
    expect(view.container.querySelector('[data-owner="true"]')).toBeTruthy();
    const state = { items: [{ id: 'a', name: 'Studio', active: true }], currentLabel: 'Studio', loading: true, error: 'offline', select, selectPersonal: async () => {}, refresh: async () => {} };
    view.rerender(<OrgSwitcher state={state} header={<b>Header</b>} renderItem={(item, choose) => <button onClick={() => { void choose(); }}>Pick {item.name}</button>} renderError={error => <p>{String(error)}</p>} />);
    expect(view.container.firstElementChild?.getAttribute('data-loading')).toBe('true');
    fireEvent.click(screen.getByText('Pick Studio')); expect(select).toHaveBeenCalledWith('a'); expect(screen.getByText('offline')).toBeTruthy();
  });
});
