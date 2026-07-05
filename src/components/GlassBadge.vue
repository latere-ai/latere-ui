<script setup lang="ts">
// A small status pill. `tone` maps to the product's --state-* tokens so status
// dots/badges harmonize with the theme. Thin glass by default; `solid` fills it.
import { computed } from 'vue';

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

<style scoped>
.lu-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 11px;
  border-radius: var(--radius-pill, 999px);
  font-size: var(--fs-micro, 12px);
  font-weight: var(--fw-medium, 500);
  line-height: 1.5;
  color: var(--tone);
  box-shadow: none;
}
.is-solid {
  background: var(--tone);
  color: var(--glass-smoke-ink, #fff);
  border: 1px solid transparent;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.lu-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
</style>
