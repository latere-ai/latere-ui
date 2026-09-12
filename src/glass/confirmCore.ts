import { createExternalStore } from './externalStore';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Style the confirm button as destructive. */
  danger?: boolean;
}

export interface ConfirmItem extends ConfirmOptions {
  readonly id: number;
}

interface PendingConfirm extends ConfirmItem {
  resolve: (ok: boolean) => void;
}

const EMPTY_CONFIRM = Object.freeze({ current: null });
export const confirmStore = createExternalStore<Readonly<{ current: Readonly<ConfirmItem> | null }>>(EMPTY_CONFIRM);
export const getServerConfirm = () => EMPTY_CONFIRM;
let current: PendingConfirm | null = null;
const queue: PendingConfirm[] = [];
let seq = 0;

function publish() {
  if (!current) { confirmStore.publish(EMPTY_CONFIRM); return; }
  const { resolve: _resolve, ...item } = current;
  confirmStore.publish(Object.freeze({ current: Object.freeze(item) }));
}

function next() {
  current = queue.shift() ?? null;
  publish();
}

/** Open a confirm dialog; resolves true on confirm, false on cancel. */
export function confirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const item: PendingConfirm = { ...opts, id: ++seq, resolve };
    if (current) queue.push(item);
    else { current = item; publish(); }
  });
}

/** Resolve the active dialog and advance the queue. Used by the host. */
export function resolveConfirm(ok: boolean): void {
  const c = current;
  if (!c) return;
  c.resolve(ok);
  next();
}
