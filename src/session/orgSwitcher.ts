// Headless org-switcher primitive. Holds the reactive state (list of orgs,
// current selection, loading/error flags) and the navigation actions; the
// visual representation is left entirely to the consumer.
//
// Used by the Vue adapter at src/components/OrgSwitcher.vue and by any
// vanilla-JS harness that wants to render the switcher itself
// (e.g. wallfacer's ui/js/status-bar.js).
//
// Personal context is modelled as an org_id of "" — the same convention the
// auth server uses in JWT claims and that the store has always exposed.

import { computed, ref, type ComputedRef, type Ref } from 'vue';

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

export interface OrgSwitcherState {
  items: ComputedRef<OrgSwitcherItem[]>;
  currentLabel: ComputedRef<string>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
  select: (orgID: string) => Promise<void>;
  selectPersonal: () => Promise<void>;
  refresh: () => Promise<void>;
}

/** Wire reactive state + actions for an org switcher UI. */
export function createOrgSwitcher(deps: OrgSwitcherDeps): OrgSwitcherState {
  const personalLabel = deps.personalLabel ?? 'Personal';

  const list = ref<OrgEntry[]>([]);
  const loading = ref(false);
  const error = ref<unknown>(null);

  async function refresh() {
    loading.value = true;
    error.value = null;
    try {
      list.value = await deps.getOrgs();
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  if (deps.eager) {
    void refresh();
  }

  const items = computed<OrgSwitcherItem[]>(() => {
    const current = deps.getCurrentOrgID() ?? '';
    const out: OrgSwitcherItem[] = [
      { id: '', name: personalLabel, active: current === '' },
    ];
    for (const o of list.value) {
      out.push({
        id: o.id,
        name: o.name,
        slug: o.slug,
        owner: o.owner,
        active: current === o.id,
      });
    }
    return out;
  });

  const currentLabel = computed(() => {
    const current = deps.getCurrentOrgID() ?? '';
    if (current === '') return personalLabel;
    const hit = list.value.find((o) => o.id === current);
    return hit?.name ?? current;
  });

  return {
    items,
    currentLabel,
    loading,
    error,
    select: (orgID: string) => deps.switchOrg(orgID),
    selectPersonal: () => deps.switchOrg(''),
    refresh,
  };
}
