// Regression tests for the expired-session bug: a mid-session 401 on an
// authenticated request must reject the session and require re-login
// (silent-recheck on dashboards), while a logged-out visitor probing /api/me
// must NOT be bounced. Also locks the switch-org redirect modes.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { createApiClient } from '../src/session/client';
import { createSessionStore } from '../src/session/store';
import type { Principal } from '../src/session/types';

const PRINCIPAL: Principal = {
  principal_id: 'p1',
  email: 'a@b.c',
  initials: 'AB',
  org_id: '',
  orgs: [{ id: 'o1', name: 'Org One', slug: 'org-one' }],
};

// happy-dom's window.location is not assignable; replace href with a spy.
let hrefSpy: ReturnType<typeof vi.fn>;
function stubLocation(pathname: string) {
  hrefSpy = vi.fn();
  const set = hrefSpy as unknown as (v: string) => void;
  const loc = { pathname, search: '', href: '' } as unknown as Location;
  Object.defineProperty(loc, 'href', { get: () => '', set });
  Object.defineProperty(window, 'location', { value: loc, configurable: true, writable: true });
}

// Build a fetch that returns a queued sequence of [status, jsonBody] tuples.
function mockFetch(responses: Array<[number, unknown]>) {
  let i = 0;
  return vi.fn(async () => {
    const [status, body] = responses[Math.min(i++, responses.length - 1)];
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: 'x',
      text: async () => JSON.stringify(body),
    } as Response;
  });
}

type StoreOpts = Parameters<typeof createSessionStore>[0];
function wire(opts: Partial<StoreOpts> = {}) {
  const client = createApiClient({ csrfCookie: '__test_csrf' });
  const useStore = createSessionStore({
    client,
    storeId: 'auth',
    defaultReturnTo: '/playground',
    ...opts,
  } as StoreOpts);
  const store = useStore();
  // The seam redirects back to the current browser page, not the API path.
  client.onUnauthorized = () => store.handleExpired();
  return { client, store };
}

beforeEach(() => {
  setActivePinia(createPinia());
  sessionStorage.clear();
  stubLocation('/playground');
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('expired-session handling (the bug)', () => {
  it('silent-recheck: a 401 on an authed call while signed in redirects to /login?prompt=none', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, PRINCIPAL]]));
    const { client, store } = wire({ expiredSessionMode: 'silent-recheck' });
    await store.fetchMe();
    expect(store.me).not.toBeNull();

    // Session now expires server-side; the next authed call 401s.
    vi.stubGlobal('fetch', mockFetch([[401, { error: 'unauthorized', message: 'no valid session' }]]));
    await expect(client.api('GET', '/api/jobs')).rejects.toMatchObject({ status: 401 });

    expect(hrefSpy).toHaveBeenCalledTimes(1);
    expect(hrefSpy.mock.calls[0][0]).toBe('/login?prompt=none&return_to=' + encodeURIComponent('/playground'));
    expect(store.me).toBeNull();
  });

  it('graceful mode: the same 401 clears me but does NOT navigate', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, PRINCIPAL]]));
    const { client, store } = wire({ expiredSessionMode: 'graceful' });
    await store.fetchMe();

    vi.stubGlobal('fetch', mockFetch([[401, { message: 'no session' }]]));
    await expect(client.api('GET', '/api/jobs')).rejects.toMatchObject({ status: 401 });

    expect(hrefSpy).not.toHaveBeenCalled();
    expect(store.me).toBeNull();
  });

  it('carve-out: a logged-out visitor probing /api/me is not redirected', async () => {
    vi.stubGlobal('fetch', mockFetch([[401, { error: 'unauthorized' }]]));
    const { store } = wire({ expiredSessionMode: 'silent-recheck' });
    await store.fetchMe();
    expect(hrefSpy).not.toHaveBeenCalled();
    expect(store.me).toBeNull();
    expect(store.loaded).toBe(true);
  });

  it('loop safety: the bounce-back does an interactive login, never another prompt=none', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, PRINCIPAL]]));
    const { client, store } = wire({ expiredSessionMode: 'silent-recheck' });
    await store.fetchMe();

    // First mid-session 401 → silent prompt=none re-check (sets sso_checked).
    vi.stubGlobal('fetch', mockFetch([[401, {}]]));
    await client.api('GET', '/api/jobs').catch(() => {});
    expect(hrefSpy.mock.calls[0][0]).toContain('prompt=none');

    // Bounce-back lands on a fresh store instance, still unauthenticated.
    setActivePinia(createPinia());
    const { client: c2 } = wire({ expiredSessionMode: 'silent-recheck' });
    hrefSpy.mockClear();
    vi.stubGlobal('fetch', mockFetch([[401, {}]]));
    await c2.api('GET', '/api/jobs').catch(() => {});

    // sso_checked is already set → must NOT loop with another prompt=none;
    // instead a terminal interactive login.
    expect(hrefSpy).toHaveBeenCalledTimes(1);
    expect(hrefSpy.mock.calls[0][0]).not.toContain('prompt=none');
    expect(hrefSpy.mock.calls[0][0]).toContain('/login?return_to=');
  });
});

describe('switchOrg redirect modes', () => {
  it('follow-redirect uses the response redirect', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, { redirect: '/overview?org=o1' }]]));
    const { store } = wire({ switchOrgMode: 'follow-redirect' });
    await store.switchOrg('o1');
    expect(hrefSpy).toHaveBeenCalledWith('/overview?org=o1');
  });

  it('login-bounce builds a /login?return_to&org_id URL', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, {}]]));
    const { store } = wire({ switchOrgMode: 'login-bounce', defaultReturnTo: '/dashboard' });
    await store.switchOrg('o1');
    expect(hrefSpy).toHaveBeenCalledWith(
      '/login?return_to=' + encodeURIComponent('/dashboard') + '&org_id=o1',
    );
  });
});
