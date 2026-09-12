import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from './internal';
import '../styles/components/glass-drawer.css';

export interface GlassDrawerProps {
  open: boolean;
  title?: string;
  side?: 'left' | 'right';
  width?: string;
  closeOnScrim?: boolean;
  header?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
}

export function GlassDrawer({
  open,
  title,
  side = 'right',
  width = '20rem',
  closeOnScrim = true,
  header,
  children,
  onClose,
}: GlassDrawerProps) {
  const panel = useRef<HTMLElement>(null);
  const id = useId();
  useFocusTrap(open, panel, onClose);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="lu-drawer-scrim"
      onClick={event => { if (event.target === event.currentTarget && closeOnScrim) onClose?.(); }}
    >
      <aside
        ref={panel}
        className={`lu-drawer lu-glass-thick lu-drawer--${side}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id}-title` : undefined}
        style={{ width }}
      >
        {(title || header) && (
          <header className="lu-drawer-head">
            {header ?? <h2 id={`${id}-title`} className="lu-drawer-title">{title}</h2>}
          </header>
        )}
        <div className="lu-drawer-body">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
