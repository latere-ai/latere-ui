<script setup lang="ts">
// A custom dropdown select: a thin-glass trigger over a thick-glass listbox.
// Full listbox/option ARIA with arrow + Enter keyboard support. v-model binds
// the chosen value. Requires `import 'latere-ui/glass'`.
import { computed, ref } from 'vue';
import { useClickOutside } from '../composables/useClickOutside';
import type { SelectOption } from '../glass/types';

const props = withDefaults(defineProps<{
  modelValue: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}>(), { placeholder: 'Select…', disabled: false });
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const root = ref<HTMLElement | null>(null);
const open = ref(false);
const active = ref(0);

const selected = computed(() => props.options.find((o) => o.value === props.modelValue));

function toggle() {
  if (props.disabled) return;
  open.value = !open.value;
  if (open.value) {
    const i = props.options.findIndex((o) => o.value === props.modelValue);
    active.value = i >= 0 ? i : 0;
  }
}
function close() { open.value = false; }
useClickOutside(root, () => open.value, close);

function choose(opt: SelectOption) {
  if (opt.disabled) return;
  emit('update:modelValue', opt.value);
  close();
}

function onKey(e: KeyboardEvent) {
  if (props.disabled) return;
  const n = props.options.length;
  if (!open.value && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ')) {
    e.preventDefault();
    toggle();
    return;
  }
  if (!open.value) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); active.value = (active.value + 1) % n; }
  else if (e.key === 'ArrowUp') { e.preventDefault(); active.value = (active.value - 1 + n) % n; }
  else if (e.key === 'Enter') { e.preventDefault(); choose(props.options[active.value]); }
  else if (e.key === 'Escape') { close(); }
}
</script>

<template>
  <div ref="root" class="lu-select">
    <button
      type="button"
      class="lu-select-trigger lu-glass-thin"
      :class="{ 'is-open': open }"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-label="ariaLabel"
      :disabled="disabled"
      @click="toggle"
      @keydown="onKey"
    >
      <span class="lu-select-value" :class="{ 'is-placeholder': !selected }">
        {{ selected?.label ?? placeholder }}
      </span>
      <span class="lu-select-chevron" aria-hidden="true">▾</span>
    </button>
    <Transition name="lu-select">
      <ul v-if="open" class="lu-select-list lu-glass-thick" role="listbox">
        <li
          v-for="(opt, i) in options"
          :key="opt.value"
          role="option"
          class="lu-select-option"
          :class="{ 'is-active': i === active, 'is-selected': opt.value === modelValue, 'is-disabled': opt.disabled }"
          :aria-selected="opt.value === modelValue"
          :aria-disabled="opt.disabled || undefined"
          @click="choose(opt)"
          @mouseenter="active = i"
        >{{ opt.label }}</li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.lu-select { position: relative; }
.lu-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md, 8px);
  font: inherit;
  font-size: var(--fs-body-sm, 13px);
  color: var(--text, #0a0a0a);
  cursor: pointer;
  box-shadow: none;
}
.lu-select-trigger:focus-visible { outline: 2px solid var(--accent, #171717); outline-offset: 2px; }
.lu-select-trigger:disabled { opacity: 0.5; cursor: not-allowed; }
.lu-select-value.is-placeholder { color: var(--text-muted, #a0a0a0); }
.lu-select-chevron { color: var(--text-muted, #a0a0a0); font-size: 10px; }
.lu-select-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 900;
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
  border-radius: var(--radius-lg, 10px);
  list-style: none;
  margin: 0;
}
.lu-select-option {
  padding: 7px 10px;
  border-radius: var(--radius-sm, 6px);
  font-size: var(--fs-body-sm, 13px);
  color: var(--text, #0a0a0a);
  cursor: pointer;
}
.lu-select-option.is-active { background: var(--accent-subtle, rgba(0, 0, 0, 0.04)); }
.lu-select-option.is-selected { font-weight: var(--fw-semibold, 600); color: var(--accent, #171717); }
.lu-select-option.is-disabled { opacity: 0.45; cursor: not-allowed; }
.lu-select-enter-active, .lu-select-leave-active { transition: opacity 0.14s ease, transform 0.14s ease; }
.lu-select-enter-from, .lu-select-leave-to { opacity: 0; transform: translateY(-4px); }
@media (prefers-reduced-motion: reduce) {
  .lu-select-enter-active, .lu-select-leave-active { transition: none; }
  .lu-select-enter-from, .lu-select-leave-to { transform: none; }
}
</style>
