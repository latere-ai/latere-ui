<script setup lang="ts">
// A modal dialog on thick glass, teleported to <body> over a scrim. Traps
// focus, closes on Escape / scrim click, restores focus on close, and is
// labeled for assistive tech (role=dialog, aria-modal, aria-labelledby).
// v-model:open controls visibility. Requires `import 'latere-ui/glass'`.
import { ref, watch, useId } from 'vue';
import { useFocusTrap } from '../glass/overlay';
import '../styles/components/glass-modal.css';

const props = withDefaults(defineProps<{
  open: boolean;
  title?: string;
  /** Clicking the scrim closes the modal. */
  closeOnScrim?: boolean;
  /** Max width of the panel. */
  width?: string;
  /**
   * Stacking layer. 'confirm' floats above content modals (--lu-z-confirm
   * vs --lu-z-modal) so a confirm dialog raised while a modal is open is
   * never occluded by it. Used by GlassConfirmHost.
   */
  layer?: 'modal' | 'confirm';
}>(), {
  closeOnScrim: true,
  width: '30rem',
  layer: 'modal',
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
      <div
        v-if="open"
        class="lu-modal-scrim"
        :class="`lu-modal-scrim--${layer}`"
        @click.self="onScrim"
      >
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
