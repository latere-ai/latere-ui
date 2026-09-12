<script setup lang="ts">
import '../styles/components/glass-icon-button.css';
// A square, icon-only glass button for toolbars. Requires an accessible label.
// Requires `import 'latere-ui/glass'`.
withDefaults(defineProps<{
  label: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Render as pressed (for toggles). */
  pressed?: boolean;
}>(), {
  size: 'md',
  disabled: false,
  pressed: false,
});
defineEmits<{ (e: 'click', ev: MouseEvent): void }>();
</script>

<template>
  <button
    type="button"
    class="lu-iconbtn lu-glass-ultrathin"
    :class="[`lu-iconbtn-${size}`, { 'is-pressed': pressed }]"
    :aria-label="label"
    :aria-pressed="pressed || undefined"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
