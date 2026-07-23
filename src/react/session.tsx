// React session bindings over the framework-agnostic core (session/client.ts,
// me.ts, reauth.ts, frontChannel.ts, types.ts — none of which import vue).
// `SessionProvider` is the React-context counterpart of the Pinia store
// factory (`createSessionStore`); `useSessionGate` is the counterpart of
// `session/gate.ts`, adapted to be router-agnostic (no vue-router dependency
// to mirror — hosts pass their own router's path/replace when they have one).
// Nothing in this file imports `vue` or `pinia`.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { createApiClient } from '../session/client';
import { runFrontChannelLogout, type FrontChannelLogoutOptions } from '../session/frontChannel';
import { me as coreMe, switchOrg as coreSwitchOrg } from '../session/me';
import { createReauth } from '../session/reauth';
import type {
  ApiClient,
  ExpiredSessionMode,
  Principal,
  SwitchOrgMode,
} from '../session/types';

const hasWindow = () => typeof window !== 'undefined';

export interface SessionProviderProps<Raw = Principal> {
  /** A pre-built API client. When omitted, one is created from `csrfCookie`. */
  client?: ApiClient;
  /** Name of the readable CSRF cookie (double-submit). Ignored when `client` is passed. */
  csrfCookie?: string;
  /** Endpoint returning the principal. Default `'/api/me'`. */
  meEndpoint?: string;
  /** Org-switch endpoint. Default `'/api/me/switch-org'`. */
  switchOrgEndpoint?: string;
  /** Where to land after an interactive login. Default `'/'`. */
  defaultReturnTo?: string;
  /** Server login entry point. Default `'/login'`. */
  loginPath?: string;
  /** Server logout entry point. Default `'/logout'`. */
  logoutPath?: string;
  /** Adapt a backend-specific shape into `Principal`. Default: identity. */
  mapMe?: (raw: Raw) => Principal;
  /**
   * Dashboards default to `'silent-recheck'` (the `prompt=none` auto-login
   * probe); marketing sites pass `'graceful'`.
   */
  expiredSessionMode?: ExpiredSessionMode;
  /** `'follow-redirect'` uses the POST's `{redirect}`; `'login-bounce'` builds a URL. */
  switchOrgMode?: SwitchOrgMode;
  /** Namespaces the `sso_checked` recheck flag so co-hosted apps don't collide. */
  storeId?: string;
  children?: ReactNode;
}

