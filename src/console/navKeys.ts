// Arrow-key movement through the console sidebar's rows, shared by the Vue
// and React adapters. It reads the rendered rows rather than the model, so it
// follows exactly what the viewer sees: folded children are inside a
// `[hidden]` group and are skipped, disabled rows are skipped, and the order
// is document order. Tab still moves through the rail as usual.
//
// Up and Down move between rows, Home and End jump to the first and last.
// Right opens a folded parent, or on an open one moves to its first child.
// Left folds an open parent, or on a child moves back to its parent.

/** Every focusable row of the rail carries this class. */
const ROW = '.lu-cs-item';

function rows(nav: HTMLElement): HTMLElement[] {
  return Array.from(nav.querySelectorAll<HTMLElement>(ROW)).filter(
    (el) => !el.closest('[hidden]') && el.dataset.disabled !== 'true',
  );
}

/**
 * Handle a keydown inside the sidebar's `<nav>`. Returns true when the key
 * moved focus or toggled a parent, after preventing its default. `toggle`
 * opens or folds the parent with the given id.
 */
export function handleNavKey(
  event: KeyboardEvent,
  nav: HTMLElement,
  toggle: (id: string, open: boolean) => void,
): boolean {
  if (event.altKey || event.ctrlKey || event.metaKey) return false;
  const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>(ROW) : null;
  if (!target || !nav.contains(target)) return false;
  const list = rows(nav);
  const at = list.indexOf(target);
  const focus = (el: HTMLElement | undefined) => {
    if (!el) return false;
    event.preventDefault();
    el.focus();
    return true;
  };
  const id = target.dataset.navId;
  const expanded = target.getAttribute('aria-expanded');
  switch (event.key) {
    case 'ArrowDown':
      return focus(list[at + 1]);
    case 'ArrowUp':
      return focus(list[at - 1]);
    case 'Home':
      return focus(list[0]);
    case 'End':
      return focus(list[list.length - 1]);
    case 'ArrowRight':
      if (expanded === 'false' && id) {
        event.preventDefault();
        toggle(id, true);
        return true;
      }
      if (expanded === 'true') {
        const group = nav.ownerDocument.getElementById(target.getAttribute('aria-controls') ?? '');
        return focus(group ? rows(group)[0] : undefined);
      }
      return false;
    case 'ArrowLeft': {
      if (expanded === 'true' && id) {
        event.preventDefault();
        toggle(id, false);
        return true;
      }
      const group = target.closest<HTMLElement>('.lu-cs-children');
      return focus(group?.id ? list.find((el) => el.getAttribute('aria-controls') === group.id) : undefined);
    }
    default:
      return false;
  }
}
