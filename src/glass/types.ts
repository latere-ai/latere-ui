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
