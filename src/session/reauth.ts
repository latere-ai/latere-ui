// Expired-session recovery policy, decoupled from Pinia so it can be shared by
// `createSessionStore` and by apps that keep their own store (e.g. lux). It
// owns the sandbox-proven flow: a silent `prompt=none` re-check once (guarded
// by a namespaced `sso_checked` sessionStorage flag so it can't loop), then a
// terminal interactive login. SSR-safe: every method no-ops without `window`.

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

export interface Reauth {
  /** Silent prompt=none once, then interactive login. No-op under `graceful`. */
  recoverSession(returnTo?: string): void;
  /**
   * Silent prompt=none once and nothing more — for component gates that render
   * their own sign-in prompt on the bounce-back. No-op under `graceful`.
   */
  attemptSilentReauth(returnTo?: string): void;
  /** Interactive login redirect, preserving intent. */
  login(returnTo?: string): void;
  /** Clear the sso_checked flag (call once a live session resolves). */
  clearRecheck(): void;
}

export function createReauth(opts: ReauthOptions = {}): Reauth {
  const loginPath = opts.loginPath ?? '/login';
  const defaultReturnTo = opts.defaultReturnTo ?? '/';
  const mode = opts.mode ?? 'silent-recheck';
  const RECHECK_KEY = `latere.sso_checked.${opts.storeId ?? 'session'}`;

  const hasWindow = () => typeof window !== 'undefined';
  const recheckDone = () =>
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem(RECHECK_KEY) === '1';
  const markRecheck = () => {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(RECHECK_KEY, '1');
  };
  const clearRecheck = () => {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(RECHECK_KEY);
  };

  // One-shot guard so a burst of 401s triggers a single navigation.
  let navigating = false;

  function currentPath(): string {
    if (!hasWindow()) return defaultReturnTo;
    return window.location.pathname + window.location.search;
  }

  function attemptSilentReauth(returnTo: string = currentPath()) {
    if (mode === 'graceful') return;
    if (!hasWindow() || navigating) return;
    if (window.location.pathname === loginPath) return;
    if (recheckDone()) return;
    markRecheck();
    navigating = true;
    window.location.href = `${loginPath}?prompt=none&return_to=` + encodeURIComponent(returnTo);
  }

  function login(returnTo: string = defaultReturnTo) {
    if (!hasWindow() || navigating) return;
    navigating = true;
    window.location.href = `${loginPath}?return_to=` + encodeURIComponent(returnTo);
  }

  function recoverSession(returnTo: string = currentPath()) {
    if (mode === 'graceful') return;
    if (!recheckDone()) attemptSilentReauth(returnTo);
    else login(returnTo);
  }

  return { recoverSession, attemptSilentReauth, login, clearRecheck };
}
