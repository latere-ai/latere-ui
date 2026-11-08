// SessionProvider, useSession and useSessionGate over the framework-free
// session core: the expired-session recovery (silent prompt=none re-check
// once, then an interactive login), the logged-out carve-out, the org-switch
// redirect modes and the route gate's sso_checked round-trip.
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { Activity, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Principal } from '../../session/types';
import { SessionProvider, useSession, useSessionGate } from '../session';

function routeFetch(routes: Record<string, () => [number, unknown]>) {
  return vi.fn(async (path: string) => {
    const route = routes[path];
    if (!route) throw new Error(`unexpected request ${path}`);
    const [status, body] = route();
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: 'x',
      text: async () => JSON.stringify(body),
    } as Response;
  });
}

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
  const loc = { pathname, search, href: '', origin: 'http://localhost' } as unknown as Location;
  Object.defineProperty(loc, 'href', { get: () => 'http://localhost/', set });
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

  // StrictMode in development, as under `vite dev`, runs every effect's
  // cleanup and then its setup again on the same instance before the first
  // `/me` answer arrives. Activity does the same when hidden and shown, and
  // does it in a test, where StrictMode's second pass does not run.
  it('resolves after its effects are cleaned up and set up again, as StrictMode does', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, PRINCIPAL]]));
    function Probe({ seen }: { seen: (v: { ready: boolean; id?: string }) => void }) {
      const { principal } = useSession();
      const gate = useSessionGate({ path: '/console' });
      seen({ ready: gate.ready, id: principal?.principal_id });
      return null;
    }
    let last: { ready: boolean; id?: string } = { ready: false };
    const seen = (v: typeof last) => {
      last = v;
    };
    const tree = (mode: 'visible' | 'hidden') => (
      <Activity mode={mode}>
        <SessionProvider>
          <Probe seen={seen} />
        </SessionProvider>
      </Activity>
    );
    const view = render(tree('visible'));
    view.rerender(tree('hidden'));
    view.rerender(tree('visible'));
    await waitFor(() => expect(last).toEqual({ ready: true, id: 'p1' }));
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

  it('graceful mode: a mid-session 401 clears the principal but does not navigate', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch([
        [200, PRINCIPAL],
        [401, { message: 'no session' }],
      ]),
    );
    const { result } = renderHook(() => useSession(), { wrapper: wrapper({ expiredSessionMode: 'graceful' }) });
    await waitFor(() => expect(result.current.principal).not.toBeNull());

    await act(async () => {
      await expect(result.current.client.api('GET', '/api/jobs')).rejects.toMatchObject({ status: 401 });
    });

    expect(result.current.principal).toBeNull();
    expect(hrefSpy).not.toHaveBeenCalled();
  });

  it('a logged-out visitor whose /me probe returns 401 is not redirected', async () => {
    vi.stubGlobal('fetch', mockFetch([[401, { error: 'unauthorized' }]]));
    const { result } = renderHook(() => useSession(), { wrapper: wrapper({ expiredSessionMode: 'silent-recheck' }) });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.principal).toBeNull();
    expect(hrefSpy).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('latere.sso_checked.session')).toBeNull();
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

  it('switchOrg in login-bounce mode builds a login URL with the org', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch([
        [200, PRINCIPAL],
        [200, {}],
      ]),
    );
    const { result } = renderHook(() => useSession(), {
      wrapper: wrapper({ switchOrgMode: 'login-bounce', defaultReturnTo: '/dashboard' }),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.switchOrg('o1');
    });
    expect(hrefSpy).toHaveBeenCalledWith('/login?return_to=' + encodeURIComponent('/dashboard') + '&org_id=o1');
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
    expect(Number(sessionStorage.getItem('latere.sso_checked.auth'))).toBeGreaterThan(0);
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

  it('waits for the current path before opening the gate or stripping its marker', async () => {
    // The silent re-check already ran this tab, so neither check navigates.
    sessionStorage.setItem('latere.sso_checked.session', '1');
    stubLocation('/second', '?sso_checked=1&tab=files');
    const pending: Array<(response: Response) => void> = [];
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { pending.push(resolve); })));
    const unauthorized = { ok: false, status: 401, statusText: 'x', text: async () => '{}' } as Response;
    const strip = vi.fn();

    const { result, rerender } = renderHook(
      ({ path }) => useSessionGate({ path, stripSsoChecked: strip }),
      { wrapper: wrapper(), initialProps: { path: '/first' } },
    );
    // The provider's bootstrap and the gate's check share one request.
    await waitFor(() => expect(pending).toHaveLength(1));
    rerender({ path: '/second' });
    await act(async () => { await Promise.resolve(); });
    expect(pending).toHaveLength(1);
    expect(result.current.ready).toBe(false);

    // The check started for the first path is canceled by the path change;
    // only the second path's check strips the marker.
    await act(async () => { pending[0](unauthorized); });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(strip).toHaveBeenCalledExactlyOnceWith('/second?tab=files');
    expect(result.current.showAuthGate).toBe(true);
    expect(hrefSpy).not.toHaveBeenCalled();
  });

  it('does not strip the marker when an unmounted gate finishes checking', async () => {
    sessionStorage.setItem('latere.sso_checked.session', '1');
    stubLocation('/old', '?sso_checked=1');
    const pending: Array<(response: Response) => void> = [];
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { pending.push(resolve); })));
    const strip = vi.fn();
    const { unmount } = renderHook(() => useSessionGate({ path: '/old', stripSsoChecked: strip }), { wrapper: wrapper() });
    await waitFor(() => expect(pending.length).toBeGreaterThan(0));
    unmount();
    await act(async () => {
      for (const resolve of pending) resolve({ ok: false, status: 401, statusText: 'x', text: async () => '{}' } as Response);
    });
    expect(strip).not.toHaveBeenCalled();
    expect(hrefSpy).not.toHaveBeenCalled();
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

