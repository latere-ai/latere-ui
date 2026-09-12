import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { OrgEntry } from '../session/types';
import { orgSwitcherItems, orgSwitcherLabel, type OrgSwitcherDeps, type OrgSwitcherItem } from '../session/orgSwitcherModel';

export interface OrgSwitcherState {
  items: OrgSwitcherItem[];
  currentLabel: string;
  loading: boolean;
  error: unknown;
  select: (orgID: string) => Promise<void>;
  selectPersonal: () => Promise<void>;
  refresh: () => Promise<void>;
}

/** React state adapter. Re-render the host when its current organization changes. */
export function useOrgSwitcher(deps: OrgSwitcherDeps): OrgSwitcherState {
  const depsRef = useRef(deps);
  depsRef.current = deps;
  const [list, setList] = useState<OrgEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const mounted = useRef(true);
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const generation = ++request.current;
    setLoading(true); setError(null);
    try {
      const orgs = await depsRef.current.getOrgs();
      if (mounted.current && generation === request.current) setList(orgs);
    } catch (error) {
      if (mounted.current && generation === request.current) setError(error);
    } finally {
      if (mounted.current && generation === request.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    if (depsRef.current.eager) void refresh();
    return () => { mounted.current = false; request.current++; };
  }, [refresh]);
  const current = deps.getCurrentOrgID() ?? '';
  const label = deps.personalLabel ?? 'Personal';
  return {
    items: orgSwitcherItems(list, current, label), currentLabel: orgSwitcherLabel(list, current, label), loading, error,
    refresh, select: id => depsRef.current.switchOrg(id), selectPersonal: () => depsRef.current.switchOrg(''),
  };
}

export interface OrgSwitcherProps {
  state: OrgSwitcherState;
  header?: ReactNode | ((currentLabel: string) => ReactNode);
  renderItem?: (item: OrgSwitcherItem, select: () => Promise<void>) => ReactNode;
  renderError?: (error: unknown) => ReactNode;
}

/** Headless list: hosts style its documented classes and data attributes. */
export function OrgSwitcher({ state, header, renderItem, renderError }: OrgSwitcherProps) {
  return <div className="latere-org-switcher" data-loading={state.loading ? 'true' : 'false'}>
    {typeof header === 'function' ? header(state.currentLabel) : header}
    <ul role="menu" className="latere-org-switcher__list">{state.items.map(item => <li key={item.id || 'personal'} className="latere-org-switcher__item" data-active={item.active ? 'true' : 'false'} data-owner={item.owner ? 'true' : 'false'} role="none">
      {renderItem ? renderItem(item, () => state.select(item.id)) : <button type="button" role="menuitem" className="latere-org-switcher__button" aria-current={item.active ? 'true' : 'false'} onClick={() => { void state.select(item.id); }}>{item.name}</button>}
    </li>)}</ul>
    {!!state.error && renderError?.(state.error)}
  </div>;
}
