export { default as SiteFooter } from './components/SiteFooter.vue';
export { default as LatereLogoMark } from './components/LatereLogoMark.vue';

// Console shell: headless nav model + collapse primitive, and the Vue adapter.
// Styles ship separately as the `latere-ui/console` entrypoint.
export { default as ConsoleSidebar } from './components/ConsoleSidebar.vue';
export { default as ConsolePalette } from './components/ConsolePalette.vue';
export {
  createCollapse,
  partitionGroups,
  flattenNavItems,
  isItemDisabled,
} from './console/nav';
export type {
  NavItem,
  NavGroup,
  FlatNavItem,
  ConsoleNavModel,
  CollapseOptions,
  CollapseState,
} from './console/nav';

// Docs renderer: headless grouped-docs model + TOC primitive, and the Vue
// adapter. Styles ship separately as the `latere-ui/docs` entrypoint.
export { default as DocsLayout } from './components/DocsLayout.vue';
export {
  flattenDocs,
  findDoc,
  adjacentDocs,
  docPath,
  buildDocSearchIndex,
} from './docs/model';
export type {
  DocPage,
  DocGroup,
  FlatDoc,
  DocSearchEntry,
} from './docs/model';
export { createToc, slugify } from './docs/toc';
export type { TocItem, TocOptions, TocController } from './docs/toc';
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

// Liquid Glass material. The CSS ships separately as the `latere-ui/glass`
// entrypoint; this exports the headless composable + tier helper.
export { useGlass, glassClass, concentricRadius } from './glass/useGlass';
export type { UseGlass, GlassTier } from './glass/useGlass';

// Liquid Glass component library. All compose the material tiers, so each
// inherits the reduce-transparency opaque fallback. Requires the app to
// `import 'latere-ui/glass'` for the material CSS.
export { default as GlassSurface } from './components/GlassSurface.vue';
export { default as GlassPanel } from './components/GlassPanel.vue';
export { default as GlassBar } from './components/GlassBar.vue';
export { default as GlassButton } from './components/GlassButton.vue';
export { default as GlassField } from './components/GlassField.vue';
export { default as GlassBadge } from './components/GlassBadge.vue';
export { default as GlassAlert } from './components/GlassAlert.vue';
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
