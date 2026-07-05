<script setup lang="ts">
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

<style scoped>
.lu-skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--bg-raised, #ececec) 25%,
    var(--bg-code, #f4f4f4) 37%,
    var(--bg-raised, #ececec) 63%
  );
  background-size: 400% 100%;
  animation: lu-shimmer 1.4s ease infinite;
}
@keyframes lu-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
@media (prefers-reduced-motion: reduce) {
  .lu-skeleton { animation: none; }
}
</style>
