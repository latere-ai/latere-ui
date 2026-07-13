<script setup lang="ts">
// An inline notice banner on a regular-glass surface, with a tone accent bar
// and optional dismiss. For transient notifications use the `message()` toast
// service instead. Requires `import 'latere-ui/glass'`.
import { computed } from 'vue';
import '../styles/components/glass-alert.css';

const props = withDefaults(defineProps<{
  tone?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  /** Show a close button; emits `dismiss`. */
  dismissible?: boolean;
}>(), {
  tone: 'info',
  dismissible: false,
});

defineEmits<{ (e: 'dismiss'): void }>();

const TONE_VAR: Record<string, string> = {
  info: 'var(--accent, #171717)',
  success: 'var(--state-running, #4a7558)',
  warning: 'var(--state-idle, #b48a4a)',
  error: 'var(--state-error, #a8412e)',
};
const accent = computed(() => TONE_VAR[props.tone] ?? TONE_VAR.info);
const role = computed(() => (props.tone === 'error' ? 'alert' : 'status'));
</script>

<template>
  <div class="lu-alert lu-glass" :role="role" :style="{ '--tone': accent }">
    <div class="lu-alert-body">
      <p v-if="title" class="lu-alert-title">{{ title }}</p>
      <div class="lu-alert-text"><slot /></div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="lu-alert-close"
      aria-label="Dismiss"
      @click="$emit('dismiss')"
    >×</button>
  </div>
</template>
