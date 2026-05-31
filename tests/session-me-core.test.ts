// Vanilla async core tests. The functions in src/session/me.ts must behave
// identically to the analogous Pinia-store actions: me() returns null on
// 401/404, switchOrg POSTs then follows the response or bounces, logout/login
// navigate. Coverage here lets the store later delegate to this module
// without losing behavior.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApiClient } from '../src/session/client';
import {
  login,
  logout,
  me,
  orgs,
  switchOrg,
  switchPersonal,
} from '../src/session/me';
import type { OrgEntry, Principal } from '../src/session/types';

const PRINCIPAL: Principal = {
  principal_id: 'p1',
  email: 'a@b.c',
  initials: 'AB',
  org_id: '',
  orgs: [],
};

let hrefSpy: ReturnType<typeof vi.fn>;
function stubLocation() {
  hrefSpy = vi.fn();
  const set = hrefSpy as unknown as (v: string) => void;
  const loc = { pathname: '/', search: '', href: '' } as unknown as Location;
  Object.defineProperty(loc, 'href', { get: () => '', set });
  Object.defineProperty(window, 'location', { value: loc, configurable: true, writable: true });
}

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

beforeEach(() => {
  stubLocation();
  vi.stubGlobal('fetch', mockFetch([[200, PRINCIPAL]]));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('me()', () => {
  it('returns the principal on 200', async () => {
    const c = createApiClient();
    const p = await me<Principal>(c);
    expect(p?.principal_id).toBe('p1');
  });

  it('returns null on 401', async () => {
    vi.stubGlobal('fetch', mockFetch([[401, { error: 'unauthorized' }]]));
    const c = createApiClient();
    const p = await me<Principal>(c);
    expect(p).toBeNull();
  });

  it('returns null on 404', async () => {
    vi.stubGlobal('fetch', mockFetch([[404, { error: 'not_found' }]]));
    const c = createApiClient();
    const p = await me<Principal>(c);
    expect(p).toBeNull();
  });

  it('throws on 500', async () => {
    vi.stubGlobal('fetch', mockFetch([[500, { error: 'internal' }]]));
    const c = createApiClient();
    await expect(me<Principal>(c)).rejects.toThrow();
  });

  it('honors custom endpoint and mapMe', async () => {
    type Raw = { sub: string; client_id?: string };
    vi.stubGlobal('fetch', mockFetch([[200, { sub: 'u-1' }]]));
    const c = createApiClient();
    const p = await me<Raw>(c, {
      endpoint: '/me',
      mapMe: (raw) => ({
        principal_id: raw.sub,
        email: '',
        org_id: '',
        orgs: [],
      }),
    });
    expect(p?.principal_id).toBe('u-1');
  });
});

describe('orgs()', () => {
  it('returns the list on 200', async () => {
    const expected: OrgEntry[] = [{ id: 'o1', name: 'Org One', slug: 'org-one' }];
    vi.stubGlobal('fetch', mockFetch([[200, expected]]));
    const c = createApiClient();
    const got = await orgs(c);
    expect(got).toEqual(expected);
  });

  it('throws on non-2xx (no implicit logged-out semantics)', async () => {
    vi.stubGlobal('fetch', mockFetch([[401, {}]]));
    const c = createApiClient();
    await expect(orgs(c)).rejects.toThrow();
  });
});

describe('switchOrg()', () => {
  it('follows redirect on success', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, { redirect: '/dashboard' }]]));
    const c = createApiClient();
    await switchOrg(c, 'org-2');
    expect(hrefSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('falls back to login bounce on error', async () => {
    vi.stubGlobal('fetch', mockFetch([[500, {}]]));
    const c = createApiClient();
    await switchOrg(c, 'org-2');
    expect(hrefSpy).toHaveBeenCalledWith('/login?return_to=%2F&org_id=org-2');
  });

  it('honors login-bounce mode regardless of success', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, { redirect: '/x' }]]));
    const c = createApiClient();
    await switchOrg(c, 'org-2', { mode: 'login-bounce' });
    expect(hrefSpy).toHaveBeenCalledWith('/login?return_to=%2F&org_id=org-2');
  });

  it('honors custom loginPath, endpoint, defaultReturnTo', async () => {
    vi.stubGlobal('fetch', mockFetch([[500, {}]]));
    const c = createApiClient();
    await switchOrg(c, 'org-2', {
      endpoint: '/custom',
      loginPath: '/sign-in',
      defaultReturnTo: '/home',
    });
    expect(hrefSpy).toHaveBeenCalledWith('/sign-in?return_to=%2Fhome&org_id=org-2');
  });
});

describe('switchPersonal()', () => {
  it('passes empty org_id', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, { redirect: '/' }]]));
    const c = createApiClient();
    await switchPersonal(c);
    expect(hrefSpy).toHaveBeenCalledWith('/');
  });
});

describe('logout() / login()', () => {
  it('logout navigates to default /logout', () => {
    logout();
    expect(hrefSpy).toHaveBeenCalledWith('/logout');
  });

  it('logout honors logoutPath', () => {
    logout({ logoutPath: '/sign-out' });
    expect(hrefSpy).toHaveBeenCalledWith('/sign-out');
  });

  it('logout suppresses navigation when redirect=false', () => {
    logout({ redirect: false });
    expect(hrefSpy).not.toHaveBeenCalled();
  });

  it('logout honors explicit redirect override', () => {
    logout({ redirect: '/bye' });
    expect(hrefSpy).toHaveBeenCalledWith('/bye');
  });

  it('login navigates with return_to', () => {
    login('/login', '/dashboard');
    expect(hrefSpy).toHaveBeenCalledWith('/login?return_to=%2Fdashboard');
  });

  it('login without return_to', () => {
    login();
    expect(hrefSpy).toHaveBeenCalledWith('/login');
  });
});
