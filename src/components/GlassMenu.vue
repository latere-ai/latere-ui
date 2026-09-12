<script setup lang="ts">
import '../styles/components/glass-menu.css';
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
