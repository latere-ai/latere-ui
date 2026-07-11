<script setup lang="ts">
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

<style scoped>
.lu-iconbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill, 999px);
  color: var(--text-secondary, #666);
  cursor: pointer;
  box-shadow: none;
  transition: color 0.16s ease, background 0.16s ease;
}
.lu-iconbtn-md { width: 36px; height: 36px; }
.lu-iconbtn-sm { width: 28px; height: 28px; }
.lu-iconbtn:hover { color: var(--text, #0a0a0a); }
.lu-iconbtn.is-pressed { color: var(--accent, #171717); }
.lu-iconbtn:disabled { opacity: 0.45; cursor: not-allowed; }
.lu-iconbtn:focus-visible { outline: var(--focus-outline, 2px solid var(--accent, #171717)); outline-offset: 2px; }
:slotted(svg) { width: 1.05em; height: 1.05em; }
@media (prefers-reduced-motion: reduce) { .lu-iconbtn { transition: none; } }
</style>
