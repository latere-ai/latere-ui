// The route gate / auto-login: on a gated route with no session it performs a
// single silent prompt=none re-check; on the bounce-back (sso_checked already
// set) it must NOT loop, and the composable surfaces showAuthGate.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';

import { createApiClient } from '../src/session/client';
import { createSessionStore } from '../src/session/store';
import { useSessionGate, type GateRoute, type GateRouter } from '../src/session/gate';

let hrefSpy: ReturnType<typeof vi.fn>;
function stubLocation(pathname: string) {
  hrefSpy = vi.fn();
  const set = hrefSpy as unknown as (v: string) => void;
  const loc = { pathname, search: '', href: '' } as unknown as Location;
  Object.defineProperty(loc, 'href', { get: () => '', set });
  Object.defineProperty(window, 'location', { value: loc, configurable: true, writable: true });
}

function alwaysUnauthorized() {
  return vi.fn(async () => ({
    ok: false,
    status: 401,
    statusText: 'x',
    text: async () => JSON.stringify({ error: 'unauthorized' }),
  }) as Response);
}

function makeStore() {
  const client = createApiClient({});
  const useStore = createSessionStore({
    client,
    storeId: 'auth',
    defaultReturnTo: '/overview',
    expiredSessionMode: 'silent-recheck',
  });
  return useStore();
}

beforeEach(() => {
  setActivePinia(createPinia());
  sessionStorage.clear();
  stubLocation('/overview');
  vi.stubGlobal('fetch', alwaysUnauthorized());
});
afterEach(() => vi.restoreAllMocks());

describe('useSessionGate', () => {
  it('does one prompt=none redirect, sets sso_checked, and gates without looping', async () => {
    const store = makeStore();

    const replace = vi.fn();
    const route: GateRoute = { path: '/overview', fullPath: '/overview', query: {} };
    const router: GateRouter = { replace } as unknown as GateRouter;

    // First entry: no session → one silent recheck redirect.
    const Comp = defineComponent({
      setup() {
        const gate = useSessionGate(store, route, router);
        return () => h('div', { 'data-gate': gate.showAuthGate.value ? '1' : '0' });
      },
    });
    const w = mount(Comp);
    await flushPromises();

    expect(hrefSpy).toHaveBeenCalledTimes(1);
    expect(hrefSpy.mock.calls[0][0]).toContain('/login?prompt=none&return_to=');
    expect(sessionStorage.getItem('latere.sso_checked.auth')).toBe('1');
    w.unmount();

    // Second entry (the bounce-back): sso_checked already set → no loop, gate shows.
    hrefSpy.mockClear();
    setActivePinia(createPinia());
    const store2 = makeStore();
    const route2: GateRoute = { path: '/overview', fullPath: '/overview', query: { sso_checked: '1' } };
    const Comp2 = defineComponent({
      setup() {
        const gate = useSessionGate(store2, route2, router);
        return () => h('div', { 'data-gate': gate.showAuthGate.value ? '1' : '0' });
      },
    });
    const w2 = mount(Comp2);
    await flushPromises();

    expect(hrefSpy).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalled(); // sso_checked query stripped
    expect(w2.attributes('data-gate')).toBe('1'); // showAuthGate true
  });
});
