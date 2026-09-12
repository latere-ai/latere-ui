// Vue compatibility facade over the shared framework-free message service.
import { reactive, readonly } from 'vue';
import { toastStore, type ToastItem } from './messageCore';
export { message, dismissToast } from './messageCore';
export type { MessageTone, MessageOptions, ToastItem } from './messageCore';

const items = reactive<ToastItem[]>([...toastStore.getSnapshot()]);
toastStore.subscribe(() => items.splice(0, items.length, ...toastStore.getSnapshot()));
/** The live toast queue, retaining its stable Vue reactive array identity. */
export const toasts = readonly(items);
