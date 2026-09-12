<script setup lang="ts">
import '../styles/components/glass-radio.css';
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
