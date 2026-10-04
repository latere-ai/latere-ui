<script setup lang="ts">
// An action control in the one control shape, a capsule. The default variant
// is the secondary action, a hairline outline; `primary` is the ink fill,
// `ghost` a bare label, `danger` the confirming destructive fill and
// `danger-ghost` a destructive bare label. Flat: no glass material, blur or
// shadow (glass-button.css).
import '../styles/components/glass-button.css';

const props = withDefaults(defineProps<{
  /** `glass` (the default) is the secondary action, a hairline outline;
   *  `primary` the ink fill; `ghost` a bare label. */
  variant?: 'glass' | 'primary' | 'ghost' | 'danger' | 'danger-ghost';
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

function onClick(ev: MouseEvent) {
  if (props.disabled || props.loading) return;
  emit('click', ev);
}
</script>

<template>
  <button
    :type="type"
    class="lu-btn"
    :class="[`lu-btn-${variant}`, `lu-btn-${size}`, { 'is-loading': loading }]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <span v-if="loading" class="lu-btn-spin" aria-hidden="true" />
    <slot name="icon" />
    <span class="lu-btn-label"><slot /></span>
  </button>
</template>
