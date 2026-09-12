<script setup lang="ts">
import '../styles/components/glass-switch.css';
// An on/off toggle. role=switch with aria-checked; v-model binds the boolean.
// Requires `import 'latere-ui/glass'`.
const props = withDefaults(defineProps<{
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
}>(), {
  disabled: false,
});
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

function toggle() {
  if (!props.disabled) emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <button
    type="button"
    role="switch"
    class="lu-switch"
    :class="{ 'is-on': modelValue }"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="lu-switch-track" :class="modelValue ? '' : 'lu-glass-ultrathin'">
      <span class="lu-switch-thumb" />
    </span>
    <span v-if="label" class="lu-switch-label">{{ label }}</span>
  </button>
</template>
