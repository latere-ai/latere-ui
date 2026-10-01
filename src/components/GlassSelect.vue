<script setup lang="ts">
// A custom dropdown select: a thin-glass trigger over a thick-glass menu that
// holds a listbox. With more than SELECT_SEARCH_THRESHOLD options, or with
// `searchable`, the menu opens with a search field at its top that filters
// the options as the reader types. v-model binds the chosen value.
// Requires `import 'latere-ui/glass'`.
import { computed, nextTick, ref, watch, useId } from 'vue';
import { useClickOutside } from '../composables/useClickOutside';
import type { SelectOption } from '../glass/types';
import {
  filterSelectOptions, initialVisibleOption, isSelectSearchable, isTypeToSearchKey,
  nextVisibleOption, selectLabelRuns, selectMenuShift,
} from '../glass/selectSearch';
import '../styles/components/glass-select.css';

const props = withDefaults(defineProps<{
  modelValue: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  /** Show the search field; unset, it shows above SELECT_SEARCH_THRESHOLD options. */
  searchable?: boolean;
  /** Placeholder and accessible name of the search field. */
  searchPlaceholder?: string;
  /** The line shown when no option matches the search. */
  noMatchLabel?: string;
}>(), { placeholder: 'Select…', disabled: false, searchable: undefined, searchPlaceholder: 'Search', noMatchLabel: 'No matches' });
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const field = ref<HTMLInputElement | null>(null);
const open = ref(false);
const active = ref(-1);
const query = ref('');
// The menu's widest measured width while open, so it does not narrow as a
// search hides long labels, and how far it moves left to stay in the viewport.
const lockedWidth = ref(0);
const shift = ref(0);
const id = useId();
// The listbox takes tabindex -1 so the scrolling list stays out of the Tab
// order; the arrows reach its options through aria-activedescendant.
const listId = `${id}-list`;
const optionId = (index: number) => `${id}-option-${index}`;

const search = computed(() => isSelectSearchable(props.options.length, props.searchable));
const visible = computed(() => filterSelectOptions(props.options, search.value ? query.value : ''));
// Each visible row with its label split around the search's matches.
const rows = computed(() => visible.value.map((index) => ({
  index,
  option: props.options[index],
  runs: selectLabelRuns(props.options[index].label, search.value ? query.value : ''),
})));
const selected = computed(() => props.options.find((o) => o.value === props.modelValue));
const noMatch = computed(() => search.value && query.value.trim() !== '' && visible.value.length === 0);
const activeId = computed(() => (open.value && visible.value.includes(active.value) ? optionId(active.value) : undefined));
const panelStyle = computed(() => ({
  minWidth: lockedWidth.value ? `${lockedWidth.value}px` : undefined,
  left: shift.value ? `${-shift.value}px` : undefined,
}));

watch(() => props.options, () => {
  const option = props.options[active.value];
  if (!option || option.disabled || !visible.value.includes(active.value)) {
    active.value = initialVisibleOption(props.options, visible.value, props.modelValue);
  }
}, { deep: true });
// A search makes its first match active, so Enter takes it; clearing the
// search returns to the chosen value.
watch(query, () => {
  active.value = query.value.trim()
    ? nextVisibleOption(props.options, visible.value, -1, 1)
    : initialVisibleOption(props.options, visible.value, props.modelValue);
});
watch([open, active], () => {
  if (open.value) panel.value?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
}, { flush: 'post' });
watch([open, visible], () => {
  if (open.value) place();
}, { flush: 'post' });

/** Measure the open menu: hold its widest width and keep it inside the viewport. */
function place() {
  const menu = panel.value;
  if (!menu || !root.value) return;
  const width = menu.getBoundingClientRect().width;
  if (search.value && width > lockedWidth.value) lockedWidth.value = width;
  const viewport = document.documentElement.clientWidth || window.innerWidth;
  shift.value = selectMenuShift(root.value.getBoundingClientRect().left, Math.max(width, lockedWidth.value), viewport);
}

