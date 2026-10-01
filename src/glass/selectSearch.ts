// Type-to-search for GlassSelect: filtering, highlighting and movement through
// a filtered list, kept apart from the component so it is tested alone. Indices are
// always positions in the full `options` array: option ids, the active option
// and aria-activedescendant stay stable while the visible set changes.
import type { SelectOption } from './types';

/**
 * A select with more options than this shows a search field when it opens.
 * The `searchable` prop overrides the count in either direction.
 */
export const SELECT_SEARCH_THRESHOLD = 8;

/** Gap kept between an open menu and either edge of the viewport, in CSS pixels. */
export const SELECT_MENU_VIEWPORT_GUTTER = 16;

export function isSelectSearchable(optionCount: number, searchable?: boolean): boolean {
  return searchable ?? optionCount > SELECT_SEARCH_THRESHOLD;
}

/** The query as matched: surrounding whitespace ignored, case folded. */
function fold(query: string): string {
  return query.trim().toLowerCase();
}

/**
 * Indices of the options whose label or value contains the query, ignoring
 * case. An empty or blank query keeps every option.
 */
export function filterSelectOptions(options: SelectOption[], query: string): number[] {
  const needle = fold(query);
  const visible: number[] = [];
  options.forEach((option, index) => {
    if (!needle || option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle)) {
      visible.push(index);
    }
  });
  return visible;
}

/** One run of an option label: `match` runs are the parts the query found. */
export interface SelectLabelRun {
  text: string;
  match: boolean;
}

/**
 * Split a label into runs around every non-overlapping, case-insensitive
 * occurrence of the query. A label whose lowercase form changes length (a
 * few non-ASCII letters do) is returned whole, since offsets in the folded
 * string would no longer line up with the label.
 */
export function selectLabelRuns(label: string, query: string): SelectLabelRun[] {
  const needle = fold(query);
  const haystack = label.toLowerCase();
  if (!needle || haystack.length !== label.length) return [{ text: label, match: false }];
  const runs: SelectLabelRun[] = [];
  let from = 0;
  for (let at = haystack.indexOf(needle); at >= 0; at = haystack.indexOf(needle, from)) {
    if (at > from) runs.push({ text: label.slice(from, at), match: false });
    runs.push({ text: label.slice(at, at + needle.length), match: true });
    from = at + needle.length;
  }
  if (from < label.length) runs.push({ text: label.slice(from), match: false });
  return runs;
}

/**
 * Step from `from` (an index into `options`) to the next enabled option in
 * `visible`, wrapping once. From an index outside `visible`, ArrowDown lands
 * on the first and ArrowUp on the last enabled visible option. -1 means none.
 */
export function nextVisibleOption(options: SelectOption[], visible: number[], from: number, direction: 1 | -1): number {
  const n = visible.length;
  if (n === 0) return -1;
  const start = visible.indexOf(from);
  const origin = start >= 0 ? start : direction === 1 ? -1 : n;
  for (let step = 1; step <= n; step++) {
    const index = visible[((origin + direction * step) % n + n) % n];
    if (!options[index].disabled) return index;
  }
  return -1;
}

/**
 * The option to make active when the visible set changes: the selected value
 * when it is visible and enabled, otherwise the first enabled visible option.
 */
export function initialVisibleOption(options: SelectOption[], visible: number[], value: string): number {
  const selected = visible.find((index) => options[index].value === value && !options[index].disabled);
  return selected ?? nextVisibleOption(options, visible, -1, 1);
}

/**
 * A key that types into the search field from a closed trigger: one printed
 * character without Ctrl, Meta or Alt. Space is excluded because it opens the
 * menu, as on a native select.
 */
export function isTypeToSearchKey(event: { key: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean }): boolean {
  return [...event.key].length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey;
}

/**
 * How far to move a menu left of its trigger's left edge so its right edge
 * stays `gutter` pixels inside the viewport, without moving its left edge
 * past the same gutter on the other side. 0 when it already fits.
 */
export function selectMenuShift(triggerLeft: number, menuWidth: number, viewportWidth: number, gutter = SELECT_MENU_VIEWPORT_GUTTER): number {
  const overflow = triggerLeft + menuWidth - (viewportWidth - gutter);
  if (overflow <= 0) return 0;
  return Math.max(0, Math.min(overflow, triggerLeft - gutter));
}
