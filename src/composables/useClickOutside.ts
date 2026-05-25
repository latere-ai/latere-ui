import { onMounted, onUnmounted, type Ref } from 'vue';

// Close-on-outside-click + Escape, shared by the dropdown menus. Listeners are
// attached in onMounted only, so this is safe under SSR (no document at module
// scope).
export function useClickOutside(
  rootRef: Ref<HTMLElement | null>,
  isOpen: () => boolean,
  close: () => void,
) {
  function onDoc(e: MouseEvent) {
    if (!isOpen()) return;
    if (rootRef.value && !rootRef.value.contains(e.target as Node)) close();
  }
  function onKey(e: KeyboardEvent) {
    if (isOpen() && e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }
  onMounted(() => {
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
  });
  onUnmounted(() => {
    document.removeEventListener('mousedown', onDoc);
    document.removeEventListener('keydown', onKey);
  });
}
