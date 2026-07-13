<script setup lang="ts">
// A small status pill. `tone` maps to the product's --state-* tokens so status
// dots/badges harmonize with the theme. Thin glass by default; `solid` fills it.
import { computed } from 'vue';
import '../styles/components/glass-badge.css';

const props = withDefaults(defineProps<{
  tone?: 'neutral' | 'running' | 'idle' | 'stopped' | 'error' | 'creating';
  /** Filled pill instead of glass — for high-emphasis status. */
  solid?: boolean;
  /** Show a leading status dot. */
  dot?: boolean;
}>(), {
  tone: 'neutral',
  solid: false,
  dot: false,
});

const TONE_VAR: Record<string, string> = {
  neutral: 'var(--text-muted, #a0a0a0)',
  running: 'var(--state-running, #4a7558)',
  idle: 'var(--state-idle, #b48a4a)',
  stopped: 'var(--state-stopped, #92948c)',
  error: 'var(--state-error, #a8412e)',
  creating: 'var(--state-creating, #8fb894)',
};
const color = computed(() => TONE_VAR[props.tone] ?? TONE_VAR.neutral);
</script>

<template>
  <span
    class="lu-badge"
    :class="[{ 'lu-glass-ultrathin': !solid, 'is-solid': solid }]"
    :style="{ '--tone': color }"
  >
    <span v-if="dot" class="lu-badge-dot" aria-hidden="true" />
    <slot />
  </span>
</template>

