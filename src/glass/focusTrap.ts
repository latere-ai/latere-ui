// DOM-only overlay ownership shared by Vue and React. Only the most recently
// opened trap handles keyboard events, including mixed-framework hosts.
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface Trap {
  container: () => HTMLElement | null | undefined;
  previous: HTMLElement | null;
  focus: () => void;
}
const traps: Trap[] = [];

function focusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.matches(':disabled') && Number(element.getAttribute('tabindex') ?? 0) >= 0
      && (element.offsetParent !== null || element === document.activeElement),
  );
}

export function activateFocusTrap(
  container: () => HTMLElement | null | undefined,
  onEscape?: () => void,
  initialFocus?: () => HTMLElement | null | undefined,
): { focus: () => void; dispose: () => void } {
  const trap: Trap = {
    container,
    previous: document.activeElement as HTMLElement | null,
    focus() {
      if (traps.at(-1) !== trap) return;
      const element = container();
      if (!element) return;
      if (!element.hasAttribute('tabindex')) element.tabIndex = -1;
      (initialFocus?.() ?? focusable(element)[0] ?? element).focus();
    },
  };
  traps.push(trap);

  function onKeydown(event: KeyboardEvent) {
    if (traps.at(-1) !== trap) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      onEscape?.();
      return;
    }
    if (event.key !== 'Tab') return;
    const element = container();
    if (!element) return;
    const items = focusable(element);
    const active = document.activeElement as HTMLElement | null;
    if (items.length === 0) {
      event.preventDefault();
      trap.focus();
    } else if (!active || !items.includes(active)) {
      event.preventDefault();
      (event.shiftKey ? items[items.length - 1] : items[0]).focus();
    } else if (event.shiftKey && active === items[0]) {
      event.preventDefault();
      items[items.length - 1].focus();
    } else if (!event.shiftKey && active === items[items.length - 1]) {
      event.preventDefault();
      items[0].focus();
    }
  }
  document.addEventListener('keydown', onKeydown, true);

  return {
    focus: trap.focus,
    dispose() {
      const index = traps.indexOf(trap);
      if (index < 0) return;
      const wasTop = traps.at(-1) === trap;
      // If a parent closes before its child, preserve the original opener so
      // closing that child never attempts to focus a removed parent control.
      for (const other of traps.slice(index + 1)) {
        if (other.previous && container()?.contains(other.previous)) other.previous = trap.previous;
      }
      traps.splice(index, 1);
      document.removeEventListener('keydown', onKeydown, true);
      if (!wasTop) return;
      const top = traps.at(-1);
      if (trap.previous?.isConnected && (!top || top.container()?.contains(trap.previous))) trap.previous.focus();
      else top?.focus();
    },
  };
}
