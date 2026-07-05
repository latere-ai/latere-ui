<script setup lang="ts">
// An inline notice banner on a regular-glass surface, with a tone accent bar
// and optional dismiss. For transient notifications use the `message()` toast
// service instead. Requires `import 'latere-ui/glass'`.
import { computed } from 'vue';

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

<style scoped>
.lu-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-lg, 10px);
  border-left: 3px solid var(--tone);
  color: var(--text, #0a0a0a);
}
.lu-alert-body { flex: 1; min-width: 0; }
.lu-alert-title {
  font-weight: var(--fw-semibold, 600);
  font-size: var(--fs-body-sm, 13px);
  color: var(--tone);
  margin-bottom: 2px;
}
.lu-alert-text { font-size: var(--fs-body-sm, 13px); color: var(--text-secondary, #666); }
.lu-alert-close {
  flex: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: var(--text-muted, #a0a0a0);
  padding: 0 2px;
}
.lu-alert-close:hover { color: var(--text, #0a0a0a); }
.lu-alert-close:focus-visible { outline: 2px solid var(--accent, #171717); outline-offset: 2px; }
</style>
