<script setup lang="ts">
// A labeled input shell in thin glass. Wraps <input>/<textarea>; the control
// sits on a thin-glass fill with an accent focus ring. v-model via modelValue.
// Requires `import 'latere-ui/glass'`.
import { computed, useId } from 'vue';
import '../styles/components/glass-field.css';

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
      class="lu-field-control lu-glass-ultrathin"
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
      class="lu-field-control lu-glass-ultrathin"
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
