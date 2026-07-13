<script setup lang="ts">
// A segmented control — pick one of a few options (theme, density, view mode).
// Thin-glass track with a highlighted active segment; radiogroup semantics with
// arrow-key roving focus. v-model binds the selected value.
// Requires `import 'latere-ui/glass'`.
import { ref } from 'vue';
import type { SegmentOption } from '../glass/types';
import '../styles/components/glass-segmented.css';

const props = defineProps<{
  modelValue: string;
  options: SegmentOption[];
  ariaLabel?: string;
}>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const btns = ref<HTMLButtonElement[]>([]);

function select(v: string) {
  if (v !== props.modelValue) emit('update:modelValue', v);
}

function onKey(e: KeyboardEvent, i: number) {
  const n = props.options.length;
  let next = i;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n;
  else return;
  e.preventDefault();
  select(props.options[next].value);
  btns.value[next]?.focus();
}
</script>

<template>
  <div class="lu-seg lu-glass-thin" role="radiogroup" :aria-label="ariaLabel">
    <button
      v-for="(opt, i) in options"
      :key="opt.value"
      ref="btns"
      type="button"
      role="radio"
      class="lu-seg-item"
      :class="{ 'is-active': opt.value === modelValue }"
      :aria-checked="opt.value === modelValue"
      :tabindex="opt.value === modelValue ? 0 : -1"
      @click="select(opt.value)"
      @keydown="onKey($event, i)"
    >{{ opt.label }}</button>
  </div>
</template>

