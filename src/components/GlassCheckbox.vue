<script setup lang="ts">
// A checkbox with a glass check box and a label. v-model binds the boolean; the
// native input stays in the DOM for accessibility and keyboard support.
import { useId } from 'vue';
import '../styles/components/glass-checkbox.css';

withDefaults(defineProps<{
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
}>(), { disabled: false });
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const id = useId();
function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked);
}
</script>

<template>
  <label class="lu-check" :class="{ 'is-disabled': disabled }" :for="id">
    <input
      :id="id"
      type="checkbox"
      class="lu-check-native"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="lu-check-box lu-glass-ultrathin" aria-hidden="true">
      <svg class="lu-check-tick" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6.2l2.2 2.2 4.6-4.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <span v-if="label" class="lu-check-label">{{ label }}</span>
  </label>
</template>
