<script setup lang="ts">
// A floating thick-glass surface anchored to a trigger — dropdown menus, the
// command palette, filter panels. Toggles on trigger click, closes on outside
// click / Escape (via useClickOutside). `placement` picks the side.
// Requires `import 'latere-ui/glass'`.
import { ref, computed } from 'vue';
import { useClickOutside } from '../composables/useClickOutside';

const props = withDefaults(defineProps<{
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** Match the panel width to the trigger. */
  matchWidth?: boolean;
}>(), {
  placement: 'bottom-start',
  matchWidth: false,
});

const root = ref<HTMLElement | null>(null);
const open = ref(false);
function toggle() { open.value = !open.value; }
function close() { open.value = false; }
useClickOutside(root, () => open.value, close);

const panelClass = computed(() => `lu-pop-panel--${props.placement}`);
</script>

<template>
  <div ref="root" class="lu-pop">
    <div class="lu-pop-trigger" @click="toggle">
      <slot name="trigger" :open="open" :toggle="toggle" />
    </div>
    <Transition name="lu-pop">
      <div
        v-if="open"
        class="lu-pop-panel lu-glass-thick"
        :class="[panelClass, { 'lu-pop-panel--match': matchWidth }]"
        role="menu"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.lu-pop { position: relative; display: inline-block; }
.lu-pop-panel {
  position: absolute;
  z-index: var(--lu-z-popover, 900);
  min-width: 180px;
  padding: 6px;
  border-radius: var(--radius-md, 16px);
}
.lu-pop-panel--match { min-width: 100%; }
.lu-pop-panel--bottom-start { top: calc(100% + 6px); left: 0; }
.lu-pop-panel--bottom-end   { top: calc(100% + 6px); right: 0; }
.lu-pop-panel--top-start    { bottom: calc(100% + 6px); left: 0; }
.lu-pop-panel--top-end      { bottom: calc(100% + 6px); right: 0; }
.lu-pop-enter-active, .lu-pop-leave-active { transition: opacity 0.14s ease, transform 0.14s ease; }
.lu-pop-enter-from, .lu-pop-leave-to { opacity: 0; transform: translateY(-4px); }
@media (prefers-reduced-motion: reduce) {
  .lu-pop-enter-active, .lu-pop-leave-active { transition: none; }
  .lu-pop-enter-from, .lu-pop-leave-to { transform: none; }
}
</style>
