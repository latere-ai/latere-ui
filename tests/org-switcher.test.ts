import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';

import OrgSwitcher from '../src/components/OrgSwitcher.vue';
import { createOrgSwitcher } from '../src/session/orgSwitcher';
import type { OrgEntry } from '../src/session/types';

const ORGS: OrgEntry[] = [
  { id: 'o1', name: 'Org One', slug: 'org-one', owner: true },
  { id: 'o2', name: 'Org Two' },
];

// Real consumers wire getCurrentOrgID against a Pinia store ref so it tracks
// reactively. The tests mirror that with a vue ref so computed() re-runs when
// the value changes.
let currentOrg = ref('');
function getCurrent() {
  return currentOrg.value;
}

beforeEach(() => {
  currentOrg = ref('');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createOrgSwitcher()', () => {
  it('refresh() populates items with Personal first, then orgs in API order', async () => {
    const state = createOrgSwitcher({
      getOrgs: async () => ORGS,
      getCurrentOrgID: getCurrent,
      switchOrg: async () => {},
    });
    expect(state.items.value.length).toBe(1); // only Personal until refresh

    await state.refresh();
    expect(state.items.value.map((i) => i.id)).toEqual(['', 'o1', 'o2']);
    expect(state.items.value[0].name).toBe('Personal');
    expect(state.items.value[1].owner).toBe(true);
    expect(state.items.value[2].owner).toBeFalsy();
  });

  it('honors a custom personalLabel', async () => {
    const state = createOrgSwitcher({
      getOrgs: async () => ORGS,
      getCurrentOrgID: getCurrent,
      switchOrg: async () => {},
      personalLabel: 'My Personal Account',
    });
    await state.refresh();
    expect(state.items.value[0].name).toBe('My Personal Account');
    expect(state.currentLabel.value).toBe('My Personal Account');
  });

  it('active flag tracks getCurrentOrgID', async () => {
    const state = createOrgSwitcher({
      getOrgs: async () => ORGS,
      getCurrentOrgID: getCurrent,
      switchOrg: async () => {},
    });
    await state.refresh();
    expect(state.items.value[0].active).toBe(true); // Personal

    currentOrg.value = 'o2';
    expect(state.items.value[2].active).toBe(true);
    expect(state.items.value[0].active).toBe(false);
    expect(state.currentLabel.value).toBe('Org Two');
  });

  it('currentLabel falls back to the org id when the list is empty', async () => {
    currentOrg.value = 'unknown';
    const state = createOrgSwitcher({
      getOrgs: async () => [],
      getCurrentOrgID: getCurrent,
      switchOrg: async () => {},
    });
    expect(state.currentLabel.value).toBe('unknown');
  });

  it('select() and selectPersonal() delegate to switchOrg', async () => {
    const calls: string[] = [];
    const state = createOrgSwitcher({
      getOrgs: async () => ORGS,
      getCurrentOrgID: getCurrent,
      switchOrg: async (id) => {
        calls.push(id);
      },
    });
    await state.select('o1');
    await state.selectPersonal();
    expect(calls).toEqual(['o1', '']);
  });

  it('refresh() captures errors without throwing', async () => {
    const boom = new Error('boom');
    const state = createOrgSwitcher({
      getOrgs: async () => {
        throw boom;
      },
      getCurrentOrgID: getCurrent,
      switchOrg: async () => {},
    });
    await state.refresh();
    expect(state.error.value).toBe(boom);
    expect(state.loading.value).toBe(false);
  });

  it('eager:true refreshes during construction', async () => {
    let called = 0;
    const state = createOrgSwitcher({
      getOrgs: async () => {
        called++;
        return ORGS;
      },
      getCurrentOrgID: getCurrent,
      switchOrg: async () => {},
      eager: true,
    });
    // wait for the eager refresh to complete
    await new Promise((r) => setTimeout(r, 0));
    expect(called).toBe(1);
    expect(state.items.value.length).toBe(3);
  });
});

describe('<OrgSwitcher />', () => {
  it('renders a button per item with active/owner attributes', async () => {
    const state = createOrgSwitcher({
      getOrgs: async () => ORGS,
      getCurrentOrgID: getCurrent,
      switchOrg: async () => {},
    });
    await state.refresh();

    const wrapper = mount(OrgSwitcher, { props: { state } });
    const items = wrapper.findAll('li.latere-org-switcher__item');
    expect(items.length).toBe(3);
    expect(items[0].attributes('data-active')).toBe('true'); // Personal active
    expect(items[1].attributes('data-owner')).toBe('true'); // o1 owner badge

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(3);
    expect(buttons[1].text()).toBe('Org One');
  });

  it('binds data-loading to the reactive flag (true mid-refresh, false after)', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    const state = createOrgSwitcher({
      getOrgs: async () => {
        await gate;
        return ORGS;
      },
      getCurrentOrgID: getCurrent,
      switchOrg: async () => {},
    });

    const wrapper = mount(OrgSwitcher, { props: { state } });
    const refreshing = state.refresh();
    await nextTick();
    expect(wrapper.find('.latere-org-switcher').attributes('data-loading')).toBe('true');

    release();
    await refreshing;
    await nextTick();
    expect(wrapper.find('.latere-org-switcher').attributes('data-loading')).toBe('false');
  });

  it('clicking a button calls switchOrg with the item id', async () => {
    const calls: string[] = [];
    const state = createOrgSwitcher({
      getOrgs: async () => ORGS,
      getCurrentOrgID: getCurrent,
      switchOrg: async (id) => {
        calls.push(id);
      },
    });
    await state.refresh();

    const wrapper = mount(OrgSwitcher, { props: { state } });
    await wrapper.findAll('button')[2].trigger('click');
    await nextTick();
    expect(calls).toEqual(['o2']);
  });
});
