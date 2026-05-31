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
export { useSession } from './session/useSession';
// Vanilla async core (framework-agnostic).
export {
  me,
  orgs,
  switchOrg,
  switchPersonal,
  logout,
  login,
} from './session/me';
export type {
  MeOptions,
  OrgsOptions,
  SwitchOrgOptions,
  SwitchOrgNavigation,
  LogoutOptions,
} from './session/me';
// SPA front-channel logout helper.
export { runFrontChannelLogout } from './session/frontChannel';
export type {
  FrontChannelLogoutOptions,
  FrontChannelLogoutResponse,
} from './session/frontChannel';
// Headless org-switcher primitive + Vue adapter.
export { createOrgSwitcher } from './session/orgSwitcher';
export type {
  OrgSwitcherDeps,
  OrgSwitcherItem,
  OrgSwitcherState,
} from './session/orgSwitcher';
export { default as OrgSwitcher } from './components/OrgSwitcher.vue';
export type { UseSession, UseSessionOptions } from './session/useSession';
export type { Reauth, ReauthOptions } from './session/reauth';
export { useClickOutside } from './composables/useClickOutside';
export { default as AccountMenu } from './components/AccountMenu.vue';
export { default as AccountPrefs } from './components/AccountPrefs.vue';
export type { AccountMenuLabels, AccountMenuItem } from './components/accountMenu';
export type { AccountPrefsLabels } from './components/accountPrefs';
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
