// GlassModal: a modal dialog on thick glass, portaled to
// <body> over a scrim. Traps focus, closes on Escape / scrim click, restores
// focus on close, and is labeled for assistive tech: by the title, by
// `labelledBy`, or by a custom `header` when it stands alone. Controlled through
// `open` and `onClose`. Requires `import 'latere-ui/glass'`.
import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/glass-modal.css';
import { cx, dialogName, useFocusTrap, useScrimDismiss } from './internal';
import { useCssTransition } from './useCssTransition';

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
  /** Id of the element that names the dialog, when neither `title` nor `header` does. */
  labelledBy?: string;
  /** Id of the element that describes the dialog. */
  describedBy?: string;
  /**
   * Custom header: the `header` slot; defaults to the titled <h2>. With a
   * `title` too, the title is the dialog's accessible name; alone, the header's
   * content is.
   */
  header?: ReactNode;
  /** Footer content: the `footer` slot (receives `close`). */
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
  labelledBy,
  describedBy,
  header,
  footer,
  children,
  onClose,
}: GlassModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const present = useCssTransition(open, 'lu-modal', scrim);
  const id = useId();

  function close() {
    onClose?.();
  }
  useFocusTrap(open, panel, close);

  const scrimHandlers = useScrimDismiss(closeOnScrim, close);

  if (!present || typeof document === 'undefined') return null;

  return createPortal(
    <div ref={scrim} className={cx('lu-modal-scrim', `lu-modal-scrim--${layer}`)} {...scrimHandlers}>
      <div
        ref={panel}
        className="lu-modal lu-glass-thick"
        role="dialog"
        aria-modal="true"
        {...dialogName(id, { title, header, labelledBy })}
        aria-describedby={describedBy}
        style={{ maxWidth: width }}
      >
        {(title || header) && (
          <header id={header ? `${id}-head` : undefined} className="lu-modal-head">
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
