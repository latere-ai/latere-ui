<script setup lang="ts">
import '../styles/components/glass-tooltip.css';
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
    <span class="lu-tip lu-glass-smoke" :class="`lu-tip--${placement}`" role="tooltip">{{ text }}</span>
  </span>
</template>
