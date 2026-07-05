// Imperative confirm/alert dialog backing GlassConfirmHost. Mount
// <GlassConfirmHost/> once; call `confirm({ title, message })` anywhere to get a
// Promise<boolean>. One dialog at a time; concurrent calls queue.
import { reactive, readonly } from 'vue';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Style the confirm button as destructive. */
  danger?: boolean;
}

interface PendingConfirm extends ConfirmOptions {
  id: number;
  resolve: (ok: boolean) => void;
}

const state = reactive<{ current: PendingConfirm | null }>({ current: null });
const queue: PendingConfirm[] = [];
let seq = 0;

/** The dialog currently shown (read-only) — GlassConfirmHost renders it. */
export const currentConfirm = readonly(state);

function next() {
  state.current = queue.shift() ?? null;
}

/** Open a confirm dialog; resolves true on confirm, false on cancel. */
export function confirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const item: PendingConfirm = { ...opts, id: ++seq, resolve };
    if (state.current) queue.push(item);
    else state.current = item;
  });
}

/** Resolve the active dialog and advance the queue. Used by the host. */
export function resolveConfirm(ok: boolean): void {
  const c = state.current;
  if (!c) return;
  c.resolve(ok);
  next();
}
