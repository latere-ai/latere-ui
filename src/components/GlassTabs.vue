<script setup lang="ts">
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

<style scoped>
.lu-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.08));
}
.lu-tab {
  position: relative;
  border: none;
  background: none;
  cursor: pointer;
  padding: 8px 12px;
  font: inherit;
  font-size: var(--fs-body-sm, 13px);
  font-weight: var(--fw-medium, 500);
  color: var(--text-secondary, #666);
  transition: color 0.14s ease;
}
.lu-tab:hover { color: var(--text, #0a0a0a); }
.lu-tab.is-active { color: var(--accent, #171717); }
.lu-tab-ind {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--accent, #171717);
  box-shadow: none;
  border: none;
}
.lu-tab:focus-visible { outline: 2px solid var(--accent, #171717); outline-offset: -2px; border-radius: 4px; }
@media (prefers-reduced-motion: reduce) { .lu-tab { transition: none; } }
</style>
