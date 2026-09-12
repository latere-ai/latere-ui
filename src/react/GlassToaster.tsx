import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { toastStore, getServerToasts, dismissToast, type MessageTone, type ToastItem } from '../glass/messageCore';
import '../styles/components/glass-toaster.css';
import { useCssTransition } from './useCssTransition';

const TONE_VAR: Record<MessageTone, string> = {
  info: 'var(--accent, #171717)',
  success: 'var(--state-running, #4a7558)',
  warning: 'var(--state-idle, #b48a4a)',
  error: 'var(--state-error, #a8412e)',
};

interface ToastEntry { toast: ToastItem; active: boolean; appear: boolean }

function ToastRow({ entry, onExited }: { entry: ToastEntry; onExited: (id: number) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const { toast, active, appear } = entry;
  const present = useCssTransition(active, 'lu-toast', root, appear);
  useEffect(() => { if (!present) onExited(toast.id); }, [present, toast.id, onExited]);
  if (!present) return null;
  return <div
    ref={root}
    className="lu-toast lu-glass-thick"
    role={toast.tone === 'error' ? 'alert' : 'status'}
    style={{ '--tone': TONE_VAR[toast.tone] } as CSSProperties}
    onClick={() => dismissToast(toast.id)}
  >
    <span className="lu-toast-bar" aria-hidden="true" />
    <span className="lu-toast-text">{toast.text}</span>
    <button className="lu-toast-dismiss" type="button" aria-label="Dismiss notification" onClick={event => { event.stopPropagation(); dismissToast(toast.id); }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    </button>
  </div>;
}

/** Mount once near the app root to render the shared message queue. */
export function GlassToaster() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, getServerToasts);
  const [entries, setEntries] = useState<ToastEntry[]>(() => toasts.map(toast => ({ toast, active: true, appear: false })));
  useLayoutEffect(() => {
    setEntries(previous => {
      const ids = new Set(toasts.map(toast => toast.id));
      const retained = previous.map(entry => ({ ...entry, active: ids.has(entry.toast.id) }));
      const previousIds = new Set(previous.map(entry => entry.toast.id));
      return [...retained, ...toasts.filter(toast => !previousIds.has(toast.id)).map(toast => ({ toast, active: true, appear: true }))];
    });
  }, [toasts]);
  const remove = useCallback((id: number) => setEntries(previous => previous.filter(entry => entry.toast.id !== id)), []);
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="lu-toaster" role="region" aria-label="Notifications" aria-live="polite">
      {entries.map(entry => <ToastRow key={entry.toast.id} entry={entry} onExited={remove} />)}
    </div>,
    document.body,
  );
}
