// Headless org-switcher primitive. Holds the reactive state (list of orgs,
// current selection, loading/error flags) and the navigation actions; the
// visual representation is left entirely to the consumer.
//
// Used by the Vue adapter at src/components/OrgSwitcher.vue and by any
// vanilla-JS harness that wants to render the switcher itself
// (e.g. wallfacer's ui/js/status-bar.js).
//
// Personal context is modeled as an org_id of "" — the same convention the
// auth server uses in JWT claims and that the store has always exposed.

import { computed, ref, type ComputedRef, type Ref } from 'vue';

import type { OrgEntry } from './types';

import { orgSwitcherItems, orgSwitcherLabel, type OrgSwitcherDeps, type OrgSwitcherItem } from './orgSwitcherModel';
export type { OrgSwitcherDeps, OrgSwitcherItem } from './orgSwitcherModel';

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

  const items = computed<OrgSwitcherItem[]>(() => orgSwitcherItems(list.value, deps.getCurrentOrgID() ?? '', personalLabel));
  const currentLabel = computed(() => orgSwitcherLabel(list.value, deps.getCurrentOrgID() ?? '', personalLabel));

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
