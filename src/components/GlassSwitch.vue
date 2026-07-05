<script setup lang="ts">
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
    <span class="lu-switch-track" :class="modelValue ? 'lu-glass-thin' : ''">
      <span class="lu-switch-thumb" />
    </span>
    <span v-if="label" class="lu-switch-label">{{ label }}</span>
  </button>
</template>

<style scoped>
.lu-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font: inherit;
  color: var(--text, #0a0a0a);
}
.lu-switch-track {
  position: relative;
  width: 36px;
  height: 21px;
  border-radius: 999px;
  background: var(--bg-raised, #e5e5e5);
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  transition: background 0.18s ease;
}
.lu-switch.is-on .lu-switch-track { background: var(--accent, #171717); }
.lu-switch-thumb {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.18s ease;
}
.lu-switch.is-on .lu-switch-thumb { transform: translateX(15px); }
.lu-switch-label { font-size: var(--fs-body-sm, 13px); }
.lu-switch:disabled { opacity: 0.5; cursor: not-allowed; }
.lu-switch:focus-visible { outline: 2px solid var(--accent, #171717); outline-offset: 3px; border-radius: 4px; }
@media (prefers-reduced-motion: reduce) {
  .lu-switch-track, .lu-switch-thumb { transition: none; }
}
</style>
