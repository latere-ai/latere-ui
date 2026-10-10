// A floating surface anchored to a trigger: dropdown menus, filter panels.
// Toggles on trigger click, closes on outside click and Escape, and returns
// focus to the trigger when it closes from inside. Focus moving to another
// element outside the popover closes it too. ArrowDown/ArrowUp on a closed
// trigger open it, as on a menu button. While it is open it owns Escape, so
// inside a dialog or a drawer the key closes the popover and leaves the
// dialog open.
//
// The panel opens in the top layer (useAnchoredLayer), so a dialog or a
// scrolling container around the popover never clips it. `placement` is the
// side and edge it prefers: it flips to the other side where only that one
// has the room, and its class names the placement it took.
//
// The panel carries no role of its own: its content declares one (GlassMenu
// is role=menu), so a menu inside the panel is announced once, not nested in
// a second menu. The trigger receives the panel `id` for aria-controls.
//
// `surface` picks the material: `glass` (thick Liquid Glass, requires
// `import 'latere-ui/glass'`) or `solid`, an opaque menu surface with a
// hairline border and the menu shadow that needs no glass layer.
import { useId, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react';
import type { AnchoredAlign, AnchoredSide } from '../glass/anchoredPlacement';
import { cx, useClickOutside } from './internal';
import { useAnchoredLayer } from './useAnchoredLayer';
import '../styles/components/glass-popover.css';

/** Space between the trigger and the panel, in CSS pixels. */
const POPOVER_GAP = 6;
/** Space the panel keeps from every edge of the viewport, in CSS pixels. */
const POPOVER_GUTTER = 8;

export interface GlassPopoverProps {
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  matchWidth?: boolean;
  /** `glass` (thick Liquid Glass, needs `latere-ui/glass`) or `solid`, an opaque menu surface. */
  surface?: 'glass' | 'solid';
  /** Optional controlled visibility; omit to toggle internally. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  /** The trigger, or a render function receiving the open state and the panel id for aria-controls. */
  trigger: ReactNode | ((scope: { open: boolean; toggle: () => void; id: string }) => ReactNode);
  children?: ReactNode | ((scope: { close: () => void }) => ReactNode);
  /** Extra class on the root element. */
  className?: string;
}

export function GlassPopover({
  placement = 'bottom-start',
  matchWidth = false,
  surface = 'glass',
  open: controlledOpen,
  onOpenChange,
  onClose,
  trigger,
  children,
  className,
}: GlassPopoverProps) {
  const [internalOpen, setOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = `${useId()}-panel`;
  const [side, align] = placement.split('-') as [AnchoredSide, AnchoredAlign];
  function change(next: boolean) {
    if (controlledOpen === undefined) setOpen(next);
    onOpenChange?.(next);
    if (!next) onClose?.();
  }
  const placed = useAnchoredLayer({ open, anchor: root, panel, side, align, gap: POPOVER_GAP, gutter: POPOVER_GUTTER, onHidden: () => change(false) });
  const toggle = () => change(!open);
  const close = () => {
    if (root.current?.querySelector('.lu-pop-panel')?.contains(document.activeElement)) {
      root.current.querySelector<HTMLElement>('.lu-pop-trigger button:not(:disabled), .lu-pop-trigger a[href], .lu-pop-trigger [tabindex]')?.focus();
    }
    change(false);
  };
  useClickOutside(root, open, () => change(false));
  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    const inPanel = !!(event.target as Element | null)?.closest?.('.lu-pop-panel');
    if (open && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    else if (open && inPanel && event.key === 'Tab' && event.shiftKey) close();
    else if (!open && !inPanel && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) { event.preventDefault(); change(true); }
  }
  function onFocusOut(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget as Node | null;
    if (open && next && !root.current?.contains(next)) change(false);
  }
  return (
    <div ref={root} className={cx('lu-pop', className)} data-lu-owns-escape={open ? '' : undefined} onKeyDown={onKey} onBlur={onFocusOut}>
      <div className="lu-pop-trigger" onClick={toggle}>
        {typeof trigger === 'function' ? trigger({ open, toggle, id }) : trigger}
      </div>
      {open && (
        <div
          ref={panel}
          id={id}
          popover="manual"
          data-lu-layer=""
          className={cx('lu-pop-panel', surface === 'solid' ? 'lu-pop-panel--solid' : 'lu-glass-thick', `lu-pop-panel--${placed}-${align}`, matchWidth && 'lu-pop-panel--match')}
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
