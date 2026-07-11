<script setup lang="ts">
// A checkbox with a glass check box and a label. v-model binds the boolean; the
// native input stays in the DOM for accessibility and keyboard support.
import { useId } from 'vue';

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

<style scoped>
.lu-check { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
.lu-check.is-disabled { opacity: 0.5; cursor: not-allowed; }
.lu-check-native { position: absolute; opacity: 0; width: 0; height: 0; }
.lu-check-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 19px;
  height: 19px;
  border-radius: var(--radius-xs, 7px);
  box-shadow: none;
  transition: background 0.14s ease, border-color 0.14s ease;
}
.lu-check-tick { width: 12px; height: 12px; color: var(--glass-smoke-ink, #fafafa); opacity: 0; transform: scale(0.8); transition: opacity 0.14s ease, transform 0.14s ease; }
.lu-check-native:checked + .lu-check-box { background: var(--glass-smoke-strong, rgba(10, 10, 10, 0.82)); border-color: transparent; }
.lu-check-native:checked + .lu-check-box .lu-check-tick { opacity: 1; transform: scale(1); }
.lu-check-native:focus-visible + .lu-check-box { outline: var(--focus-outline, 2px solid var(--accent, #171717)); outline-offset: 2px; }
.lu-check-label { font-size: var(--fs-body-sm, 13px); color: var(--text, #0a0a0a); }
@media (prefers-reduced-motion: reduce) { .lu-check-box, .lu-check-tick { transition: none; } }
</style>
