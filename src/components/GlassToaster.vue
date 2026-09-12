<script setup lang="ts">
import '../styles/components/glass-toaster.css';
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
          <button class="lu-toast-dismiss" type="button" aria-label="Dismiss notification" @click.stop="dismissToast(t.id)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 3 6 6M9 3 3 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
