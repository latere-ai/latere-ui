<script setup lang="ts">
// A labeled input shell in thin glass. Wraps <input>/<textarea>; the control
// sits on a thin-glass fill with an accent focus ring. v-model via modelValue.
// Requires `import 'latere-ui/glass'`.
import { computed, useId } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: string;
  label?: string;
  /** Validation message; renders below and flags the field invalid. */
  error?: string;
  type?: string;
  placeholder?: string;
  /** Render a multi-line <textarea> instead of an <input>. */
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
}>(), {
  modelValue: '',
  type: 'text',
  multiline: false,
  rows: 3,
  disabled: false,
});

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const id = useId();
const describedBy = computed(() => (props.error ? `${id}-err` : undefined));

function onInput(ev: Event) {
  emit('update:modelValue', (ev.target as HTMLInputElement | HTMLTextAreaElement).value);
}
</script>

<template>
  <div class="lu-field" :class="{ 'is-invalid': !!error }">
    <label v-if="label" :for="id" class="lu-field-label">{{ label }}</label>
    <textarea
      v-if="multiline"
      :id="id"
      class="lu-field-control lu-glass-thin"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="!!error || undefined"
      :aria-describedby="describedBy"
      @input="onInput"
    />
    <input
      v-else
      :id="id"
      class="lu-field-control lu-glass-thin"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="!!error || undefined"
      :aria-describedby="describedBy"
      @input="onInput"
    />
    <p v-if="error" :id="`${id}-err`" class="lu-field-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.lu-field { display: flex; flex-direction: column; gap: 5px; }
.lu-field-label {
  font-size: var(--fs-micro, 12px);
  font-weight: var(--fw-medium, 500);
  color: var(--text-secondary, #666);
}
.lu-field-control {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md, 8px);
  font-family: inherit;
  font-size: var(--fs-body-sm, 13px);
  color: var(--text, #0a0a0a);
  /* .lu-glass-thin supplies background/blur/border; override the box-shadow so
   * a resting field is flat, lifting only on focus. */
  box-shadow: none;
  transition: box-shadow 0.16s ease, border-color 0.16s ease;
}
.lu-field-control::placeholder { color: var(--text-muted, #a0a0a0); }
.lu-field-control:focus {
  outline: none;
  border-color: var(--accent, #171717);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(0, 0, 0, 0.08));
}
.is-invalid .lu-field-control {
  border-color: var(--state-error, #a8412e);
}
.is-invalid .lu-field-control:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--state-error, #a8412e) 25%, transparent);
}
.lu-field-error { font-size: var(--fs-micro, 12px); color: var(--state-error, #a8412e); }
@media (prefers-reduced-motion: reduce) {
  .lu-field-control { transition: none; }
}
</style>
