/**
 * Whether a key event belongs to an input method composition. The Enter that
 * commits a composition and the Escape that cancels one are the input
 * method's, not commands. Some browsers report the keydown after the
 * composition ended with `isComposing` false and `keyCode` 229.
 */
export function isComposingKey(event: { isComposing?: boolean; keyCode?: number }): boolean {
  return event.isComposing === true || event.keyCode === 229;
}
