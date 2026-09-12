<script setup lang="ts">
import '../styles/components/glass-popover.css';
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
