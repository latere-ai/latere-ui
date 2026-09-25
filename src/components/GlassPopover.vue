<script setup lang="ts">
import '../styles/components/glass-popover.css';
// A floating surface anchored to a trigger: dropdown menus, the command
// palette, filter panels. Toggles on trigger click, closes on outside click
// and Escape (via useClickOutside and the panel's keydown), and returns
// focus to the trigger when it closes from inside. Focus leaving the popover
// closes it too. ArrowDown/ArrowUp on a closed trigger open it, as on a menu
// button. `placement` picks the side.
//
// The panel carries no role of its own: its content declares one (GlassMenu
// is role=menu), so a menu inside the panel is announced once, not nested in
// a second menu. The trigger slot receives the panel `id` for aria-controls.
//
// `surface` picks the material: `glass` (thick Liquid Glass, requires
// `import 'latere-ui/glass'`) or `solid`, an opaque menu surface with a
// hairline border and the menu shadow that needs no glass layer.
import { ref, computed, useId } from 'vue';
import { useClickOutside } from '../composables/useClickOutside';

const props = withDefaults(defineProps<{
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** Match the panel width to the trigger. */
  matchWidth?: boolean;
  surface?: 'glass' | 'solid';
}>(), {
  placement: 'bottom-start',
  matchWidth: false,
  surface: 'glass',
});

const root = ref<HTMLElement | null>(null);
const open = ref(false);
const id = `${useId()}-panel`;
function toggle() { open.value = !open.value; }
function focusTrigger() {
  root.value?.querySelector<HTMLElement>('.lu-pop-trigger button:not(:disabled), .lu-pop-trigger a[href], .lu-pop-trigger [tabindex]')?.focus();
}
function close(restoreFocus = true) {
  if (restoreFocus && root.value?.querySelector('.lu-pop-panel')?.contains(document.activeElement)) focusTrigger();
  open.value = false;
}
useClickOutside(root, () => open.value, () => close(false));
function onKey(event: KeyboardEvent) {
  const inPanel = !!(event.target as Element | null)?.closest?.('.lu-pop-panel');
  if (open.value && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
  // Shift+Tab leaves backwards through the trigger: focus returns there
  // first, and the browser moves on to the element before it.
  else if (open.value && inPanel && event.key === 'Tab' && event.shiftKey) close();
  else if (!open.value && !inPanel && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) { event.preventDefault(); open.value = true; }
}
// Focus that moves to another element outside the popover, by Tab past a
// menu's single tab stop or by any other route, closes it. Focus falling to
// the document (a click on the panel's padding) keeps it open; an outside
// click closes it through useClickOutside.
function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null;
  if (open.value && next && !root.value?.contains(next)) close(false);
}

const panelClass = computed(() => [
  props.surface === 'solid' ? 'lu-pop-panel--solid' : 'lu-glass-thick',
  `lu-pop-panel--${props.placement}`,
  { 'lu-pop-panel--match': props.matchWidth },
]);
</script>

<template>
  <div ref="root" class="lu-pop" @keydown="onKey" @focusout="onFocusOut">
    <div class="lu-pop-trigger" @click="toggle">
      <slot name="trigger" :open="open" :toggle="toggle" :id="id" />
    </div>
    <Transition name="lu-pop">
      <div v-if="open" :id="id" class="lu-pop-panel" :class="panelClass">
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>
