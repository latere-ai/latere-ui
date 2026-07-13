<script setup lang="ts">
// An indeterminate loading spinner. Announces itself to assistive tech; slows
// (never stops) under reduced motion so it still reads as "busy".
import '../styles/components/glass-spinner.css';

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

