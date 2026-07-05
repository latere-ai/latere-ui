<script setup lang="ts">
// An indeterminate loading spinner. Announces itself to assistive tech; slows
// (never stops) under reduced motion so it still reads as "busy".
withDefaults(defineProps<{
  size?: number;
  label?: string;
}>(), { size: 20, label: 'Loading' });
</script>

<template>
  <span
    class="lu-spinner"
    role="status"
    :aria-label="label"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
</template>

<style scoped>
.lu-spinner {
  display: inline-block;
  border: 2px solid var(--accent-glow, rgba(0, 0, 0, 0.12));
  border-top-color: var(--accent, #171717);
  border-radius: 50%;
  animation: lu-spin 0.65s linear infinite;
}
@keyframes lu-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .lu-spinner { animation-duration: 1.4s; } }
</style>
