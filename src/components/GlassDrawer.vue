<script setup lang="ts">
// An edge-anchored sliding panel on thick glass — filters, detail inspectors,
// mobile nav. Teleported over a scrim, focus-trapped, closes on Escape / scrim.
// `side` picks the edge. v-model:open controls visibility.
// Requires `import 'latere-ui/glass'`.
import { ref, watch, useId } from 'vue';
import { useFocusTrap } from '../glass/overlay';

const props = withDefaults(defineProps<{
  open: boolean;
  title?: string;
  side?: 'left' | 'right';
  width?: string;
  closeOnScrim?: boolean;
}>(), {
  side: 'right',
  width: '20rem',
  closeOnScrim: true,
});
const emit = defineEmits<{ (e: 'update:open', v: boolean): void; (e: 'close'): void }>();

const panel = ref<HTMLElement | null>(null);
const openRef = ref(props.open);
watch(() => props.open, (v) => (openRef.value = v));
const id = useId();

function close() {
  emit('update:open', false);
  emit('close');
}
useFocusTrap({ active: openRef, container: panel, onEscape: close });
function onScrim() { if (props.closeOnScrim) close(); }
</script>

<template>
  <Teleport to="body">
    <Transition :name="`lu-drawer-${side}`">
      <div v-if="open" class="lu-drawer-scrim" @click.self="onScrim">
        <aside
          ref="panel"
          class="lu-drawer lu-glass-thick"
          :class="`lu-drawer--${side}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? `${id}-title` : undefined"
          :style="{ width }"
        >
          <header v-if="title || $slots.header" class="lu-drawer-head">
            <slot name="header">
              <h2 :id="`${id}-title`" class="lu-drawer-title">{{ title }}</h2>
            </slot>
          </header>
          <div class="lu-drawer-body"><slot /></div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lu-drawer-scrim {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  background: var(--glass-dim, rgba(0, 0, 0, 0.28));
  -webkit-backdrop-filter: blur(2px);
          backdrop-filter: blur(2px);
}
.lu-drawer {
  height: 100%;
  max-width: 90vw;
  overflow-y: auto;
  border-radius: 0;
}
.lu-drawer--right {
  margin-left: auto;
  border-left: 1px solid var(--glass-border);
  border-radius: var(--radius-xl, 28px) 0 0 var(--radius-xl, 28px);
}
.lu-drawer--left {
  margin-right: auto;
  border-right: 1px solid var(--glass-border);
  border-radius: 0 var(--radius-xl, 28px) var(--radius-xl, 28px) 0;
}
.lu-drawer-head { padding: 18px 20px 6px; }
.lu-drawer-title { font-size: var(--fs-h3, 1.15rem); font-weight: var(--fw-semibold, 600); color: var(--text, #0a0a0a); }
.lu-drawer-body { padding: 12px 20px 20px; }

/* Scrim fades; panel slides from its edge. */
.lu-drawer-right-enter-active, .lu-drawer-right-leave-active,
.lu-drawer-left-enter-active, .lu-drawer-left-leave-active { transition: opacity 0.2s ease; }
.lu-drawer-right-enter-active .lu-drawer, .lu-drawer-right-leave-active .lu-drawer,
.lu-drawer-left-enter-active .lu-drawer, .lu-drawer-left-leave-active .lu-drawer { transition: transform 0.22s ease; }
.lu-drawer-right-enter-from, .lu-drawer-right-leave-to,
.lu-drawer-left-enter-from, .lu-drawer-left-leave-to { opacity: 0; }
.lu-drawer-right-enter-from .lu-drawer, .lu-drawer-right-leave-to .lu-drawer { transform: translateX(100%); }
.lu-drawer-left-enter-from .lu-drawer, .lu-drawer-left-leave-to .lu-drawer { transform: translateX(-100%); }
@media (prefers-reduced-motion: reduce) {
  .lu-drawer-right-enter-active, .lu-drawer-right-leave-active,
  .lu-drawer-left-enter-active, .lu-drawer-left-leave-active,
  .lu-drawer-right-enter-active .lu-drawer, .lu-drawer-right-leave-active .lu-drawer,
  .lu-drawer-left-enter-active .lu-drawer, .lu-drawer-left-leave-active .lu-drawer { transition: none; }
  .lu-drawer-right-enter-from .lu-drawer, .lu-drawer-right-leave-to .lu-drawer,
  .lu-drawer-left-enter-from .lu-drawer, .lu-drawer-left-leave-to .lu-drawer { transform: none; }
}
</style>
