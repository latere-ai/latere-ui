// React adapter of GlassPopover.vue: the same trigger/panel markup, dismissal,
// focus return, menu-button keys and surfaces. See the SFC for the contract.
import { useId, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react';
import { cx, useClickOutside } from './internal';
import '../styles/components/glass-popover.css';

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
  /** Extra class on the root, as a Vue host's class falls through to it. */
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
  const id = `${useId()}-panel`;
  function change(next: boolean) {
    if (controlledOpen === undefined) setOpen(next);
    onOpenChange?.(next);
    if (!next) onClose?.();
  }
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
    <div ref={root} className={cx('lu-pop', className)} onKeyDown={onKey} onBlur={onFocusOut}>
      <div className="lu-pop-trigger" onClick={toggle}>
        {typeof trigger === 'function' ? trigger({ open, toggle, id }) : trigger}
      </div>
      {open && (
        <div
          id={id}
          className={cx('lu-pop-panel', surface === 'solid' ? 'lu-pop-panel--solid' : 'lu-glass-thick', `lu-pop-panel--${placement}`, matchWidth && 'lu-pop-panel--match')}
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
