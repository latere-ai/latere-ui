// Route gate for protected views/layouts. Encapsulates sandbox's
// Dashboard.vue auto-login flow: resolve the session on entry (and on route
// change); when absent on a dashboard, the store's silent `prompt=none`
// re-check runs; when we come back from that round-trip still unauthenticated
// (`?sso_checked` in the URL), clean the query and expose `showAuthGate` so
// the view can render a sign-in prompt instead of a broken page.
//
// Kept framework-light: typed against the slices of the store + vue-router we
// use, so callers pass their concrete instances without coupling this file to
// a specific vue-router version.

import { computed, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue';

import type { Principal } from './types';

export interface GateStore {
  me: Principal | null;
  loaded: boolean;
  ensureSession(returnTo: string): Promise<boolean>;
}

export interface GateRoute {
  path: string;
  fullPath: string;
  query: Record<string, unknown>;
}

export interface GateRouter {
  replace(to: { path: string; query: Record<string, unknown> }): unknown;
}

export interface UseSessionGate {
  /** True once the session check has settled (authed or gated). */
  ready: ComputedRef<boolean>;
  /** True when the user is confirmed logged out and a sign-in prompt is due. */
  showAuthGate: ComputedRef<boolean>;
  /** Interactive login URL preserving the current path. */
  loginURL: ComputedRef<string>;
}

export function useSessionGate(
  store: GateStore,
  route: GateRoute,
  router: GateRouter,
  options: { loginPath?: string } = {},
): UseSessionGate {
  const loginPath = options.loginPath ?? '/login';
  const checked = ref(false);

  async function run(path: string, fullPath: string) {
    checked.value = false;
    await store.ensureSession(fullPath || path);
    // If we returned from a silent re-check still logged out, strip the marker
    // query param so it doesn't linger / re-trigger.
    if (!store.me && route.query.sso_checked !== undefined) {
      const next = { ...route.query };
      delete next.sso_checked;
      router.replace({ path: route.path, query: next });
    }
    checked.value = true;
  }

  onMounted(() => void run(route.path, route.fullPath));
  watch(
    () => route.fullPath,
    (fullPath) => void run(route.path, fullPath),
  );

  const ready: ComputedRef<boolean> = computed(() => checked.value && store.loaded);
  const showAuthGate: ComputedRef<boolean> = computed(() => ready.value && !store.me);
  const loginURL: ComputedRef<string> = computed(
    () => `${loginPath}?return_to=` + encodeURIComponent(route.fullPath || route.path || '/'),
  );

  return { ready, showAuthGate, loginURL };
}

// Re-export for convenience so callers can type their own refs if desired.
export type { Ref };
