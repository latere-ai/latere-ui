<script setup lang="ts">
// Theme + language preferences, designed to drop into AccountMenu's `#prefs`
// slot so every Latere SPA gets the same control. Kept out of AccountMenu
// itself (which stays theme/locale-agnostic): the slot is the documented seam.
//
// Language is rendered from the host's `localeOptions` rather than a hardcoded
// EN/中文 pair, so it scales to however many locales an app ships (en/zh/de …).
// Self-styled with the platform CSS tokens (--text, --bg-raised, --accent, …)
// so it matches the menu without importing any CSS.
import { computed } from 'vue';

import type { Theme, LocaleOption } from '../i18n/footer';
import {
  type AccountPrefsLabels,
  DEFAULT_ACCOUNT_PREFS_LABELS,
} from './accountPrefs';

export type { AccountPrefsLabels };

const DEFAULT_LABELS = DEFAULT_ACCOUNT_PREFS_LABELS;

const props = withDefaults(
  defineProps<{
    /** Currently active theme. */
    theme: Theme;
    /** Currently active locale code (matches a `localeOptions[].code`). */
    locale: string;
    /** Every language the host supports — drives the pills (scales past two). */
    localeOptions: LocaleOption[];
    /** Per-locale label overrides. */
    labels?: Partial<AccountPrefsLabels>;
  }>(),
  { labels: undefined },
);

const emit = defineEmits<{
  (e: 'set-theme', theme: Theme): void;
  (e: 'set-locale', code: string): void;
}>();

const t = computed<AccountPrefsLabels>(() => ({ ...DEFAULT_LABELS, ...props.labels }));

const themes = computed<{ v: Theme; label: string }[]>(() => [
  { v: 'light', label: t.value.light },
  { v: 'dark', label: t.value.dark },
  { v: 'auto', label: t.value.auto },
]);
</script>

<template>
  <div class="lu-ap">
    <div class="lu-ap-label">{{ t.language }}</div>
    <div class="lu-ap-row" role="group" :aria-label="t.language">
      <button
        v-for="opt in localeOptions"
        :key="opt.code"
        type="button"
        class="lu-ap-pill"
        :class="{ 'is-active': locale === opt.code }"
        :title="opt.name || opt.label"
        :aria-pressed="locale === opt.code"
        @click="emit('set-locale', opt.code)"
      >
        {{ opt.label }}
      </button>
    </div>

    <div class="lu-ap-label">{{ t.theme }}</div>
    <div class="lu-ap-row" role="group" :aria-label="t.theme">
      <button
        v-for="opt in themes"
        :key="opt.v"
        type="button"
        class="lu-ap-pill"
        :class="{ 'is-active': theme === opt.v }"
        :title="opt.label"
        :aria-pressed="theme === opt.v"
        @click="emit('set-theme', opt.v)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.lu-ap {
  display: flex;
  flex-direction: column;
}
.lu-ap-label {
  font-family: var(--font-mono, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted, #888);
  padding: 6px 12px 4px;
}
.lu-ap-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 0 8px 8px;
}
.lu-ap-pill {
  font: inherit;
  font-size: 11px;
  line-height: 1;
  min-height: 24px;
  padding: 0 9px;
  border-radius: var(--radius-pill, 999px);
  background: transparent;
  border: 1px solid var(--glass-border, var(--border, #ccc));
  color: var(--text-secondary, #555);
  cursor: pointer;
  transition: background 0.1s, color 0.1s, border-color 0.1s;
}
.lu-ap-pill:hover {
  background: var(--glass-pill-fill, var(--bg-raised, #f4f4f4));
  color: var(--text, #111);
}
.lu-ap-pill.is-active {
  background: var(--glass-pill-fill, var(--bg-raised, #f4f4f4));
  color: var(--text, #111);
  border-color: var(--glass-border, var(--border-strong, var(--border, #999)));
  font-weight: 600;
}
</style>
