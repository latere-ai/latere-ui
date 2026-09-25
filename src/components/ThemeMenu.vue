<script setup lang="ts">
import '../styles/components/preference-menu.css';
// The theme control: a quiet icon button showing the current preference (sun,
// moon, or a monitor for following the system) that opens Light, Dark and
// System on a solid menu surface, with a check on the current one. Built on
// GlassPopover and GlassMenu, so it has their menu-button keys, focus return
// and menuitemradio semantics. Presentational: the host owns the preference.
import { computed } from 'vue';
import GlassPopover from './GlassPopover.vue';
import GlassMenu from './GlassMenu.vue';
import type { Theme } from '../i18n/footer';
import {
  DEFAULT_THEME_MENU_LABELS,
  THEME_ICONS,
  themeMenuItems,
  themeTriggerLabel,
  type ThemeMenuLabels,
} from './preferenceMenus';

const props = withDefaults(defineProps<{
  /** Current preference; `auto` follows the operating system. */
  theme: Theme;
  /** Text overrides, merged over the English defaults. */
  labels?: Partial<ThemeMenuLabels>;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}>(), { labels: undefined, placement: 'bottom-end' });
const emit = defineEmits<{ 'update:theme': [Theme] }>();

const t = computed(() => ({ ...DEFAULT_THEME_MENU_LABELS, ...props.labels }));
const items = computed(() => themeMenuItems(props.theme, t.value));
function choose(value: string, close: () => void) {
  emit('update:theme', value as Theme);
  close();
}
</script>

<template>
  <GlassPopover class="lu-pref lu-theme-menu" :placement="placement" surface="solid">
    <template #trigger="{ open, id }">
      <button
        type="button"
        class="lu-pref-trigger"
        aria-haspopup="menu"
        :aria-expanded="open"
        :aria-controls="open ? id : undefined"
        :aria-label="themeTriggerLabel(theme, t)"
        :title="t.theme"
      ><span class="lu-pref-icon" v-html="THEME_ICONS[theme]" /></button>
    </template>
    <template #default="{ close }">
      <GlassMenu :items="items" :label="t.theme" autofocus @select="choose($event, close)" />
    </template>
  </GlassPopover>
</template>
