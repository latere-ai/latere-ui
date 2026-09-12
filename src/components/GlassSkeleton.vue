<script setup lang="ts">
import '../styles/components/glass-skeleton.css';
// A loading placeholder with a subtle shimmer. Set width/height/radius to match
// the content it stands in for. Shimmer stops under reduced motion.
withDefaults(defineProps<{
  width?: string;
  height?: string;
  radius?: string;
  /** Circle placeholder (avatars) — overrides radius. */
  circle?: boolean;
}>(), {
  width: '100%',
  height: '1em',
  radius: 'var(--radius-sm, 6px)',
  circle: false,
});
</script>

<template>
  <span
    class="lu-skeleton"
    aria-hidden="true"
    :style="{ width, height, borderRadius: circle ? '50%' : radius }"
  />
</template>
