<script setup lang="ts">
// A glass action control. Capsule-shaped (Apple's control shape); the default
// variant is thin glass, `primary` is a prominent accent fill, `danger` is
// destructive. Composes the material so it inherits the a11y fallbacks.
// Requires `import 'latere-ui/glass'`.
import { computed } from 'vue';
import '../styles/components/glass-button.css';

const props = withDefaults(defineProps<{
  variant?: 'glass' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  /** Show a spinner and block interaction. */
  loading?: boolean;
  disabled?: boolean;
  /** Native button type; defaults to "button" so it never submits by accident. */
  type?: 'button' | 'submit' | 'reset';
}>(), {
  variant: 'glass',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
});

const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>();

// Only the default variant paints itself as glass; primary/ghost/danger own
// their fill so they read as distinct affordances against a glass panel.
const glassy = computed(() => props.variant === 'glass');

function onClick(ev: MouseEvent) {
  if (props.disabled || props.loading) return;
  emit('click', ev);
}
</script>

<template>
  <button
    :type="type"
    class="lu-btn"
    :class="[`lu-btn-${variant}`, `lu-btn-${size}`, { 'lu-glass-thin': glassy, 'is-loading': loading }]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <span v-if="loading" class="lu-btn-spin" aria-hidden="true" />
    <slot name="icon" />
    <span class="lu-btn-label"><slot /></span>
  </button>
</template>
