// SessionProvider / useSession / useSessionGate — the React port of
// session/store.ts + session/gate.ts over the vanilla core. Mirrors the
// fetch-mock pattern from tests/session-me-core.test.ts and the
// prompt=none/sso_checked scenario from tests/session-gate.test.ts, adapted
// to testing-library/react (renderHook + waitFor).
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Principal } from '../../session/types';
import { SessionProvider, useSession, useSessionGate } from '../session';

const PRINCIPAL: Principal = {
  principal_id: 'p1',
  email: 'a@b.c',
  initials: 'AB',
  org_id: '',
  orgs: [],
};

let hrefSpy: ReturnType<typeof vi.fn>;
function stubLocation(pathname = '/', search = '') {
  hrefSpy = vi.fn();
  const set = hrefSpy as unknown as (v: string) => void;
  const loc = { pathname, search, href: '' } as unknown as Location;
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

function wrapper(props: Record<string, unknown> = {}) {
  return ({ children }: { children: ReactNode }) => (
    <SessionProvider {...props}>{children}</SessionProvider>
  );
}

beforeEach(() => {
  stubLocation();
  sessionStorage.clear();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SessionProvider / useSession', () => {
  it('goes loading -> authenticated on 200', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, PRINCIPAL]]));
    const { result } = renderHook(() => useSession(), { wrapper: wrapper() });
    expect(result.current.loading).toBe(true);
    expect(result.current.principal).toBeNull();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.principal?.principal_id).toBe('p1');
    expect(result.current.error).toBeNull();
  });

  it('goes loading -> anonymous on 401 (no error surfaced)', async () => {
    vi.stubGlobal('fetch', mockFetch([[401, { error: 'unauthorized' }]]));
    const { result } = renderHook(() => useSession(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.principal).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('surfaces a non-401/404 fetchMe failure as error', async () => {
    vi.stubGlobal('fetch', mockFetch([[500, { error: 'internal' }]]));
    const { result } = renderHook(() => useSession(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.principal).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('throws when called outside a SessionProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSession())).toThrow(/SessionProvider/);
    spy.mockRestore();
  });

  it('a mid-session 401 clears the principal and runs the silent-recheck seam', async () => {
    // return_to must be the page the user is on, not the API path that 401'd;
    // otherwise re-auth lands them on a raw JSON response.
    stubLocation('/settings/billing', '?tab=payment');
    vi.stubGlobal(
      'fetch',
      mockFetch([
        [200, PRINCIPAL],
        [401, { error: 'unauthorized' }],
      ]),
    );
    const { result } = renderHook(() => useSession(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.principal).not.toBeNull());

    await act(async () => {
      await expect(result.current.client.api('GET', '/v1/thing')).rejects.toThrow();
    });

    expect(result.current.principal).toBeNull();
    expect(hrefSpy).toHaveBeenCalledTimes(1);
    expect(hrefSpy.mock.calls[0][0]).toBe(
      '/login?prompt=none&return_to=' + encodeURIComponent('/settings/billing?tab=payment'),
    );
  });

  it('a mid-session 401 after the silent recheck falls back to interactive login on the current page', async () => {
    // Silent re-auth already ran this tab, so recoverSession goes straight to
    // the interactive login. It must carry the same current-page return_to.
    stubLocation('/settings/billing', '?tab=payment');
    vi.stubGlobal(
      'fetch',
      mockFetch([
        [200, PRINCIPAL],
        [401, { error: 'unauthorized' }],
      ]),
    );
    const { result } = renderHook(() => useSession(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.principal).not.toBeNull());
    // Set after the session resolves: a live session clears the flag.
    sessionStorage.setItem('latere.sso_checked.session', '1');

    await act(async () => {
      await expect(result.current.client.api('GET', '/v1/thing')).rejects.toThrow();
    });

    expect(result.current.principal).toBeNull();
    expect(hrefSpy).toHaveBeenCalledTimes(1);
    expect(hrefSpy.mock.calls[0][0]).toBe(
      '/login?return_to=' + encodeURIComponent('/settings/billing?tab=payment'),
    );
  });

  it('switchOrg follows the redirect from the endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch([
        [200, PRINCIPAL],
        [200, { redirect: '/dashboard' }],
      ]),
    );
    const { result } = renderHook(() => useSession(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.switchOrg('org-2');
    });
    expect(hrefSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('logout clears the recheck flag and navigates to logoutPath', async () => {
    vi.stubGlobal('fetch', mockFetch([[401, {}]]));
    sessionStorage.setItem('latere.sso_checked.session', '1');
    const { result } = renderHook(() => useSession(), {
      wrapper: wrapper({ logoutPath: '/sign-out' }),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.logout());
    expect(hrefSpy).toHaveBeenCalledWith('/sign-out');
    expect(sessionStorage.getItem('latere.sso_checked.session')).toBeNull();
  });
});

describe('useSessionGate', () => {
  it('does one prompt=none redirect, sets sso_checked, and gates without looping', async () => {
    stubLocation('/overview', '');
    vi.stubGlobal('fetch', mockFetch([[401, {}]]));
    const gateWrapper = wrapper({ storeId: 'auth', defaultReturnTo: '/overview' });

    const { result, unmount } = renderHook(() => useSessionGate({ path: '/overview' }), {
      wrapper: gateWrapper,
    });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(hrefSpy).toHaveBeenCalledTimes(1);
    expect(hrefSpy.mock.calls[0][0]).toContain('/login?prompt=none&return_to=');
    expect(sessionStorage.getItem('latere.sso_checked.auth')).toBe('1');
    expect(result.current.showAuthGate).toBe(true);
    unmount();

    // Bounce-back: sso_checked already set in the URL → no loop, marker stripped.
    hrefSpy.mockClear();
    stubLocation('/overview', '?sso_checked=1');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    vi.stubGlobal('fetch', mockFetch([[401, {}]]));

    const { result: result2 } = renderHook(
      () => useSessionGate({ path: '/overview', fullPath: '/overview?sso_checked=1' }),
      { wrapper: gateWrapper },
    );
    await waitFor(() => expect(result2.current.ready).toBe(true));
    expect(hrefSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy).toHaveBeenCalled();
    expect(result2.current.showAuthGate).toBe(true);
  });

  it('ready + no gate once a principal resolves', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, PRINCIPAL]]));
    const { result } = renderHook(() => useSessionGate({ path: '/dash' }), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.showAuthGate).toBe(false);
    expect(hrefSpy).not.toHaveBeenCalled();
  });

  it('loginURL preserves the current path', async () => {
    vi.stubGlobal('fetch', mockFetch([[401, {}]]));
    const { result } = renderHook(() => useSessionGate({ path: '/billing', loginPath: '/signin' }), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.loginURL).toBe('/signin?return_to=%2Fbilling');
  });
});
