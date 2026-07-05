<script setup lang="ts">
// A hover/focus tooltip on thick glass. Wrap a trigger in the default slot; the
// tip text comes from `text`. Shown on hover and keyboard focus (focus-within),
// so it is reachable without a pointer. Requires `import 'latere-ui/glass'`.
withDefaults(defineProps<{
  text: string;
  placement?: 'top' | 'bottom';
}>(), { placement: 'top' });
</script>

<template>
  <span class="lu-tip-wrap">
    <slot />
    <span class="lu-tip lu-glass-thick" :class="`lu-tip--${placement}`" role="tooltip">{{ text }}</span>
  </span>
</template>

<style scoped>
.lu-tip-wrap { position: relative; display: inline-flex; }
.lu-tip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(2px);
  z-index: 950;
  padding: 4px 8px;
  border-radius: var(--radius-sm, 6px);
  font-size: var(--fs-micro, 12px);
  color: var(--text, #0a0a0a);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.lu-tip--top { bottom: calc(100% + 6px); }
.lu-tip--bottom { top: calc(100% + 6px); }
.lu-tip-wrap:hover .lu-tip,
.lu-tip-wrap:focus-within .lu-tip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
@media (prefers-reduced-motion: reduce) { .lu-tip { transition: opacity 0.14s ease; } }
</style>
