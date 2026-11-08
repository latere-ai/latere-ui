// Expired-session recovery policy, kept apart from the React bindings so it is
// shared by `SessionProvider` and by apps that keep their own store. It owns
// the flow: a silent `prompt=none` re-check once, then one interactive login,
// then it stops and reports `'exhausted'`. Each step leaves a timestamped
// flag in sessionStorage under a namespaced key. A flag set within the last
// minute survives a successful `/me`, so a backend that answers `/me` with a
// session but another call with 401 cannot send the page around the same
// round trip again. SSR-safe: every method no-ops without `window`.

import type { ExpiredSessionMode } from './types';

export interface ReauthOptions {
  /** Server login entry point. Default `'/login'`. */
  loginPath?: string;
  /** Where an interactive login should return to by default. Default `'/'`. */
  defaultReturnTo?: string;
  /** `'silent-recheck'` (dashboards) or `'graceful'` (marketing). Default silent. */
  mode?: ExpiredSessionMode;
  /** Namespaces the sso_checked flag so co-hosted apps don't collide. Default `'session'`. */
  storeId?: string;
}

/**
 * What `recoverSession` did: started the `'silent'` check or the interactive
 * `'login'`, did nothing (`'skipped'`: `graceful` mode, no `window`, or a
 * navigation already under way), or found both steps used up recently
 * (`'exhausted'`) so the caller should surface that the session is lost.
 */
export type RecoverResult = 'silent' | 'login' | 'skipped' | 'exhausted';

export interface Reauth {
  /**
   * Silent prompt=none once, then one interactive login, then `'exhausted'`.
   * `'skipped'` under `graceful`.
   */
  recoverSession(returnTo?: string): RecoverResult;
  /**
   * Silent prompt=none once and nothing more: for component gates that render
   * their own sign-in prompt on the bounce-back. No-op under `graceful`.
   */
  attemptSilentReauth(returnTo?: string): void;
  /** Interactive login redirect, preserving intent. */
  login(returnTo?: string): void;
  /** Clear the re-check flags (sign-out). */
  clearRecheck(): void;
  /**
   * Clear the re-check flags once they are older than a minute (call when a
   * live session resolves). A flag set by a round trip that just returned
   * stays, so that round trip is not repeated.
   */
  clearStaleRecheck(): void;
}

/** How long a re-check flag counts as belonging to the round trip that just returned. */
const FRESH_MS = 60_000;

export function createReauth(opts: ReauthOptions = {}): Reauth {
  const loginPath = opts.loginPath ?? '/login';
  const defaultReturnTo = opts.defaultReturnTo ?? '/';
  const mode = opts.mode ?? 'silent-recheck';
  const RECHECK_KEY = `latere.sso_checked.${opts.storeId ?? 'session'}`;

  const hasWindow = () => typeof window !== 'undefined';
  const LOGIN_KEY = `latere.sso_login.${opts.storeId ?? 'session'}`;

  // sessionStorage can be missing or throw (a sandboxed frame, a browser that
  // blocks site data). Without a flag store the silent check could not be
  // limited to once, so unavailable storage counts as "silent check already
  // done". The interactive login cannot be limited either, so it stays
  // available. Writes are best effort for the same reason.
  const read = (key: string): string | null | undefined => {
    try {
      return typeof sessionStorage === 'undefined' ? undefined : sessionStorage.getItem(key);
    } catch {
      return undefined;
    }
  };
  const write = (key: string) => {
    try {
      sessionStorage.setItem(key, String(Date.now()));
    } catch {
      // Unavailable storage: see read.
    }
  };
  const remove = (key: string) => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Unavailable storage: nothing was stored to clear.
    }
  };
  const recheckDone = () => {
    const v = read(RECHECK_KEY);
    return v !== null;
  };
  const loginDone = () => {
    const v = read(LOGIN_KEY);
    return v !== undefined && v !== null;
  };
  const markRecheck = () => write(RECHECK_KEY);
  const clearRecheck = () => {
    remove(RECHECK_KEY);
    remove(LOGIN_KEY);
  };
  // A flag that is not a recent timestamp (including the bare '1' older
  // versions wrote) is stale.
  const clearStale = (key: string) => {
    const v = read(key);
    if (v === undefined || v === null) return;
    const at = Number(v);
    if (!(Date.now() - at < FRESH_MS)) remove(key);
  };
  const clearStaleRecheck = () => {
    clearStale(RECHECK_KEY);
    clearStale(LOGIN_KEY);
  };

  // One-shot guard so a burst of 401s triggers a single navigation.
  let navigating = false;
  // A page restored from the back/forward cache keeps this state although the
  // navigation it guarded was left; a restored page may navigate again.
  if (hasWindow()) {
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) navigating = false;
    });
  }

  function currentPath(): string {
    if (!hasWindow()) return defaultReturnTo;
    return window.location.pathname + window.location.search;
  }

  // Reports whether it started the navigation.
  function attemptSilentReauth(returnTo: string = currentPath()): boolean {
    if (mode === 'graceful') return false;
    if (!hasWindow() || navigating) return false;
    if (window.location.pathname === loginPath) return false;
    if (recheckDone()) return false;
    markRecheck();
    navigating = true;
    window.location.href = `${loginPath}?prompt=none&return_to=` + encodeURIComponent(returnTo);
    return true;
  }

  function login(returnTo: string = defaultReturnTo) {
    if (!hasWindow() || navigating) return;
    navigating = true;
    window.location.href = `${loginPath}?return_to=` + encodeURIComponent(returnTo);
  }

  function recoverSession(returnTo: string = currentPath()): RecoverResult {
    if (mode === 'graceful' || !hasWindow() || navigating) return 'skipped';
    if (!recheckDone()) return attemptSilentReauth(returnTo) ? 'silent' : 'skipped';
    if (loginDone()) return 'exhausted';
    write(LOGIN_KEY);
    login(returnTo);
    return 'login';
  }

  return {
    recoverSession,
    attemptSilentReauth: (returnTo) => {
      attemptSilentReauth(returnTo);
    },
    login,
    clearRecheck,
    clearStaleRecheck,
  };
}
