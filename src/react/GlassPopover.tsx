import { useRef, useState, type ReactNode } from 'react';
import { cx, useClickOutside } from './internal';
import '../styles/components/glass-popover.css';

export interface GlassPopoverProps {
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  matchWidth?: boolean;
  /** Optional controlled visibility; omit to toggle internally. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  trigger: ReactNode | ((scope: { open: boolean; toggle: () => void }) => ReactNode);
  children?: ReactNode | ((scope: { close: () => void }) => ReactNode);
}

export function GlassPopover({
  placement = 'bottom-start',
  matchWidth = false,
  open: controlledOpen,
  onOpenChange,
  onClose,
  trigger,
  children,
}: GlassPopoverProps) {
  const [internalOpen, setOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const root = useRef<HTMLDivElement>(null);
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
  return (
    <div ref={root} className="lu-pop" onKeyDown={event => {
      if (open && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    }}>
      <div className="lu-pop-trigger" onClick={toggle}>
        {typeof trigger === 'function' ? trigger({ open, toggle }) : trigger}
      </div>
      {open && (
        <div
          className={cx('lu-pop-panel lu-glass-thick', `lu-pop-panel--${placement}`, matchWidth && 'lu-pop-panel--match')}
          role="menu"
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
