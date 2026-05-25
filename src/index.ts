export { default as SiteFooter } from './components/SiteFooter.vue';
export { default as LatereLogoMark } from './components/LatereLogoMark.vue';
// Types are re-exported from .ts modules, never from the .vue SFCs: a
// consumer's vue-tsc can fall back to the default-only `*.vue` shim and drop
// named members, which breaks clean/SSG builds (e.g. vite-ssg).
export type { Theme, Locale, Messages, LocaleOption } from './i18n/footer';

// Shared session / auth.
export { createApiClient, ApiError } from './session/client';
export { createSessionStore } from './session/store';
export { createReauth } from './session/reauth';
export { useSessionGate } from './session/gate';
export type { Reauth, ReauthOptions } from './session/reauth';
export { useClickOutside } from './composables/useClickOutside';
export { default as AccountMenu } from './components/AccountMenu.vue';
export type { AccountMenuLabels, AccountMenuItem } from './components/accountMenu';
export type {
  Principal,
  OrgEntry,
  ApiClient,
  ApiClientOptions,
  RequestOptions,
  UnauthorizedContext,
  SessionStoreOptions,
  ExpiredSessionMode,
  SwitchOrgMode,
} from './session/types';
export type {
  GateStore,
  GateRoute,
  GateRouter,
  UseSessionGate,
} from './session/gate';
