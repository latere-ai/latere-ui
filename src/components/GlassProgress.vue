<script setup lang="ts">
// A determinate progress bar on a glass track. role=progressbar with the ARIA
// value attributes; clamps value to [0, max].
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  value: number;
  max?: number;
  label?: string;
}>(), { max: 100 });

const pct = computed(() => {
  const v = Math.max(0, Math.min(props.value, props.max));
  return props.max === 0 ? 0 : (v / props.max) * 100;
});
</script>

<template>
  <div
    class="lu-progress lu-glass-thin"
    role="progressbar"
    :aria-valuenow="value"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="label"
  >
    <span class="lu-progress-fill" :style="{ width: `${pct}%` }" />
  </div>
</template>

<style scoped>
.lu-progress {
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: none;
}
.lu-progress-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--accent, #171717);
  transition: width 0.24s ease;
}
@media (prefers-reduced-motion: reduce) { .lu-progress-fill { transition: none; } }
</style>
