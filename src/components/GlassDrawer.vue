<script setup lang="ts">
import '../styles/components/glass-drawer.css';
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
