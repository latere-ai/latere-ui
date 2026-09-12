// Shared plumbing for the React adapters. React-only: nothing in src/react/
// may import a module that pulls in `vue`, so a React host never needs Vue
// installed (react/react-dom are optional peers, vue stays Vue-side).
import { useEffect, useRef, type RefObject } from 'react';
import { activateFocusTrap } from '../glass/focusTrap';

/** Join truthy class parts — mirrors Vue's class binding output order. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Close-on-outside-click + Escape, the React port of
 * `composables/useClickOutside`. Listeners attach only while `open`.
 */
export function useClickOutside(
  rootRef: RefObject<HTMLElement | null>,
  open: boolean,
  close: () => void,
): void {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeRef.current();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
      }
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, rootRef]);
}

/**
 * Trap Tab focus inside `container` while `active`, close on Escape, and
 * restore focus to the previously-focused element on deactivation. The React
 * port of `glass/overlay.ts`'s useFocusTrap.
 */
export function useFocusTrap(
  active: boolean,
  container: RefObject<HTMLElement | null>,
  onEscape?: () => void,
): void {
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;
  useEffect(() => {
    if (!active || typeof document === 'undefined') return;

    const trap = activateFocusTrap(() => container.current, () => escapeRef.current?.());
    trap.focus();
    return trap.dispose;
  }, [active, container]);
}
