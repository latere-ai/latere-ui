<script setup lang="ts">
// Minimal shared command palette: a ⌘K overlay that fuzzy-filters the console's
// nav items and jumps to one. It's intentionally small — the nav-jump baseline
// every console can share. Apps with richer command systems (e.g. cella) keep
// their own; the rest wire ConsoleSidebar's `search` event to this.

import { computed, ref, watch, useId } from 'vue';

import type { ConsoleNavModel, NavItem } from '../console/nav';
import { consoleIcon } from '../console/icons';
import { filterPalette, paletteEntries, type ConsolePaletteItem, type ConsolePaletteSearch } from '../console/palette';
import { useFocusTrap } from '../glass/overlay';
import ConsoleIcon from './ConsoleIcon.vue';

interface Props {
  open: boolean;
  model: ConsoleNavModel;
  placeholder?: string;
  emptyLabel?: string;
  /** Host entries after the nav rows: actions and other destinations. */
  items?: ConsolePaletteItem[];
  /** Extra rows for a non-empty query, such as documentation pages. */
  search?: ConsolePaletteSearch;
}
const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Jump to…',
  emptyLabel: 'No matches',
});

const emit = defineEmits<{ close: []; navigate: [NavItem] }>();

const query = ref('');
const selected = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const id = useId();
useFocusTrap({ active: computed(() => props.open), container: panel, initialFocus: inputEl, onEscape: () => emit('close') });

// Routable, enabled nav rows, then the host's entries; a query also runs the
// host's search.
const items = computed(() => paletteEntries(props.model.groups, props.items));
const results = computed(() => filterPalette(items.value, query.value, props.search));

watch(
  () => props.open,
  (open) => {
    if (open) {
      query.value = '';
      selected.value = 0;
    }
  },
);
watch(results, () => {
  selected.value = 0;
});
watch([selected, results, () => props.open], () => {
  if (props.open) panel.value?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
}, { flush: 'post' });

function choose(item: NavItem) {
  emit('navigate', item);
  emit('close');
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selected.value = Math.max(0, Math.min(selected.value + 1, results.value.length - 1));
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
      <div ref="panel" class="lu-cp" role="dialog" aria-modal="true" :aria-label="placeholder">
        <input
          ref="inputEl"
          v-model="query"
          class="lu-cp-input"
          type="text"
          role="combobox"
          aria-expanded="true"
          :aria-label="placeholder"
          :aria-controls="`${id}-list`"
          :aria-activedescendant="results.length ? `${id}-option-${selected}` : undefined"
          :placeholder="placeholder"
          @keydown="onKeydown"
        />
        <ul :id="`${id}-list`" class="lu-cp-list" role="listbox">
          <li
            v-for="(item, i) in results"
            :key="item.id"
            :id="`${id}-option-${i}`"
            class="lu-cp-item"
            :data-active="i === selected ? 'true' : 'false'"
            role="option"
            :aria-selected="i === selected ? 'true' : 'false'"
            @mouseenter="selected = i"
            @click="choose(item)"
          >
            <span v-if="consoleIcon(item.icon)" class="lu-cp-item-icon"><ConsoleIcon :name="item.icon!" /></span>
            <span class="lu-cp-item-label">{{ item.label }}</span>
            <span v-if="item.group" class="lu-cp-item-group">{{ item.group }}</span>
          </li>
          <li v-if="!results.length" class="lu-cp-empty">{{ emptyLabel }}</li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<style src="../styles/components/console-palette.css"></style>
