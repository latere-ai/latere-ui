// Shared value types for the Glass component library.

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
  /**
   * Selection state for a choice menu. Setting it on any item makes every
   * item a menuitemradio with aria-checked and a leading check column.
   */
  checked?: boolean;
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
