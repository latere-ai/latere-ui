// Framework-agnostic async core for the session client. Pure functions that
// take an `ApiClient` (and optional per-call config) and resolve to the same
// values the Pinia store actions surface. Useful for non-Vue harnesses (the
// wallfacer desktop SPA's vanilla JS, future React adapters) and for the
// store/useSession reimplementation here that delegates to them.
//
// SSR-safe: navigation helpers (`login`, `logout`, switch flows) are no-ops
// when `window` is undefined, mirroring the store actions.

import { ApiError, type ApiClient, type OrgEntry, type Principal } from './types';

const hasWindow = () => typeof window !== 'undefined';

export interface MeOptions<Raw = Principal> {
  /** Endpoint returning the principal. Default `'/api/me'`. */
  endpoint?: string;
  /** Adapt a backend-specific shape into `Principal`. Default: identity. */
  mapMe?: (raw: Raw) => Principal;
}

/**
 * Fetch the current principal. Returns `null` on 401 / 404 (the two responses
 * that mean "logged out, but the endpoint is healthy"); throws `ApiError` for
 * any other non-2xx response so callers can surface the underlying problem.
 */
export async function me<Raw = Principal>(
  client: ApiClient,
  opts: MeOptions<Raw> = {},
): Promise<Principal | null> {
  const { endpoint = '/api/me', mapMe = (raw: Raw) => raw as unknown as Principal } = opts;
  try {
    const raw = await client.api<Raw>('GET', endpoint, undefined, { allowUnauthenticated: true });
    return mapMe(raw);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 404)) return null;
    throw e;
  }
}

export interface OrgsOptions {
  /** Endpoint returning the principal's orgs. Default `'/me/orgs'`. */
  endpoint?: string;
}

/** Fetch the principal's orgs. Throws on non-2xx (no implicit logged-out semantics). */
export async function orgs(client: ApiClient, opts: OrgsOptions = {}): Promise<OrgEntry[]> {
  const { endpoint = '/me/orgs' } = opts;
  return client.api<OrgEntry[]>('GET', endpoint);
}

/** How `switchOrg` navigates after POSTing the new org. */
export type SwitchOrgNavigation = 'follow-redirect' | 'login-bounce';

export interface SwitchOrgOptions {
  /** Endpoint accepting the switch. Default `'/api/me/switch-org'`. */
  endpoint?: string;
  /** `'follow-redirect'` uses the POST's `{redirect}`; `'login-bounce'` builds a URL. */
  mode?: SwitchOrgNavigation;
  /** Server login path used when bouncing. Default `'/login'`. */
  loginPath?: string;
  /** Where to land after switch. Default `'/'`. */
  defaultReturnTo?: string;
}

/**
 * POST a switch-org request and navigate to the resulting destination. Falls
 * back to a `loginPath?return_to=…&org_id=…` bounce when the endpoint is
 * missing or fails — same recovery the Pinia store has used since v1.0.
 * No-op when called outside a browser.
 */
export async function switchOrg(
  client: ApiClient,
  orgID: string,
  opts: SwitchOrgOptions = {},
): Promise<void> {
  if (!hasWindow()) return;
  const {
    endpoint = '/api/me/switch-org',
    mode = 'follow-redirect',
    loginPath = '/login',
    defaultReturnTo = '/',
  } = opts;
  const bounce = () => {
    window.location.href =
      `${loginPath}?return_to=` +
      encodeURIComponent(defaultReturnTo) +
      '&org_id=' +
      encodeURIComponent(orgID);
  };
  try {
    const res = await client.api<{ redirect?: string }>('POST', endpoint, { org_id: orgID });
    if (mode === 'login-bounce') bounce();
    else window.location.href = res?.redirect || defaultReturnTo;
  } catch {
    bounce();
  }
}

/** Alias of `switchOrg(client, '', opts)` for switching to the personal context. */
export async function switchPersonal(client: ApiClient, opts: SwitchOrgOptions = {}): Promise<void> {
  return switchOrg(client, '', opts);
}

export interface LogoutOptions {
  /** Server logout entry point. Default `'/logout'`. */
  logoutPath?: string;
  /** Pass `false` to suppress navigation (e.g. chain into `runFrontChannelLogout`). */
  redirect?: string | false;
}

/** Navigate to the logout path. No-op outside a browser. */
export function logout(opts: LogoutOptions = {}): void {
  if (!hasWindow()) return;
  const { logoutPath = '/logout', redirect } = opts;
  if (redirect === false) return;
  window.location.href = typeof redirect === 'string' && redirect ? redirect : logoutPath;
}

/** Navigate to the login path with an optional `return_to`. No-op outside a browser. */
export function login(loginPath: string = '/login', returnTo?: string): void {
  if (!hasWindow()) return;
  const url = returnTo ? `${loginPath}?return_to=${encodeURIComponent(returnTo)}` : loginPath;
  window.location.href = url;
}
