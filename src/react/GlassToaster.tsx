import { useSyncExternalStore, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { toastStore, getServerToasts, dismissToast, type MessageTone } from '../glass/messageCore';
import '../styles/components/glass-toaster.css';

const TONE_VAR: Record<MessageTone, string> = {
  info: 'var(--accent, #171717)',
  success: 'var(--state-running, #4a7558)',
  warning: 'var(--state-idle, #b48a4a)',
  error: 'var(--state-error, #a8412e)',
};

/** Mount once near the app root to render the shared message queue. */
export function GlassToaster() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, getServerToasts);
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="lu-toaster" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className="lu-toast lu-glass-thick"
          role={t.tone === 'error' ? 'alert' : 'status'}
          style={{ '--tone': TONE_VAR[t.tone] } as CSSProperties}
          onClick={() => dismissToast(t.id)}
        >
          <span className="lu-toast-bar" aria-hidden="true" />
          <span className="lu-toast-text">{t.text}</span>
        </div>
      ))}
    </div>,
    document.body,
  );
}
