// Shared overlay behavior for GlassModal / GlassPopover / imperative dialogs:
// a focus trap that also handles Escape and restores focus on close. Kept
// framework-thin and SSR-safe (no-ops without `document`).
import { watch, nextTick, onScopeDispose, type Ref } from 'vue';
import { activateFocusTrap } from './focusTrap';

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

  let trap: ReturnType<typeof activateFocusTrap> | undefined;

  watch(
    () => opts.active.value,
    async (open) => {
      if (open) {
        trap = activateFocusTrap(() => opts.container.value, opts.onEscape, () => opts.initialFocus?.value);
        const openedTrap = trap;
        await nextTick();
        if (opts.active.value && trap === openedTrap) trap.focus();
      } else {
        trap?.dispose();
        trap = undefined;
      }
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    trap?.dispose();
    trap = undefined;
  });
}
