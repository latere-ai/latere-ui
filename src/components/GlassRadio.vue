<script setup lang="ts">
// A single radio option. Bind several with the same v-model + `name`; each sets
// its own `value`. The native input backs keyboard + group semantics.
import { computed, useId } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: string;
  value: string;
  name: string;
  label?: string;
  disabled?: boolean;
}>(), { disabled: false });
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const id = useId();
const checked = computed(() => props.modelValue === props.value);
</script>

<template>
  <label class="lu-radio" :class="{ 'is-disabled': disabled }" :for="id">
    <input
      :id="id"
      type="radio"
      class="lu-radio-native"
      :name="name"
      :value="value"
      :checked="checked"
      :disabled="disabled"
      @change="emit('update:modelValue', value)"
    />
    <span class="lu-radio-dot lu-glass-ultrathin" aria-hidden="true" />
    <span v-if="label" class="lu-radio-label">{{ label }}</span>
  </label>
</template>

<style scoped>
.lu-radio { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
.lu-radio.is-disabled { opacity: 0.5; cursor: not-allowed; }
.lu-radio-native { position: absolute; opacity: 0; width: 0; height: 0; }
.lu-radio-dot {
  position: relative;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  box-shadow: none;
  transition: border-color 0.14s ease;
}
.lu-radio-dot::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent, #171717);
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.lu-radio-native:checked + .lu-radio-dot { border: 1.5px solid var(--accent, #171717); }
.lu-radio-native:checked + .lu-radio-dot::after { opacity: 1; transform: scale(1); }
.lu-radio-native:focus-visible + .lu-radio-dot { outline: 2px solid var(--accent, #171717); outline-offset: 2px; }
.lu-radio-label { font-size: var(--fs-body-sm, 13px); color: var(--text, #0a0a0a); }
@media (prefers-reduced-motion: reduce) { .lu-radio-dot, .lu-radio-dot::after { transition: none; } }
</style>
