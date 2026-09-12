<script setup lang="ts">
import '../styles/components/glass-tabs.css';
// A tab strip with a sliding glass indicator. Full ARIA tablist semantics with
// arrow-key roving focus. v-model binds the active tab value; render the active
// panel yourself (this is navigation, not a container).
// Requires `import 'latere-ui/glass'`.
import { ref } from 'vue';
import type { TabItem } from '../glass/types';

const props = defineProps<{
  modelValue: string;
  tabs: TabItem[];
  ariaLabel?: string;
}>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const btns = ref<HTMLButtonElement[]>([]);

function select(v: string) {
  if (v !== props.modelValue) emit('update:modelValue', v);
}
function onKey(e: KeyboardEvent, i: number) {
  const n = props.tabs.length;
  let next = i;
  if (e.key === 'ArrowRight') next = (i + 1) % n;
  else if (e.key === 'ArrowLeft') next = (i - 1 + n) % n;
  else return;
  e.preventDefault();
  select(props.tabs[next].value);
  btns.value[next]?.focus();
}
</script>

<template>
  <div class="lu-tabs" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="(tab, i) in tabs"
      :key="tab.value"
      ref="btns"
      type="button"
      role="tab"
      class="lu-tab"
      :class="{ 'is-active': tab.value === modelValue }"
      :aria-selected="tab.value === modelValue"
      :tabindex="tab.value === modelValue ? 0 : -1"
      @click="select(tab.value)"
      @keydown="onKey($event, i)"
    >
      {{ tab.label }}
      <span v-if="tab.value === modelValue" class="lu-tab-ind lu-glass-thin" aria-hidden="true" />
    </button>
  </div>
</template>
