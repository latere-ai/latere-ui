<script setup lang="ts">
// Minimal shared command palette: a ⌘K overlay that fuzzy-filters the console's
// nav items and jumps to one. It's intentionally small — the nav-jump baseline
// every console can share. Apps with richer command systems (e.g. cella) keep
// their own; the rest wire ConsoleSidebar's `search` event to this.

import { computed, nextTick, ref, watch } from 'vue';

import { flattenNavItems, type ConsoleNavModel, type NavItem } from '../console/nav';

interface Props {
  open: boolean;
  model: ConsoleNavModel;
  placeholder?: string;
  emptyLabel?: string;
}
const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Jump to…',
  emptyLabel: 'No matches',
});

const emit = defineEmits<{ close: []; navigate: [NavItem] }>();

const query = ref('');
const selected = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);

// Routable, non-disabled rows only — the palette is a navigator, not a launcher.
const items = computed(() =>
  flattenNavItems(props.model.groups).filter((i) => i.to && i.disabled !== true),
);
const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter((i) => i.label.toLowerCase().includes(q));
});

watch(
  () => props.open,
  (open) => {
    if (open) {
      query.value = '';
      selected.value = 0;
      void nextTick(() => inputEl.value?.focus());
    }
  },
);
watch(results, () => {
  selected.value = 0;
});

function choose(item: NavItem) {
  emit('navigate', item);
  emit('close');
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    selected.value = Math.min(selected.value + 1, results.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selected.value = Math.max(selected.value - 1, 0);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const item = results.value[selected.value];
    if (item) choose(item);
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="lu-cp-backdrop" @mousedown.self="emit('close')">
      <div class="lu-cp" role="dialog" aria-modal="true">
        <input
          ref="inputEl"
          v-model="query"
          class="lu-cp-input"
          type="text"
          :placeholder="placeholder"
          @keydown="onKeydown"
        />
        <ul class="lu-cp-list" role="listbox">
          <li
            v-for="(item, i) in results"
            :key="item.id"
            class="lu-cp-item"
            :data-active="i === selected ? 'true' : 'false'"
            role="option"
            :aria-selected="i === selected ? 'true' : 'false'"
            @mouseenter="selected = i"
            @click="choose(item)"
          >
            <span class="lu-cp-item-label">{{ item.label }}</span>
            <span v-if="item.groupLabel" class="lu-cp-item-group">{{ item.groupLabel }}</span>
          </li>
          <li v-if="!results.length" class="lu-cp-empty">{{ emptyLabel }}</li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lu-cp-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 14vh;
}
.lu-cp {
  width: min(560px, 92vw);
  background: var(--glass-bg-thick, var(--bg-surface, #fff));
  -webkit-backdrop-filter: blur(36px) saturate(180%);
  backdrop-filter: blur(36px) saturate(180%);
  border: 1px solid var(--glass-border, var(--border, rgba(0, 0, 0, 0.1)));
  border-radius: var(--radius-xl, 28px);
  box-shadow: var(--shadow-glass, 0 16px 48px rgba(0, 0, 0, 0.24));
  overflow: hidden;
}
.lu-cp-input {
  width: 100%;
  box-sizing: border-box;
  border: 0;
  border-bottom: 1px solid var(--glass-border, var(--border, rgba(0, 0, 0, 0.08)));
  background: transparent;
  color: var(--text, #0a0a0a);
  font: inherit;
  font-size: 15px;
  padding: 14px 18px;
  outline: none;
}
.lu-cp-list {
  list-style: none;
  margin: 0;
  padding: 6px;
  max-height: 50vh;
  overflow-y: auto;
}
.lu-cp-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: var(--radius-sm, 12px);
  cursor: pointer;
  color: var(--text-secondary, #555);
}
.lu-cp-item[data-active="true"] {
  background: var(--glass-pill-fill, var(--bg-raised, #f5f5f5));
  color: var(--text, #0a0a0a);
}
.lu-cp-item-label { flex: 1 1 auto; font-size: 14px; }
.lu-cp-item-group {
  flex-shrink: 0;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--text-muted, #a0a0a0);
}
.lu-cp-empty {
  padding: 16px;
  text-align: center;
  color: var(--text-muted, #a0a0a0);
  font-size: 13px;
}
</style>
