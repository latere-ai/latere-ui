// Shared plumbing for the React components.
import { useEffect, useLayoutEffect, useRef, type MouseEvent as ReactMouseEvent, type ReactNode, type RefObject } from 'react';
import { activateFocusTrap } from '../glass/focusTrap';

/** Join truthy class parts, in argument order. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Close-on-outside-click + Escape. Listeners attach only while `open`.
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
 * restore focus to the previously-focused element on deactivation. A React
 * wrapper over `activateFocusTrap` in `glass/focusTrap.ts`.
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

/**
 * Click-on-scrim dismissal for a dialog. A browser fires the click for a
 * press that starts in the panel and ends over the scrim on the scrim itself,
 * which would close the dialog under someone selecting text. The handlers
 * close only when the press did not start inside the panel.
 */
export function useScrimDismiss(enabled: boolean, close: () => void) {
  const pressedInside = useRef(false);
  return {
    onMouseDown(event: ReactMouseEvent<HTMLElement>) {
      pressedInside.current = event.target !== event.currentTarget;
    },
    onClick(event: ReactMouseEvent<HTMLElement>) {
      const inside = pressedInside.current;
      pressedInside.current = false;
      if (event.target === event.currentTarget && enabled && !inside) close();
    },
  };
}

/**
 * The attributes that name a dialog. `<id>-title` is the default title's id
 * and `<id>-head` the header slot's. A custom header replaces the title
 * element, so a title given with it names the dialog through `aria-label`
 * and a header alone names it by its content.
 */
export function dialogName(
  id: string,
  { title, header, labelledBy }: { title?: string; header?: ReactNode; labelledBy?: string },
): { 'aria-labelledby'?: string; 'aria-label'?: string } {
  if (labelledBy) return { 'aria-labelledby': labelledBy };
  if (header) return title ? { 'aria-label': title } : { 'aria-labelledby': `${id}-head` };
  return title ? { 'aria-labelledby': `${id}-title` } : {};
}

/**
 * A layout effect on the client and an ordinary effect during server
 * rendering, where React 18 warns that a layout effect does nothing.
 */
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Whether the keyboard's command key is Cmd: macOS and iOS. Server rendering
 * has no navigator and answers true.
 */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return true;
  const { userAgentData, platform } = navigator as Navigator & { userAgentData?: { platform?: string } };
  return /mac|iphone|ipad|ipod/i.test(userAgentData?.platform || platform || '');
}
