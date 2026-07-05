// Shared value types for the Glass component library. Types live in a .ts
// module (never re-exported from a .vue SFC) so a consumer's vue-tsc keeps the
// named members even when it falls back to the default-only `*.vue` shim.

/** One option in a GlassSegmented control. */
export interface SegmentOption {
  value: string;
  label: string;
}

/** One tab in a GlassTabs strip. */
export interface TabItem {
  value: string;
  label: string;
}

/** One row in a GlassMenu. */
export interface MenuItem {
  value: string;
  label: string;
  /** Style as destructive. */
  danger?: boolean;
  disabled?: boolean;
}

/** One option in a GlassSelect. */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** A column definition for GlassTable. */
export interface TableColumn {
  key: string;
  label: string;
  /** CSS text-align for the column. */
  align?: 'left' | 'center' | 'right';
  /** Fixed/max width, any CSS length. */
  width?: string;
}
