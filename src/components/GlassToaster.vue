<script setup lang="ts">
// Host for the imperative message() service. Mount ONCE near the app root:
//   <GlassToaster />
// It teleports a stack of glass toasts to <body>. Requires 'latere-ui/glass'.
import { toasts, dismissToast, type MessageTone } from '../glass/message';

const TONE_VAR: Record<MessageTone, string> = {
  info: 'var(--accent, #171717)',
  success: 'var(--state-running, #4a7558)',
  warning: 'var(--state-idle, #b48a4a)',
  error: 'var(--state-error, #a8412e)',
};
</script>

<template>
  <Teleport to="body">
    <div class="lu-toaster" role="region" aria-label="Notifications" aria-live="polite">
      <TransitionGroup name="lu-toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="lu-toast lu-glass-thick"
          :role="t.tone === 'error' ? 'alert' : 'status'"
          :style="{ '--tone': TONE_VAR[t.tone] }"
          @click="dismissToast(t.id)"
        >
          <span class="lu-toast-bar" aria-hidden="true" />
          <span class="lu-toast-text">{{ t.text }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.lu-toaster {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--lu-z-toast, 1300);
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.lu-toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
  max-width: 420px;
  padding: 10px 14px;
  border-radius: var(--radius-pill, 999px);
  cursor: pointer;
  color: var(--text, #0a0a0a);
}
.lu-toast-bar {
  flex: none;
  width: 6px;
  height: 6px;
  align-self: center;
  border-radius: 50%;
  background: var(--tone);
}
.lu-toast-text { font-size: var(--fs-body-sm, 13px); }
.lu-toast-enter-active, .lu-toast-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.lu-toast-enter-from, .lu-toast-leave-to { opacity: 0; transform: translateY(-8px); }
@media (prefers-reduced-motion: reduce) {
  .lu-toast-enter-active, .lu-toast-leave-active { transition: none; }
  .lu-toast-enter-from, .lu-toast-leave-to { transform: none; }
}
</style>
