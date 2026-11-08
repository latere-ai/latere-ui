// DOM-only overlay ownership. Only the most recently opened trap handles
// keyboard events, so nested dialogs close one at a time.
// A disclosure's summary takes focus too; without it, Tab from the summary
// jumps back to the first control and skips everything after it.
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),details>summary:first-of-type,[tabindex]:not([tabindex="-1"]),[contenteditable]:not([contenteditable="false"])';

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

// A browser treats a radio group as one tab stop: its checked radio, or with
// none checked the first on the way in and the last on the way out. The trap
// wraps at the first and last stop, so each group counts once, as the radio
// that stands for it.
function radioGroup(radio: HTMLInputElement, items: HTMLElement[]): HTMLInputElement[] {
  return items.filter((item): item is HTMLInputElement =>
    item instanceof HTMLInputElement && item.type === 'radio' && item.name === radio.name && item.form === radio.form);
}

function isRadioInGroup(element: HTMLElement): element is HTMLInputElement {
  return element instanceof HTMLInputElement && element.type === 'radio' && element.name !== '';
}

function tabStops(items: HTMLElement[]): HTMLElement[] {
  return items.filter((item) => {
    if (!isRadioInGroup(item)) return true;
    const group = radioGroup(item, items);
    const checked = group.find((radio) => radio.checked);
    return checked ? item === checked : item === group[0];
  });
}

// The stop that `element` belongs to: itself, or for a radio its group's stop.
function stopOf(element: HTMLElement, stops: HTMLElement[], items: HTMLElement[]): HTMLElement {
  if (!isRadioInGroup(element)) return element;
  const group = radioGroup(element, items);
  return stops.find((stop) => group.includes(stop as HTMLInputElement)) ?? element;
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
    // An open control inside the trap, such as a select's menu, marks itself
    // with data-lu-owns-escape and handles Escape at its target: the key
    // clears or closes that control and leaves the dialog open. An open
    // floating panel (data-lu-layer, a select's menu or a popover's panel)
    // takes the key wherever the focus is in the dialog, as after a pointer
    // press in Safari, which does not focus the pressed button; the panel's
    // own document listener then closes it.
    if (event.key === 'Escape' && ((event.target as Element | null)?.closest?.('[data-lu-owns-escape]')
      || container()?.querySelector('[data-lu-layer]'))) return;
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
    const stops = tabStops(items);
    const active = document.activeElement as HTMLElement | null;
    if (items.length === 0) {
      event.preventDefault();
      trap.focus();
    } else if (!active || !items.includes(active)) {
      event.preventDefault();
      (event.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
    } else if (event.shiftKey && stopOf(active, stops, items) === stops[0]) {
      event.preventDefault();
      stops[stops.length - 1].focus();
    } else if (!event.shiftKey && stopOf(active, stops, items) === stops[stops.length - 1]) {
      event.preventDefault();
      stops[0].focus();
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
