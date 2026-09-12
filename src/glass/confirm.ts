// Vue compatibility facade over the shared framework-free confirm queue.
import { reactive, readonly } from 'vue';
import { confirmStore, type ConfirmItem } from './confirmCore';
export { confirm, resolveConfirm } from './confirmCore';
export type { ConfirmOptions } from './confirmCore';

const state = reactive<{ current: Readonly<ConfirmItem> | null }>({ current: confirmStore.getSnapshot().current });
confirmStore.subscribe(() => { state.current = confirmStore.getSnapshot().current; });
/** The active dialog, retaining the existing Vue reactive object contract. */
export const currentConfirm = readonly(state);
