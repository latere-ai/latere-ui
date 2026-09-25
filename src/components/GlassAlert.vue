<script setup lang="ts">
// An inline notice: a leading tone icon, then the title and the body on one
// left edge, inside a hairline frame with a faint wash of the tone, and an
// optional dismiss. For transient notifications use the `message()` toast
// service instead. Requires `import 'latere-ui/glass'`.
import { computed } from 'vue';
import '../styles/components/glass-alert.css';
import ConsoleIcon from './ConsoleIcon.vue';
import { ALERT_TONE_ICON, ALERT_TONE_VAR, alertRole, alertTone, type GlassAlertTone } from './glassAlert';

const props = withDefaults(defineProps<{
  tone?: GlassAlertTone;
  title?: string;
  /** Show a close button; emits `dismiss`. */
  dismissible?: boolean;
}>(), {
  tone: 'info',
  dismissible: false,
});

defineEmits<{ (e: 'dismiss'): void }>();

const tone = computed(() => alertTone(props.tone));
const role = computed(() => alertRole(tone.value));
</script>

<template>
  <div class="lu-alert lu-glass" :role="role" :data-tone="tone" :style="{ '--tone': ALERT_TONE_VAR[tone] }">
    <span class="lu-alert-icon" aria-hidden="true"><ConsoleIcon :name="ALERT_TONE_ICON[tone]" :size="16" /></span>
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
