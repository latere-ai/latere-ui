import type { OrgEntry } from './types';

/** A single item the switcher renders. */
export interface OrgSwitcherItem {
  /** Org id; empty string for the personal context. */
  id: string;
  /** Display name. */
  name: string;
  /** Optional slug for URL-style displays. */
  slug?: string;
  /** True for the currently-active row. */
  active: boolean;
  /** Carried through from OrgEntry for badge rendering. */
  owner?: boolean;
}

export interface OrgSwitcherDeps {
  /** Fetch the principal's orgs. Defaults to `orgs(client)` in callers. */
  getOrgs: () => Promise<OrgEntry[]>;
  /** Returns the currently-active org id. */
  getCurrentOrgID: () => string | undefined;
  /** Switch to the chosen org. Empty string switches to Personal. */
  switchOrg: (orgID: string) => Promise<void>;
  /** Label rendered for the Personal row. Default: `'Personal'`. */
  personalLabel?: string;
  /** If true, fetch orgs eagerly during construction. Default: `false`. */
  eager?: boolean;
}

/** Project the API order without mixing in framework state. */
export function orgSwitcherItems(list: OrgEntry[], current: string, personalLabel: string): OrgSwitcherItem[] {
  return [{ id: '', name: personalLabel, active: current === '' }, ...list.map(org => ({
    id: org.id, name: org.name, slug: org.slug, owner: org.owner, active: current === org.id,
  }))];
}

export function orgSwitcherLabel(list: OrgEntry[], current: string, personalLabel: string): string {
  return current === '' ? personalLabel : list.find(org => org.id === current)?.name ?? current;
}
