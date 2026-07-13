// React adapter of GlassModal.vue — a modal dialog on thick glass, portaled to
// <body> over a scrim. Traps focus, closes on Escape / scrim click, restores
// focus on close, and is labeled for assistive tech. `open` + `onClose`
// replace v-model:open. Requires `import 'latere-ui/glass'`.
import { useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/glass-modal.css';
import { cx, useFocusTrap } from './internal';

export interface GlassModalProps {
  open: boolean;
  title?: string;
  /** Clicking the scrim closes the modal. */
  closeOnScrim?: boolean;
  /** Max width of the panel. */
  width?: string;
  /**
   * Stacking layer. 'confirm' floats above content modals (--lu-z-confirm
   * vs --lu-z-modal) so a confirm dialog raised while a modal is open is
   * never occluded by it.
   */
  layer?: 'modal' | 'confirm';
  /** Custom header — the `header` slot; defaults to the titled <h2>. */
  header?: ReactNode;
  /** Footer content — the `footer` slot (receives `close`). */
  footer?: ReactNode | ((close: () => void) => ReactNode);
  children?: ReactNode;
  /** Called when the modal asks to close (Escape, scrim, footer `close`). */
  onClose?: () => void;
}

export function GlassModal({
  open,
  title,
  closeOnScrim = true,
  width = '30rem',
  layer = 'modal',
  header,
  footer,
  children,
  onClose,
}: GlassModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  function close() {
    onClose?.();
  }
  useFocusTrap(open, panel, close);

  function onScrim(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && closeOnScrim) close();
  }

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className={cx('lu-modal-scrim', `lu-modal-scrim--${layer}`)} onClick={onScrim}>
      <div
        ref={panel}
        className="lu-modal lu-glass-thick"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id}-title` : undefined}
        style={{ maxWidth: width }}
      >
        {(title || header) && (
          <header className="lu-modal-head">
            {header ?? (
              <h2 id={`${id}-title`} className="lu-modal-title">
                {title}
              </h2>
            )}
          </header>
        )}
        <div className="lu-modal-body">{children}</div>
        {footer != null && (
          <footer className="lu-modal-foot">
            {typeof footer === 'function' ? footer(close) : footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
