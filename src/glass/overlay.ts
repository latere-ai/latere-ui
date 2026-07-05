// Shared overlay behavior for GlassModal / GlassPopover / imperative dialogs:
// a focus trap that also handles Escape and restores focus on close. Kept
// framework-thin and SSR-safe (no-ops without `document`).
import { watch, nextTick, onScopeDispose, type Ref } from 'vue';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

export interface FocusTrapOptions {
  /** Reactive open state; the trap engages while true. */
  active: Ref<boolean>;
  /** The element to trap focus within. */
  container: Ref<HTMLElement | null | undefined>;
  /** Called on Escape. */
  onEscape?: () => void;
  /**
   * Element to focus on open instead of the first focusable one — e.g. a text
   * input in a prompt dialog, so the user can type immediately. Falls back to
   * the first focusable element when unset or null.
   */
  initialFocus?: Ref<HTMLElement | null | undefined>;
}

/**
 * Trap Tab focus inside `container` while `active`, close on Escape, and
 * restore focus to the previously-focused element when it closes. Call in
 * `setup()`; listeners are torn down with the component scope.
 */
export function useFocusTrap(opts: FocusTrapOptions): void {
  if (typeof document === 'undefined') return;

  let previouslyFocused: HTMLElement | null = null;

  function onKeydown(e: KeyboardEvent) {
    if (!opts.active.value) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      opts.onEscape?.();
      return;
    }
    if (e.key !== 'Tab') return;
    const el = opts.container.value;
    if (!el) return;
    const items = focusable(el);
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const activeEl = document.activeElement as HTMLElement | null;
    if (e.shiftKey && activeEl === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && activeEl === last) {
      e.preventDefault();
      first.focus();
    }
  }

  watch(
    () => opts.active.value,
    async (open) => {
      if (open) {
        previouslyFocused = document.activeElement as HTMLElement | null;
        document.addEventListener('keydown', onKeydown, true);
        await nextTick();
        const el = opts.container.value;
        if (el) (opts.initialFocus?.value ?? focusable(el)[0] ?? el).focus();
      } else {
        document.removeEventListener('keydown', onKeydown, true);
        previouslyFocused?.focus?.();
        previouslyFocused = null;
      }
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    document.removeEventListener('keydown', onKeydown, true);
  });
}
