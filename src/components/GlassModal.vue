<script setup lang="ts">
// A modal dialog on thick glass, teleported to <body> over a scrim. Traps
// focus, closes on Escape / scrim click, restores focus on close, and is
// labeled for assistive tech (role=dialog, aria-modal, aria-labelledby).
// v-model:open controls visibility. Requires `import 'latere-ui/glass'`.
import { ref, watch, useId } from 'vue';
import { useFocusTrap } from '../glass/overlay';

const props = withDefaults(defineProps<{
  open: boolean;
  title?: string;
  /** Clicking the scrim closes the modal. */
  closeOnScrim?: boolean;
  /** Max width of the panel. */
  width?: string;
}>(), {
  closeOnScrim: true,
  width: '30rem',
});

const emit = defineEmits<{ (e: 'update:open', v: boolean): void; (e: 'close'): void }>();

const panel = ref<HTMLElement | null>(null);
const openRef = ref(props.open);
// Keep the local ref in sync with the prop for the focus trap.
watch(() => props.open, (v) => (openRef.value = v));

const id = useId();

function close() {
  emit('update:open', false);
  emit('close');
}
useFocusTrap({ active: openRef, container: panel, onEscape: close });

function onScrim() {
  if (props.closeOnScrim) close();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lu-modal">
      <div v-if="open" class="lu-modal-scrim" @click.self="onScrim">
        <div
          ref="panel"
          class="lu-modal lu-glass-thick"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? `${id}-title` : undefined"
          :style="{ maxWidth: width }"
        >
          <header v-if="title || $slots.header" class="lu-modal-head">
            <slot name="header">
              <h2 :id="`${id}-title`" class="lu-modal-title">{{ title }}</h2>
            </slot>
          </header>
          <div class="lu-modal-body"><slot /></div>
          <footer v-if="$slots.footer" class="lu-modal-foot">
            <slot name="footer" :close="close" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lu-modal-scrim {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--glass-dim, rgba(0, 0, 0, 0.28));
  -webkit-backdrop-filter: blur(2px);
          backdrop-filter: blur(2px);
}
.lu-modal {
  width: 100%;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  border-radius: var(--radius-2xl, 16px);
  padding: 0;
}
.lu-modal-head { padding: 18px 20px 0; }
.lu-modal-title {
  font-size: var(--fs-h3, 1.15rem);
  font-weight: var(--fw-semibold, 600);
  color: var(--text, #0a0a0a);
}
.lu-modal-body { padding: 14px 20px; color: var(--text-secondary, #666); }
.lu-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 20px 18px;
}
.lu-modal-enter-active, .lu-modal-leave-active { transition: opacity 0.18s ease; }
.lu-modal-enter-active .lu-modal, .lu-modal-leave-active .lu-modal {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.lu-modal-enter-from, .lu-modal-leave-to { opacity: 0; }
.lu-modal-enter-from .lu-modal, .lu-modal-leave-to .lu-modal {
  transform: translateY(8px) scale(0.98);
}
@media (prefers-reduced-motion: reduce) {
  .lu-modal-enter-active, .lu-modal-leave-active,
  .lu-modal-enter-active .lu-modal, .lu-modal-leave-active .lu-modal { transition: none; }
  .lu-modal-enter-from .lu-modal, .lu-modal-leave-to .lu-modal { transform: none; }
}
</style>
