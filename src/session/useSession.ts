// The single, standard session bootstrap for every Latere SPA — call it once
// in App.vue and an app gets the whole flow for free: resolve `/me` on mount,
// run the one-time silent `prompt=none` SSO probe when logged out (so a live
// IdP session from another Latere app carries over), re-run on navigation for
// gated dashboards, and wire the global 401 seam. Apps stop hand-assembling
// createReauth + onMounted + the gate, which is how marketing sites kept
// silently shipping without cross-app SSO (the trap this unifies away).
//
// Store-agnostic: takes getters + a `fetch` callback, so it works equally with
// `createSessionStore` and with an app's own bespoke principal store (e.g.
// lux). It owns its OWN silent-recheck reauth for the probe, so it works even
// when the store's expiry policy is `graceful` (marketing) — the store's
// expiry behaviour is wired separately via `onExpired`.
//
// SSR-safe: the fetch + probe happen in onMounted (client only), and reauth
// no-ops without `window`.

import { computed, onMounted, ref, watch, type ComputedRef } from 'vue';

import { createReauth } from './reauth';

export interface UseSessionOptions {
  /** Reactive getter for the resolved principal (null when logged out). */
  me: () => unknown | null;
  /** Reactive getter: has the first `/me` resolution settled? */
  loaded: () => boolean;
  /** Resolve `/me` (idempotent) — e.g. `store.fetchMe` or lux's `store.refresh`. */
  fetch: () => Promise<unknown> | void;
  /** Namespaces the `sso_checked` flag so co-hosted apps don't collide. Match the store id. */
  storeId?: string;
  /** Where an interactive login returns by default. */
  defaultReturnTo?: string;
  /** Server login entry point. Default `'/login'`. */
  loginPath?: string;
  /**
   * Whether to attempt the silent probe on a logged-out load for this path.
   * Default: always (marketing — recognise a cross-app session anywhere).
   * Dashboards pass a predicate that's true only for gated routes.
   */
  shouldProbe?: (path: string) => boolean;
  /**
   * Reactive route — enables per-navigation re-checks (dashboards) and the
   * `?sso_checked` marker cleanup. Omit for a pure single-shot marketing boot.
   */
  route?: { path: string; fullPath: string; query: Record<string, unknown> };
  /** Router for stripping the `?sso_checked` marker after a silent round-trip. */
  router?: { replace(to: { path: string; query: Record<string, unknown> }): unknown };
  /** Register the app's client 401 seam; receives the handler to install. */
  onUnauthorized?: (handler: () => void) => void;
  /**
   * What to run on a mid-session 401. Pass `store.handleExpired` so the store's
   * own expiry policy (graceful vs silent-recheck) decides. Defaults to a
   * silent recovery via this composable's reauth.
   */
  onExpired?: () => void;
}

export interface UseSession {
  /** True once the session check has settled (authed or gated). */
  ready: ComputedRef<boolean>;
  /** True when confirmed logged out and a sign-in prompt is due (dashboards). */
  showAuthGate: ComputedRef<boolean>;
  /** Interactive login URL preserving the current path. */
  loginURL: ComputedRef<string>;
}

export function useSession(opts: UseSessionOptions): UseSession {
  const loginPath = opts.loginPath ?? '/login';
  const defaultReturnTo = opts.defaultReturnTo ?? '/';
  const shouldProbe = opts.shouldProbe ?? (() => true);

  const reauth = createReauth({
    storeId: opts.storeId,
    mode: 'silent-recheck',
    defaultReturnTo,
    loginPath,
  });

  // A mid-session 401 rejects the session per the store's expiry policy.
  if (opts.onUnauthorized) {
    opts.onUnauthorized(opts.onExpired ?? (() => reauth.recoverSession()));
  }

  const checked = ref(false);

  async function run(path: string, fullPath: string) {
    checked.value = false;
    if (!opts.loaded()) await opts.fetch();
    if (opts.me()) {
      reauth.clearRecheck();
    } else if (shouldProbe(path)) {
      // Back from a silent round-trip still logged out: strip the marker so it
      // can't linger or re-trigger, then let the auth gate render. Otherwise
      // kick off the one-time silent probe (sessionStorage-guarded; no loop).
      if (opts.route && opts.router && opts.route.query.sso_checked !== undefined) {
        const next = { ...opts.route.query };
        delete next.sso_checked;
        opts.router.replace({ path: opts.route.path, query: next });
      } else {
        reauth.attemptSilentReauth(fullPath || path);
      }
    }
    checked.value = true;
  }

  function currentPath(): string {
    if (typeof window === 'undefined') return defaultReturnTo;
    return window.location.pathname + window.location.search;
  }

  onMounted(() => {
    const path = opts.route?.path ?? currentPath();
    const fullPath = opts.route?.fullPath ?? currentPath();
    void run(path, fullPath);
  });

  if (opts.route) {
    const route = opts.route;
    watch(
      () => route.fullPath,
      (fullPath) => void run(route.path, fullPath),
    );
  }

  const ready: ComputedRef<boolean> = computed(() => checked.value && opts.loaded());
  const showAuthGate: ComputedRef<boolean> = computed(() => ready.value && !opts.me());
  const loginURL: ComputedRef<string> = computed(() => {
    const rt = opts.route?.fullPath || opts.route?.path || currentPath() || '/';
    return `${loginPath}?return_to=` + encodeURIComponent(rt);
  });

  return { ready, showAuthGate, loginURL };
}
