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

// Liquid Glass v2 runtime — refraction + specular sheen (progressive, a11y-safe).
export { initLiquidGlass, refract, sheen } from './glass/liquidGlass';
export { useLiquidGlass, type UseLiquidGlassOptions } from './glass/useLiquidGlass';
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
export { default as GlassIconButton } from './components/GlassIconButton.vue';
export { default as GlassSwitch } from './components/GlassSwitch.vue';
export { default as GlassSegmented } from './components/GlassSegmented.vue';
export { default as GlassCheckbox } from './components/GlassCheckbox.vue';
export { default as GlassRadio } from './components/GlassRadio.vue';
export { default as GlassTabs } from './components/GlassTabs.vue';
export type { SegmentOption, TabItem } from './glass/types';
// Overlays + imperative services.
export { default as GlassModal } from './components/GlassModal.vue';
export { default as GlassPopover } from './components/GlassPopover.vue';
export { default as GlassToaster } from './components/GlassToaster.vue';
export { default as GlassConfirmHost } from './components/GlassConfirmHost.vue';
export { useFocusTrap } from './glass/overlay';
export type { FocusTrapOptions } from './glass/overlay';
export { message, dismissToast, toasts } from './glass/message';
export type { MessageTone, MessageOptions, ToastItem } from './glass/message';
export { confirm, resolveConfirm, currentConfirm } from './glass/confirm';
export type { ConfirmOptions } from './glass/confirm';
// Feedback + loaders.
export { default as GlassSpinner } from './components/GlassSpinner.vue';
export { default as GlassProgress } from './components/GlassProgress.vue';
export { default as GlassSkeleton } from './components/GlassSkeleton.vue';
export { default as GlassTooltip } from './components/GlassTooltip.vue';
// Containers.
export { default as GlassMenu } from './components/GlassMenu.vue';
export { default as GlassSelect } from './components/GlassSelect.vue';
export { default as GlassDrawer } from './components/GlassDrawer.vue';
export { default as GlassTable } from './components/GlassTable.vue';
export type { MenuItem, SelectOption, TableColumn } from './glass/types';
export { default as AccountMenu } from './components/AccountMenu.vue';
export { default as AccountPrefs } from './components/AccountPrefs.vue';
export type { AccountMenuLabels, AccountMenuLabelOverrides, AccountMenuItem, AccountRoleLabels } from './components/accountMenu';
export type { AccountPrefsLabels } from './components/accountPrefs';
export type {
  Principal,
  PlatformRole,
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
