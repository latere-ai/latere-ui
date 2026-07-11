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
}
.lu-tab {
  position: relative;
  border: none;
  background: none;
  cursor: pointer;
  padding: 7px 15px;
  border-radius: var(--radius-pill, 999px);
  font: inherit;
  font-size: var(--fs-body-sm, 13px);
  font-weight: var(--fw-medium, 500);
  color: var(--text-secondary, #666);
  transition: color 0.14s ease, background 0.14s ease;
}
.lu-tab:hover { color: var(--text, #0a0a0a); }
/* v2: the active tab is a glass pill, not an underline. */
.lu-tab.is-active {
  color: var(--text, #0a0a0a);
  background: var(--glass-pill-fill);
  box-shadow: var(--shadow, 0 1px 2px rgba(0, 0, 0, 0.06)), var(--glass-edge-top);
}
/* The indicator span is superseded by the pill; keep markup, drop the bar. */
.lu-tab-ind {
  display: none;
}
.lu-tab:focus-visible { outline: var(--focus-outline, 2px solid var(--accent, #171717)); outline-offset: -2px; border-radius: 4px; }
@media (prefers-reduced-motion: reduce) { .lu-tab { transition: none; } }
</style>