describe('SessionProvider with sessionStorage unavailable', () => {
  function blockStorage() {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    vi.stubGlobal('sessionStorage', { getItem: blocked, setItem: blocked, removeItem: blocked, clear: blocked });
  }

  it('settles the gate and shows the sign-in prompt for a signed-out visitor', async () => {
    blockStorage();
    vi.stubGlobal('fetch', mockFetch([[401, {}]]));
    const { result } = renderHook(() => useSessionGate({ path: '/overview' }), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.showAuthGate).toBe(true);
    expect(hrefSpy).not.toHaveBeenCalled();
  });

  it('reports no error once a signed-in principal resolves', async () => {
    blockStorage();
    vi.stubGlobal('fetch', mockFetch([[200, PRINCIPAL]]));
    const { result } = renderHook(() => useSession(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.principal?.principal_id).toBe('p1');
    expect(result.current.error).toBeNull();
  });

  it('settles the gate and logs when the session check itself throws', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', mockFetch([[401, {}]]));
    // The silent re-check navigates; a location that refuses the assignment
    // makes ensureSession reject.
    const loc = window.location as { href: string };
    Object.defineProperty(loc, 'href', {
      get: () => 'http://localhost/',
      set: () => {
        throw new Error('navigation refused');
      },
    });
    const { result } = renderHook(() => useSessionGate({ path: '/overview' }), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(logged).toHaveBeenCalledWith('useSessionGate: the session check failed', expect.any(Error));
  });
});

describe('SessionProvider re-check when /me succeeds but another call answers 401', () => {
  it('runs the silent check once, then one sign-in, then reports the lost session', async () => {
    vi.stubGlobal(
      'fetch',
      routeFetch({ '/api/me': () => [200, PRINCIPAL], '/v1/jobs': () => [401, { error: 'unauthorized' }] }),
    );
    const load = async () => {
      const view = renderHook(() => useSession(), { wrapper: wrapper() });
      await waitFor(() => expect(view.result.current.principal).not.toBeNull());
      await act(async () => {
        await view.result.current.client.api('GET', '/v1/jobs').catch(() => {});
      });
      return view;
    };

    (await load()).unmount();
    expect(hrefSpy).toHaveBeenCalledTimes(1);
    expect(String(hrefSpy.mock.calls[0][0])).toContain('prompt=none');

    // The silent check returned to the page, which loads again.
    (await load()).unmount();
    expect(hrefSpy).toHaveBeenCalledTimes(2);
    expect(String(hrefSpy.mock.calls[1][0])).not.toContain('prompt=none');

    // The sign-in returned too and the call still answers 401: stop.
    const third = await load();
    expect(hrefSpy).toHaveBeenCalledTimes(2);
    expect(third.result.current.error).toBe(
      'Your session could not be restored. Reload the page or sign in again.',
    );
  });

  it('allows a new silent check after a /me success once the flags are older than a minute', async () => {
    sessionStorage.setItem('latere.sso_checked.session', String(Date.now() - 120_000));
    vi.stubGlobal('fetch', mockFetch([[200, PRINCIPAL]]));
    const { result } = renderHook(() => useSession(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.principal).not.toBeNull());
    expect(sessionStorage.getItem('latere.sso_checked.session')).toBeNull();
  });
});

describe('SessionProvider /me request ordering', () => {
  const answer = (status: number, body: unknown) =>
    ({ ok: status < 400, status, statusText: 'x', text: async () => JSON.stringify(body) }) as Response;

  function pendingFetch() {
    const pending: Array<(r: Response) => void> = [];
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { pending.push(resolve); }));
    vi.stubGlobal('fetch', fetchMock);
    return pending;
  }

  it('keeps the answer of the latest refresh() when an earlier one arrives last', async () => {
    const pending = pendingFetch();
    const { result } = renderHook(() => useSession(), { wrapper: wrapper() });
    await waitFor(() => expect(pending).toHaveLength(1));
    await act(async () => { pending[0](answer(200, PRINCIPAL)); });
    await waitFor(() => expect(result.current.principal?.principal_id).toBe('p1'));

    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => { first = result.current.refresh(); });
    act(() => { second = result.current.refresh(); });
    await waitFor(() => expect(pending).toHaveLength(3));
    // The later request sees the ended session; the earlier one, answered
    // afterwards, still carries the old account.
    await act(async () => { pending[2](answer(401, {})); await second; });
    await act(async () => { pending[1](answer(200, PRINCIPAL)); await first; });

    expect(result.current.principal).toBeNull();
  });

  it('resolves an older refresh() only after the newest request has settled', async () => {
    const pending = pendingFetch();
    const { result } = renderHook(() => useSession(), { wrapper: wrapper() });
    await waitFor(() => expect(pending).toHaveLength(1));
    await act(async () => { pending[0](answer(401, {})); });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let firstDone = false;
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => { first = result.current.refresh().then(() => { firstDone = true; }); });
    act(() => { second = result.current.refresh(); });
    await act(async () => { pending[1](answer(200, PRINCIPAL)); await Promise.resolve(); });
    expect(result.current.principal).toBeNull();
    expect(firstDone).toBe(false);
    await act(async () => { pending[2](answer(200, { ...PRINCIPAL, principal_id: 'p2' })); await first; await second; });
    expect(result.current.principal?.principal_id).toBe('p2');
  });

  it('does not let a /me answer in flight restore a principal after a mid-session 401', async () => {
    const pending = pendingFetch();
    const { result } = renderHook(() => useSession(), {
      wrapper: wrapper({ expiredSessionMode: 'graceful' }),
    });
    await waitFor(() => expect(pending).toHaveLength(1));
    await act(async () => { pending[0](answer(200, PRINCIPAL)); });
    await waitFor(() => expect(result.current.principal).not.toBeNull());

    let refreshed!: Promise<void>;
    act(() => { refreshed = result.current.refresh(); });
    await waitFor(() => expect(pending).toHaveLength(2));
    let call!: Promise<unknown>;
    act(() => { call = result.current.client.api('GET', '/v1/jobs').catch(() => {}); });
    await act(async () => { pending[2](answer(401, {})); await call; });
    expect(result.current.principal).toBeNull();

    await act(async () => { pending[1](answer(200, PRINCIPAL)); await refreshed; });
    expect(result.current.principal).toBeNull();
  });

  it('settles loading when a 401 arrives while the first /me is still open', async () => {
    const pending = pendingFetch();
    const { result } = renderHook(() => useSession(), {
      wrapper: wrapper({ expiredSessionMode: 'graceful' }),
    });
    await waitFor(() => expect(pending).toHaveLength(1));
    let call!: Promise<unknown>;
    act(() => { call = result.current.client.api('GET', '/v1/jobs').catch(() => {}); });
    await act(async () => { pending[1](answer(401, {})); await call; });
    expect(result.current.loading).toBe(false);
    await act(async () => { pending[0](answer(200, PRINCIPAL)); });
    expect(result.current.principal).toBeNull();
  });

  it('sends one /me request for the provider and a gate below it', async () => {
    const pending = pendingFetch();
    const { result } = renderHook(() => useSessionGate({ path: '/overview' }), { wrapper: wrapper() });
    await waitFor(() => expect(pending).toHaveLength(1));
    await act(async () => { pending[0](answer(200, PRINCIPAL)); });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(pending).toHaveLength(1);
    expect(result.current.showAuthGate).toBe(false);
  });
});

describe('useSessionGate login path', () => {
  it('builds loginURL from the SessionProvider loginPath', async () => {
    sessionStorage.setItem('latere.sso_checked.session', '1');
    vi.stubGlobal('fetch', mockFetch([[401, {}]]));
    const { result } = renderHook(() => useSessionGate({ path: '/billing' }), {
      wrapper: wrapper({ loginPath: '/auth/login' }),
    });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.loginURL).toBe('/auth/login?return_to=%2Fbilling');
  });

  it('prefers the loginPath option over the provider', async () => {
    sessionStorage.setItem('latere.sso_checked.session', '1');
    vi.stubGlobal('fetch', mockFetch([[401, {}]]));
    const { result } = renderHook(() => useSessionGate({ path: '/billing', loginPath: '/sso' }), {
      wrapper: wrapper({ loginPath: '/auth/login' }),
    });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.loginURL).toBe('/sso?return_to=%2Fbilling');
  });
});