export interface SessionContextValue {
  /** The shared API client — reuse it for app-specific calls. */
  client: ApiClient;
  /** The resolved principal, or `null` when logged out. */
  principal: Principal | null;
  /** True until the first `/me` resolution settles. */
  loading: boolean;
  /** Message from the last failed `refresh()` (a non-401/404 error). */
  error: string | null;
  /** Re-resolve `/me`. Idempotent — safe to call repeatedly. */
  refresh: () => Promise<void>;
  /**
   * Component route-gate entry point (used by `useSessionGate`): resolve the
   * session; if absent, kick off the one-time silent re-check and resolve
   * `false`. Never loops — the caller renders its own sign-in prompt.
   */
  ensureSession: (returnTo: string) => Promise<boolean>;
  /**
   * Router-guard entry point (no gate UI): silent auto-login once, then an
   * interactive login so a directly-loaded protected URL always resolves.
   */
  requireSession: (returnTo?: string) => void;
  /** Interactive login redirect, preserving intent. */
  login: (returnTo?: string) => void;
  /** Clear the local session and navigate to `logoutPath`. */
  logout: () => void;
  /** RFC 6749-style front-channel logout: notify each RP iframe, then navigate. */
  frontChannelLogout: (opts?: Omit<FrontChannelLogoutOptions, 'client'>) => Promise<void>;
  /** Switch the active org (`''` = personal) and follow the server round-trip. */
  switchOrg: (orgId: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Owns the session state machine (loading → authenticated/anonymous) over the
 * vanilla core. Resolves `/me` once on mount, same as the Vue store's
 * bootstrap. Wrap the app (or the console shell) in this once; `useSession()`
 * and `useSessionGate()` read from it via context.
 */
export function SessionProvider<Raw = Principal>({
  client: clientProp,
  csrfCookie,
  meEndpoint = '/api/me',
  switchOrgEndpoint = '/api/me/switch-org',
  defaultReturnTo = '/',
  loginPath = '/login',
  logoutPath = '/logout',
  mapMe,
  expiredSessionMode = 'silent-recheck',
  switchOrgMode = 'follow-redirect',
  storeId = 'session',
  children,
}: SessionProviderProps<Raw>) {
  const client = useMemo(
    () => clientProp ?? createApiClient({ csrfCookie }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- constructed once per mounted provider, like the Pinia store's client.
    [],
  );

  const reauth = useMemo(
    () => createReauth({ loginPath, defaultReturnTo, mode: expiredSessionMode, storeId }),
    [loginPath, defaultReturnTo, expiredSessionMode, storeId],
  );

  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronous mirrors of the state above: ensureSession/handleExpired need
  // to read the just-resolved value immediately after `await fetchMe()`,
  // before React has committed the corresponding state update.
  const principalRef = useRef<Principal | null>(null);
  const loadedRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  const mapMeRef = useRef(mapMe);
  mapMeRef.current = mapMe;

  const fetchMe = useCallback(async () => {
    if (!hasWindow()) {
      loadedRef.current = true;
      setLoaded(true);
      return;
    }
    try {
      const p = await coreMe<Raw>(client, { endpoint: meEndpoint, mapMe: mapMeRef.current });
      principalRef.current = p;
      if (!mountedRef.current) return;
      setPrincipal(p);
      if (p) {
        setError(null);
        reauth.clearRecheck();
      }
    } catch (e) {
      if (!mountedRef.current) return;
      setError((e as Error).message);
    } finally {
      loadedRef.current = true;
      if (mountedRef.current) setLoaded(true);
    }
  }, [client, meEndpoint, reauth]);

  const ensureSession = useCallback(
    async (returnTo: string): Promise<boolean> => {
      if (!loadedRef.current) await fetchMe();
      if (principalRef.current) return true;
      // Silent-only: the caller's showAuthGate renders the prompt on bounce-back.
      reauth.attemptSilentReauth(returnTo);
      return false;
    },
    [fetchMe, reauth],
  );

  const requireSession = useCallback(
    (returnTo?: string) => {
      reauth.recoverSession(returnTo);
    },
    [reauth],
  );

  const handleExpired = useCallback(() => {
    principalRef.current = null;
    setPrincipal(null);
    // No argument: recoverSession defaults to the page the user is on. The
    // failing request's URL is not a destination a user can be returned to.
    reauth.recoverSession();
  }, [reauth]);

  // Global 401 seam: an authenticated request failing mid-session runs the
  // same recovery (silent re-auth once, then interactive login) as the store.
  useEffect(() => {
    const onUnauthorized = () => handleExpired();
    client.onUnauthorized = onUnauthorized;
    return () => {
      if (client.onUnauthorized === onUnauthorized) client.onUnauthorized = undefined;
    };
  }, [client, handleExpired]);

  const login = useCallback(
    (returnTo: string = defaultReturnTo) => {
      reauth.login(returnTo);
    },
    [reauth, defaultReturnTo],
  );

  const logout = useCallback(() => {
    if (!hasWindow()) return;
    reauth.clearRecheck();
    window.location.href = logoutPath;
  }, [reauth, logoutPath]);

  const frontChannelLogout = useCallback(
    (opts?: Omit<FrontChannelLogoutOptions, 'client'>) => runFrontChannelLogout({ client, ...opts }),
    [client],
  );

  const switchOrg = useCallback(
    (orgId: string) =>
      coreSwitchOrg(client, orgId, {
        endpoint: switchOrgEndpoint,
        mode: switchOrgMode,
        loginPath,
        defaultReturnTo,
      }),
    [client, switchOrgEndpoint, switchOrgMode, loginPath, defaultReturnTo],
  );

  // Bootstrap: resolve `/me` once, mirroring the store's mount-time fetch.
  useEffect(() => {
    void fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally once per provider instance.
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      client,
      principal,
      loading: !loaded,
      error,
      refresh: fetchMe,
      ensureSession,
      requireSession,
      login,
      logout,
      frontChannelLogout,
      switchOrg,
    }),
    [
      client,
      principal,
      loaded,
      error,
      fetchMe,
      ensureSession,
      requireSession,
      login,
      logout,
      frontChannelLogout,
      switchOrg,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** Read the session state + actions. Must be called under `<SessionProvider>`. */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession() must be called within a <SessionProvider>.');
  return ctx;
}

/**
 * Like `useSession()`, but returns `null` instead of throwing when there is
 * no ancestor `<SessionProvider>`. Used by components (e.g. `AccountMenu`)
 * that work standalone with explicit props but opportunistically wire
 * themselves up when a provider is present.
 */
export function useOptionalSession(): SessionContextValue | null {
  return useContext(SessionContext);
}

export interface UseSessionGateOptions {
  /**
   * Path used to compute `return_to` and to re-run the gate check when it
   * changes (pass your router's current path for per-navigation re-checks).
   * Defaults to `window.location.pathname + search`, checked once on mount.
   */
  path?: string;
  /** Full path including query, for `return_to`. Defaults to `path`. */
  fullPath?: string;
  /** Server login entry point. Default `'/login'`. */
  loginPath?: string;
  /**
   * Strip the `sso_checked` marker from the URL after a silent round-trip
   * that came back still logged out. Default: `history.replaceState`. Pass
   * your router's `replace` to keep client-side routing state in sync.
   */
  stripSsoChecked?: (path: string) => void;
}

export interface UseSessionGate {
  /** True once the session check has settled (authed or gated). */
  ready: boolean;
  /** True when confirmed logged out and a sign-in prompt is due. */
  showAuthGate: boolean;
  /** Interactive login URL preserving the current path. */
  loginURL: string;
}

function currentPath(): string {
  if (!hasWindow()) return '/';
  return window.location.pathname + window.location.search;
}

function defaultStripSsoChecked(path: string): void {
  if (!hasWindow()) return;
  window.history.replaceState(null, '', path);
}

/**
 * Route gate for protected views: resolve the session on entry (and whenever
 * `opts.path` changes); when absent, the provider's silent `prompt=none`
 * re-check runs. On the bounce-back (`?sso_checked` in the URL) it strips the
 * marker and exposes `showAuthGate` so the view can render a sign-in prompt.
 * The React port of `session/gate.ts`, adapted to be router-agnostic.
 */
export function useSessionGate(opts: UseSessionGateOptions = {}): UseSessionGate {
  const { principal, loading, ensureSession } = useSession();
  const loginPath = opts.loginPath ?? '/login';
  const path = opts.path ?? currentPath();
  const fullPath = opts.fullPath ?? path;
  const stripSsoChecked = opts.stripSsoChecked ?? defaultStripSsoChecked;

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setChecked(false);
    void (async () => {
      const authed = await ensureSession(fullPath || path);
      if (cancelled) return;
      if (!authed && hasWindow()) {
        const params = new URLSearchParams(window.location.search);
        if (params.has('sso_checked')) {
          params.delete('sso_checked');
          const qs = params.toString();
          stripSsoChecked(window.location.pathname + (qs ? `?${qs}` : ''));
        }
      }
      setChecked(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stripSsoChecked/ensureSession are stable per provider; path/fullPath drive reruns.
  }, [path, fullPath]);

  const ready = checked && !loading;
  const showAuthGate = ready && !principal;
  const loginURL = `${loginPath}?return_to=` + encodeURIComponent(fullPath || path || '/');

  return { ready, showAuthGate, loginURL };
}
