// Pinia store factory shared by every Latere SPA. Holds the resolved
// principal and the login/logout/switch-org actions. The expired-session
// policy (silent prompt=none re-check, then interactive login; or graceful)
// is delegated to `createReauth` so the store and apps that keep their own
// store share one implementation.
//
// SSR-safe: every action that touches `window`/`document`/`sessionStorage`
// is a no-op when those globals are absent, so vite-ssg builds don't crash.

import { defineStore } from 'pinia';
import { ref } from 'vue';

import { createReauth } from './reauth';
import { ApiError, type Principal, type SessionStoreOptions } from './types';

const hasWindow = () => typeof window !== 'undefined';

export function createSessionStore<Raw = Principal>(opts: SessionStoreOptions<Raw>) {
  const {
    client,
    storeId = 'session',
    meEndpoint = '/api/me',
    switchOrgEndpoint = '/api/me/switch-org',
    defaultReturnTo = '/',
    loginPath = '/login',
    logoutPath = '/logout',
    mapMe = (raw: Raw) => raw as unknown as Principal,
    expiredSessionMode = 'silent-recheck',
    switchOrgMode = 'follow-redirect',
  } = opts;

  const reauth = createReauth({ loginPath, defaultReturnTo, mode: expiredSessionMode, storeId });

  return defineStore(storeId, () => {
    const me = ref<Principal | null>(null);
    const loaded = ref(false);
    const error = ref<string | null>(null);

    async function fetchMe() {
      if (!hasWindow()) {
        loaded.value = true;
        return;
      }
      try {
        const raw = await client.api<Raw>('GET', meEndpoint, undefined, {
          allowUnauthenticated: true,
        });
        me.value = mapMe(raw);
        error.value = null;
        reauth.clearRecheck(); // a live session invalidates any prior silent-recheck
      } catch (e) {
        // 401 (no session) and 404 (endpoint not deployed) both mean
        // "logged out" — never surface them as an error.
        if (e instanceof ApiError && (e.status === 401 || e.status === 404)) {
          me.value = null;
        } else {
          error.value = (e as Error).message;
        }
      } finally {
        loaded.value = true;
      }
    }

    // Component route-gate entry point (used by `useSessionGate`, for apps that
    // render their own sign-in prompt): resolve the session; if absent on a
    // dashboard, kick off the silent re-check once. On the bounce-back it does
    // nothing further, leaving the caller's `showAuthGate` to render a prompt.
    async function ensureSession(returnTo: string): Promise<boolean> {
      if (!loaded.value) await fetchMe();
      if (me.value) return true;
      // Silent-only: the caller's showAuthGate renders the prompt on bounce-back.
      reauth.attemptSilentReauth(returnTo);
      return false;
    }

    // Router-guard entry point (for apps with no gate UI, e.g. lectio): try the
    // silent auto-login once; once spent, fall back to an interactive login so
    // a directly-loaded protected URL always lands somewhere usable.
    function requireSession(returnTo: string) {
      reauth.recoverSession(returnTo);
    }

    // Called by the client's global 401 seam when an authenticated request
    // fails mid-session. This is the fix for "expired session not rejected":
    // silent re-auth once, then an interactive login. Terminal, never a loop.
    function handleExpired(path?: string) {
      me.value = null;
      reauth.recoverSession(path);
    }

    function login(returnTo: string = defaultReturnTo) {
      reauth.login(returnTo);
    }

    function logout() {
      if (!hasWindow()) return;
      reauth.clearRecheck();
      window.location.href = logoutPath;
    }

    // Switch active org: POST then follow the server round-trip so the next
    // session's token carries the chosen org_id.
    async function switchOrg(orgID: string) {
      if (!hasWindow()) return;
      const bounce = () => {
        window.location.href =
          `${loginPath}?return_to=` +
          encodeURIComponent(defaultReturnTo) +
          '&org_id=' +
          encodeURIComponent(orgID);
      };
      try {
        const res = await client.api<{ redirect?: string }>('POST', switchOrgEndpoint, {
          org_id: orgID,
        });
        if (switchOrgMode === 'login-bounce') bounce();
        else window.location.href = res?.redirect || defaultReturnTo;
      } catch {
        // Endpoint missing/failed — fall back to a login bounce carrying the
        // org choice, matching sandbox's behavior.
        bounce();
      }
    }

    return {
      me,
      loaded,
      error,
      fetchMe,
      ensureSession,
      requireSession,
      handleExpired,
      login,
      logout,
      switchOrg,
    };
  });
}
