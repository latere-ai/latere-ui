// React entrypoint (`latere-ui/react`). Source-shipped tsx, compiled by the
// consuming React app exactly as Vue hosts compile the SFCs. Each component
// imports its shared stylesheet from src/styles/components/*; Vue and
// React have separate visual baselines for adapter-specific markup. Nothing
// here may import `vue`; react/react-dom are optional peers.

export { GlassButton, type GlassButtonProps } from './GlassButton';
export { GlassPanel, type GlassPanelProps } from './GlassPanel';
export { GlassBar, type GlassBarProps } from './GlassBar';
export { GlassField, type GlassFieldProps } from './GlassField';
export { GlassBadge, type GlassBadgeProps, type GlassBadgeTone } from './GlassBadge';
export { GlassAlert, type GlassAlertProps, type GlassAlertTone } from './GlassAlert';
export { GlassSpinner, type GlassSpinnerProps } from './GlassSpinner';
export { GlassSelect, type GlassSelectProps } from './GlassSelect';
export { GlassCheckbox, type GlassCheckboxProps } from './GlassCheckbox';
export { GlassTable, type GlassTableProps } from './GlassTable';
export { GlassModal, type GlassModalProps } from './GlassModal';
export { GlassSegmented, type GlassSegmentedProps } from './GlassSegmented';
export type { GlassTier } from './GlassSurface';

// Shared value types (framework-free .ts modules).
export type { SelectOption, SegmentOption, TableColumn } from '../glass/types';

// Console shell: React adapter over the headless nav model (console/nav.ts).
// Styles ship separately as the `latere-ui/console` entrypoint, same as Vue.
export {
  ConsoleSidebar,
  type ConsoleSidebarProps,
  type ConsoleSidebarItemRenderProps,
  type ConsoleSidebarIconRenderProps,
  type RouterLinkComponent,
} from './ConsoleSidebar';
export { partitionGroups, flattenNavItems, isItemDisabled, hasChildren, activePath, navTarget } from '../console/nav';
export type { NavItem, NavGroup, NavFootItem, FlatNavItem, ConsoleNavModel } from '../console/nav';
export { DEFAULT_NAV_OPEN_KEY } from '../console/openState';
export { CONSOLE_ICONS, consoleIcon } from '../console/icons';
export type { ConsoleIconName } from '../console/icons';
export { paletteEntries, filterPalette } from '../console/palette';
export type { ConsolePaletteItem, ConsolePaletteSearch } from '../console/palette';

// Site footer — the shared Latere footer in both variants. Copy and the
// product lineup come from the same framework-free modules the SFC reads.
export { SiteFooter, type SiteFooterProps } from './SiteFooter';
export { LatereLogoMark } from './LatereLogoMark';
export { PlatformLogoMark } from './PlatformLogoMark';
export { translator, en, zh, de } from '../i18n/footer';
export type { Locale, Messages, Theme, LocaleOption } from '../i18n/footer';
export { LATERE_PRODUCTS, type ProductInfo, type ProductSlug } from '../components/productSwitcher';

// Account menu — reuses the headless types/defaults from components/accountMenu.ts.
export { AccountMenu, type AccountMenuProps } from './AccountMenu';
export { identityLine, identityParts } from '../components/accountMenu';
export type { AccountMenuLabels, AccountMenuLabelOverrides, AccountMenuItem, AccountRoleLabels, AccountMenuSubline } from '../components/accountMenu';

// Session bindings — React context + hooks over the vanilla session core
// (session/client.ts, me.ts, reauth.ts, frontChannel.ts). No vue, no pinia.
export {
  SessionProvider,
  useSession,
  useOptionalSession,
  useSessionGate,
  type SessionProviderProps,
  type SessionContextValue,
  type UseSessionGateOptions,
  type UseSessionGate,
} from './session';
// Vanilla async core (framework-agnostic) — re-exported here so a React
// consumer doesn't need to reach into the Vue-flavored `latere-ui` entry for
// the types SessionProvider/AccountMenu's props are built from.
export { me, orgs, switchOrg, switchPersonal, logout, login } from '../session/me';
export { createApiClient, ApiError } from '../session/client';
export { runFrontChannelLogout } from '../session/frontChannel';
export type {
  Principal,
  PlatformRole,
  OrgEntry,
  ApiClient,
  ApiClientOptions,
  RequestOptions,
  UnauthorizedContext,
  ExpiredSessionMode,
  SwitchOrgMode,
} from '../session/types';
export type { FrontChannelLogoutOptions, FrontChannelLogoutResponse } from '../session/frontChannel';

// Complete visual component adapters, sharing styles and framework-free services.
export * from './basic';
export * from './overlays';
export * from './shell';
export { initLiquidGlass, refract, sheen } from '../glass/liquidGlass';
