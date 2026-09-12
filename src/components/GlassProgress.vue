<script setup lang="ts">
import '../styles/components/glass-progress.css';
// A determinate progress bar on a glass track. role=progressbar with the ARIA
// value attributes; clamps value to [0, max].
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  value: number;
  max?: number;
  label?: string;
}>(), { max: 100 });

const clamped = computed(() => Math.max(0, Math.min(props.value, props.max)));
const pct = computed(() => props.max === 0 ? 0 : (clamped.value / props.max) * 100);
</script>

<template>
  <div
    class="lu-progress lu-glass-ultrathin"
    role="progressbar"
    :aria-valuenow="clamped"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="label"
  >
    <span class="lu-progress-fill" :style="{ width: `${pct}%` }" />
  </div>
</template>
