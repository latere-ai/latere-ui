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

// Session bindings — React context + hooks over the vanilla session core
// (session/client.ts, me.ts, reauth.ts, frontChannel.ts). No vue, no pinia.
export {
  SessionProvider,
  useSession,
  useSessionGate,
  type SessionProviderProps,
  type SessionContextValue,
  type UseSessionGateOptions,
  type UseSessionGate,
} from './session';
