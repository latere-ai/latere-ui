<script setup lang="ts">
import '../styles/components/glass-menu.css';
// A menu list (role=menu) of actionable items: drop it inside a GlassPopover's
// default slot, or anywhere you need a command list. Emits `select` with the
// item value; skips disabled items.
//
// Focus follows the WAI-ARIA menu pattern: one item is in the tab order at a
// time, ArrowUp/ArrowDown move between enabled items and wrap, Home/End jump
// to the ends, Enter/Space activate the focused item. When any item carries
// `checked`, the menu is a choice list: items become menuitemradio with
// aria-checked and a leading check column, so every label starts at the same x.
import { computed, onMounted, ref, watch } from 'vue';
import type { MenuItem } from '../glass/types';
import { initialOption, nextEnabledOption } from '../glass/selectNavigation';
import { CHECK_ICON } from './preferenceMenus';

const props = withDefaults(defineProps<{
  items: MenuItem[];
  /** Accessible name of the menu, e.g. "Theme". */
  label?: string;
  /** Move focus to the checked (or first enabled) item on mount, as a menu opened from a button does. */
  autofocus?: boolean;
}>(), { label: undefined, autofocus: false });
defineEmits<{ (e: 'select', value: string): void }>();

const checkable = computed(() => props.items.some(item => item.checked !== undefined));
const checkedValue = computed(() => props.items.find(item => item.checked)?.value ?? '');
const active = ref(initialOption(props.items, checkedValue.value));
// Indexed by item position; a function ref keeps source order, which a v-for
// string ref does not guarantee.
const buttons: (HTMLButtonElement | null)[] = [];

watch(() => props.items, (items) => {
  if (!items[active.value] || items[active.value].disabled) active.value = initialOption(items, checkedValue.value);
}, { deep: true });

function focusItem(index: number) {
  if (index < 0) return;
  active.value = index;
  buttons[index]?.focus({ preventScroll: true });
}

function onKey(event: KeyboardEvent) {
  const n = props.items.length;
  if (!n) return;
  let next = -1;
  if (event.key === 'ArrowDown') next = nextEnabledOption(props.items, active.value, 1);
  else if (event.key === 'ArrowUp') next = nextEnabledOption(props.items, active.value, -1);
  else if (event.key === 'Home') next = nextEnabledOption(props.items, -1, 1);
  else if (event.key === 'End') next = nextEnabledOption(props.items, n, -1);
  else return;
  event.preventDefault();
  focusItem(next);
}

// Pointer movement moves focus, so the highlight and the keyboard position
// are always the same item. Touch never moves focus: it would scroll.
function onPointerMove(event: PointerEvent, index: number) {
  if (event.pointerType === 'touch' || props.items[index].disabled || active.value === index && document.activeElement === buttons[index]) return;
  focusItem(index);
}

onMounted(() => { if (props.autofocus) focusItem(active.value); });
</script>

<template>
  <div class="lu-menu" :class="{ 'lu-menu--checkable': checkable }" role="menu" :aria-label="label" @keydown="onKey">
    <button
      v-for="(item, index) in items"
      :key="item.value"
      :ref="el => { buttons[index] = el as HTMLButtonElement | null }"
      type="button"
      :role="checkable ? 'menuitemradio' : 'menuitem'"
      :aria-checked="checkable ? !!item.checked : undefined"
      :tabindex="index === active ? 0 : -1"
      class="lu-menu-item"
      :class="{ 'is-danger': item.danger, 'is-checked': item.checked }"
      :disabled="item.disabled"
      @click="!item.disabled && $emit('select', item.value)"
      @pointermove="onPointerMove($event, index)"
    ><span v-if="checkable" class="lu-menu-check" aria-hidden="true" v-html="item.checked ? CHECK_ICON : ''" />{{ item.label }}</button>
  </div>
</template>
