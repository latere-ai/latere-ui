// React entrypoint (`latere-ui/react`). Source-shipped tsx, compiled by the
// consuming React app exactly as Vue hosts compile the SFCs. Each component
// imports its shared stylesheet from src/styles/components/*, so Vue and
// React render pixel-identical output. Nothing in here may import `vue` —
// react/react-dom are optional peers and vue stays Vue-side.

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
export { partitionGroups, flattenNavItems, isItemDisabled } from '../console/nav';
export type { NavItem, NavGroup, FlatNavItem, ConsoleNavModel } from '../console/nav';

// Account menu — reuses the headless types/defaults from components/accountMenu.ts.
export { AccountMenu, type AccountMenuProps } from './AccountMenu';
export type { AccountMenuLabels, AccountMenuLabelOverrides, AccountMenuItem, AccountRoleLabels } from '../components/accountMenu';

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
