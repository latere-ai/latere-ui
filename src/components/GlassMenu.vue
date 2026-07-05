<script setup lang="ts">
// A menu list (role=menu) of actionable items — drop it inside a GlassPopover's
// default slot, or anywhere you need a command list. Emits `select` with the
// item value; skips disabled items.
import type { MenuItem } from '../glass/types';

defineProps<{ items: MenuItem[] }>();
defineEmits<{ (e: 'select', value: string): void }>();
</script>

<template>
  <div class="lu-menu" role="menu">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      role="menuitem"
      class="lu-menu-item"
      :class="{ 'is-danger': item.danger }"
      :disabled="item.disabled"
      @click="!item.disabled && $emit('select', item.value)"
    >{{ item.label }}</button>
  </div>
</template>

<style scoped>
.lu-menu { display: flex; flex-direction: column; gap: 1px; min-width: 160px; }
.lu-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  padding: 7px 10px;
  border-radius: var(--radius-sm, 6px);
  font: inherit;
  font-size: var(--fs-body-sm, 13px);
  color: var(--text, #0a0a0a);
  transition: background 0.12s ease;
}
.lu-menu-item:hover { background: var(--accent-subtle, rgba(0, 0, 0, 0.04)); }
.lu-menu-item.is-danger { color: var(--state-error, #a8412e); }
.lu-menu-item:disabled { opacity: 0.45; cursor: not-allowed; }
.lu-menu-item:focus-visible { outline: 2px solid var(--accent, #171717); outline-offset: -2px; }
@media (prefers-reduced-motion: reduce) { .lu-menu-item { transition: none; } }
</style>
