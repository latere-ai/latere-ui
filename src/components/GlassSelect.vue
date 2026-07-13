<script setup lang="ts">
// A custom dropdown select: a thin-glass trigger over a thick-glass listbox.
// Full listbox/option ARIA with arrow + Enter keyboard support. v-model binds
// the chosen value. Requires `import 'latere-ui/glass'`.
import { computed, ref } from 'vue';
import { useClickOutside } from '../composables/useClickOutside';
import type { SelectOption } from '../glass/types';
import '../styles/components/glass-select.css';

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
      class="lu-select-trigger lu-glass-ultrathin"
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
