import { createExternalStore } from './externalStore';

export type MessageTone = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: number;
  tone: MessageTone;
  text: string;
  /** ms before auto-dismiss; 0 keeps it until closed. */
  duration: number;
}

export interface MessageOptions {
  duration?: number;
}

const EMPTY_TOASTS: readonly ToastItem[] = Object.freeze([]);
export const toastStore = createExternalStore<readonly ToastItem[]>(EMPTY_TOASTS);
/** Empty server snapshot; the service remains safe to import without a DOM. */
export const getServerToasts = () => EMPTY_TOASTS;
let seq = 0;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

export function dismissToast(id: number): void {
  const items = toastStore.getSnapshot();
  if (items.some((t) => t.id === id)) toastStore.publish(Object.freeze(items.filter((t) => t.id !== id)));
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

function push(tone: MessageTone, text: string, opts: MessageOptions = {}): () => void {
  const id = ++seq;
  const duration = opts.duration ?? 4000;
  toastStore.publish(Object.freeze([...toastStore.getSnapshot(), Object.freeze({ id, tone, text, duration })]));
  if (duration > 0 && typeof setTimeout === 'function') {
    timers.set(id, setTimeout(() => dismissToast(id), duration));
  }
  return () => dismissToast(id);
}

/** `message('success', 'Saved')` / `message.error('Failed')`. Returns a closer. */
export const message = Object.assign(
  (tone: MessageTone, text: string, opts?: MessageOptions) => push(tone, text, opts),
  {
    info: (text: string, opts?: MessageOptions) => push('info', text, opts),
    success: (text: string, opts?: MessageOptions) => push('success', text, opts),
    warning: (text: string, opts?: MessageOptions) => push('warning', text, opts),
    error: (text: string, opts?: MessageOptions) => push('error', text, opts),
    /** Clear every visible toast. */
    clear: () => {
      toastStore.publish(EMPTY_TOASTS);
      timers.forEach(clearTimeout);
      timers.clear();
    },
  },
);
