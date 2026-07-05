// Imperative toast/message service backing GlassToast/GlassToaster. Mirrors the
// familiar `message.success(...)` shape. The app mounts <GlassToaster/> once;
// calls anywhere push onto a shared reactive queue. SSR-safe: pushing without a
// mounted host simply no-ops visually (the queue still updates, harmless).
import { reactive, readonly } from 'vue';

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

const state = reactive<{ toasts: ToastItem[] }>({ toasts: [] });
let seq = 0;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

/** The live toast queue (read-only) — GlassToaster renders it. */
export const toasts = readonly(state.toasts);

export function dismissToast(id: number): void {
  const i = state.toasts.findIndex((t) => t.id === id);
  if (i !== -1) state.toasts.splice(i, 1);
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

function push(tone: MessageTone, text: string, opts: MessageOptions = {}): () => void {
  const id = ++seq;
  const duration = opts.duration ?? 4000;
  state.toasts.push({ id, tone, text, duration });
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
      state.toasts.splice(0, state.toasts.length);
      timers.forEach(clearTimeout);
      timers.clear();
    },
  },
);