function show(typed = '') {
  if (props.disabled) return;
  open.value = true;
  query.value = typed;
  active.value = typed
    ? nextVisibleOption(props.options, visible.value, -1, 1)
    : initialVisibleOption(props.options, visible.value, props.modelValue);
  if (search.value) void nextTick(focusField);
}
function close(restoreFocus = false) {
  if (!open.value) return;
  open.value = false;
  query.value = '';
  lockedWidth.value = 0;
  shift.value = 0;
  if (restoreFocus) trigger.value?.focus({ preventScroll: true });
}
function toggle() {
  if (open.value) close();
  else show();
}
function focusField() {
  const input = field.value;
  if (!input) return;
  input.focus({ preventScroll: true });
  input.setSelectionRange(input.value.length, input.value.length);
}
useClickOutside(root, () => open.value, () => close());

// Choosing returns focus to the trigger, from the field or the pointer alike.
function choose(opt: SelectOption | undefined) {
  if (!opt || opt.disabled) return;
  emit('update:modelValue', opt.value);
  close(true);
}

// Keep focus where it is while the pointer chooses in the menu; only the
// search field takes a press, to place its caret.
function keepFocus(e: MouseEvent) {
  if (e.target !== field.value) e.preventDefault();
}
// Tab, or anything else that moves focus out of the control, closes the menu.
function onFocusOut(e: FocusEvent) {
  if (open.value && !root.value?.contains(e.relatedTarget as Node | null)) close();
}

// One handler for the trigger and the search field: either may hold focus
// while the menu is open.
function onKey(e: KeyboardEvent) {
  if (props.disabled) return;
  if (!open.value) {
    if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      show();
    } else if (search.value && isTypeToSearchKey(e)) {
      e.preventDefault();
      show(e.key);
    }
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    active.value = nextVisibleOption(props.options, visible.value, active.value, 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    active.value = nextVisibleOption(props.options, visible.value, active.value, -1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    choose(visible.value.includes(active.value) ? props.options[active.value] : undefined);
  } else if (e.key === 'Escape') {
    // The select owns Escape while open: a search clears first, then the menu
    // closes. Nothing behind it, such as a dialog, sees the key.
    e.preventDefault();
    e.stopPropagation();
    if (query.value) query.value = '';
    else close(true);
  } else if (e.target !== field.value && search.value && isTypeToSearchKey(e)) {
    e.preventDefault();
    query.value += e.key;
    void nextTick(focusField);
  }
}
</script>

<template>
  <div ref="root" class="lu-select" :data-lu-owns-escape="open ? '' : undefined" @focusout="onFocusOut">
    <button
      ref="trigger"
      type="button"
      class="lu-select-trigger lu-glass-ultrathin"
      :class="{ 'is-open': open }"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="open ? listId : undefined"
      :aria-activedescendant="search ? undefined : activeId"
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
      <div
        v-if="open"
        ref="panel"
        class="lu-select-list lu-glass-thick"
        :class="{ 'is-searchable': search }"
        :style="panelStyle"
        @mousedown="keepFocus"
      >
        <input
          v-if="search"
          ref="field"
          v-model="query"
          class="lu-select-search"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="true"
          :aria-controls="listId"
          :aria-activedescendant="activeId"
          :aria-label="searchPlaceholder"
          :placeholder="searchPlaceholder"
          autocomplete="off"
          spellcheck="false"
          size="1"
          @keydown="onKey"
        >
        <ul :id="listId" class="lu-select-options" role="listbox" tabindex="-1">
          <li
            v-for="{ index: i, option, runs } in rows"
            :key="option.value"
            :id="optionId(i)"
            role="option"
            class="lu-select-option"
            :class="{ 'is-active': i === active, 'is-selected': option.value === modelValue, 'is-disabled': option.disabled }"
            :title="option.label"
            :aria-label="runs.length > 1 ? option.label : undefined"
            :aria-selected="option.value === modelValue"
            :aria-disabled="option.disabled || undefined"
            @click="choose(option)"
            @mouseenter="!option.disabled && (active = i)"
          ><template v-for="(run, r) in runs" :key="r"><mark v-if="run.match" class="lu-select-match">{{ run.text }}</mark><template v-else>{{ run.text }}</template></template></li>
        </ul>
        <div v-if="noMatch" class="lu-select-empty" role="status">{{ noMatchLabel }}</div>
      </div>
    </Transition>
  </div>
</template>
