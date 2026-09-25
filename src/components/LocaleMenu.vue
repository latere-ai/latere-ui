<script setup lang="ts">
import '../styles/components/preference-menu.css';
// The language control: a quiet globe button that opens the offered languages
// on a solid menu surface, each named in its own language, with a check on
// the current one. Built on GlassPopover and GlassMenu, like ThemeMenu.
// Presentational: the host owns the locale.
import { computed } from 'vue';
import GlassPopover from './GlassPopover.vue';
import GlassMenu from './GlassMenu.vue';
import type { LocaleOption } from '../i18n/footer';
import { DEFAULT_LOCALE_OPTIONS, GLOBE_ICON, localeMenuItems, localeTriggerLabel } from './preferenceMenus';

const props = withDefaults(defineProps<{
  /** Current locale code. */
  locale: string;
  /** Languages offered. Defaults to English and Chinese. */
  locales?: LocaleOption[];
  /** Name of the menu and prefix of the trigger's accessible name. */
  label?: string;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}>(), { locales: () => DEFAULT_LOCALE_OPTIONS, label: 'Language', placement: 'bottom-end' });
const emit = defineEmits<{ 'update:locale': [string] }>();

const items = computed(() => localeMenuItems(props.locale, props.locales));
function choose(value: string, close: () => void) {
  emit('update:locale', value);
  close();
}
</script>

<template>
  <GlassPopover class="lu-pref lu-locale-menu" :placement="placement" surface="solid">
    <template #trigger="{ open, id }">
      <button
        type="button"
        class="lu-pref-trigger"
        aria-haspopup="menu"
        :aria-expanded="open"
        :aria-controls="open ? id : undefined"
        :aria-label="localeTriggerLabel(locale, locales, label)"
        :title="label"
      ><span class="lu-pref-icon" v-html="GLOBE_ICON" /></button>
    </template>
    <template #default="{ close }">
      <GlassMenu :items="items" :label="label" autofocus @select="choose($event, close)" />
    </template>
  </GlassPopover>
</template>
