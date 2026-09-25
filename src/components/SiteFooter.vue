<script setup lang="ts">
import { computed, type Component } from 'vue';
import {
  translator,
  type Locale,
  type Messages,
  type Theme,
  type LocaleOption,
} from '../i18n/footer';
import LatereLogoMark from './LatereLogoMark.vue';
import ThemeMenu from './ThemeMenu.vue';
import LocaleMenu from './LocaleMenu.vue';
import { FOOTER_COLUMNS, FOOTER_COMPACT_LINKS, FOOTER_GROUPS, FOOTER_SOCIALS } from './footerNavigation';
import { DEFAULT_LOCALE_OPTIONS } from './preferenceMenus';

// Types now live in ../i18n/footer (a .ts module) and the package entrypoint
// re-exports them from there — never re-export types from a .vue file, since a
// consumer's `vue-tsc` can fall back to the default-only `*.vue` shim and lose
// the named members (breaks clean/SSG builds). Re-exported here for any code
// that still imports them from this SFC.
export type { Locale, Messages, Theme, LocaleOption };

const props = withDefaults(defineProps<{
  /** Current theme; drives the theme menu's icon and checked item. */
  theme: Theme;
  /** Current locale; selects footer copy and the checked language. */
  locale: Locale;
  /** Languages offered in the language menu. Defaults to English + Chinese. */
  locales?: LocaleOption[];
  /** Per-locale string overrides, merged over the bundled footer dictionaries. */
  messages?: Messages;
  /**
   * Compact layout: one wrapped row of links above the controls, instead of
   * the lockup and link columns. For app surfaces (auth, dashboards) where
   * the full footer is too tall.
   */
  compact?: boolean;
  /** Origin used for the site's own links (About, Blog, Legal, home). */
  baseUrl?: string;
  /**
   * Optional router-link component. When provided (e.g. vue-router's
   * RouterLink), internal links render through it with a relative `to`,
   * preserving SPA navigation. Otherwise they fall back to absolute `<a>`.
   */
  routerLink?: Component;
}>(), {
  locales: () => DEFAULT_LOCALE_OPTIONS,
  messages: undefined,
  compact: false,
  baseUrl: 'https://latere.ai',
  routerLink: undefined,
});

const emit = defineEmits<{
  'update:theme': [Theme];
  'update:locale': [Locale];
}>();

const t = computed(() => translator(props.locale, props.messages));
const themeLabels = computed(() => ({
  theme: t.value('footer.theme'),
  light: t.value('footer.theme.light'),
  dark: t.value('footer.theme.dark'),
  system: t.value('footer.theme.system'),
}));

// Internal link rendering: relative `to` for routerLink, absolute href otherwise.
const linkTag = computed<Component | 'a'>(() => props.routerLink ?? 'a');
function linkProps(path: string) {
  return props.routerLink ? { to: path } : { href: props.baseUrl + path };
}
</script>

<template>
  <!-- Compact navigation wraps complete labels; preferences sit below. -->
  <footer v-if="compact" class="site-footer site-footer-compact">
    <p class="footer-compact-copy" v-html="t('footer.rights')" />
    <nav class="footer-compact-links" :aria-label="t('footer.products')">
      <div v-for="group in FOOTER_GROUPS" :key="group.id" class="footer-compact-group" :data-footer-group="group.id" role="group" :aria-label="t(group.labelKey)">
        <span class="footer-group-title" aria-hidden="true">{{ t(group.labelKey) }}</span>
        <template v-for="link in group.links" :key="link.slug">
          <a v-if="link.html" :href="link.href" v-html="t(link.labelKey)" />
          <a v-else :href="link.href"><span :class="link.brandClass">{{ t(link.labelKey) }}</span></a>
        </template>
      </div>
      <template v-for="link in FOOTER_COMPACT_LINKS" :key="link.slug">
        <a v-if="link.html" :href="link.href" v-html="t(link.labelKey)" />
        <component :is="linkTag" v-else v-bind="linkProps(link.href)">{{ t(link.labelKey) }}</component>
      </template>
    </nav>
    <div class="footer-extra">
      <div class="footer-prefs">
        <ThemeMenu :theme="theme" :labels="themeLabels" placement="top-end" @update:theme="emit('update:theme', $event)" />
        <LocaleMenu :locale="locale" :locales="locales" :label="t('footer.language')" placement="top-end" @update:locale="emit('update:locale', $event)" />
      </div>
      <div class="footer-social" role="group" :aria-label="t('footer.social')">
        <a v-for="s in FOOTER_SOCIALS" :key="s.title" :href="s.href" target="_blank" rel="noopener" :title="s.title" :aria-label="s.title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="s.d" /></svg>
        </a>
      </div>
    </div>
  </footer>

  <!-- The lockup, the social row and the preferences lead; the link columns
       follow; the copyright closes the footer. -->
  <footer v-else class="site-footer">
    <div class="footer-container">
      <div class="footer-lead">
        <div class="footer-lockup">
          <slot name="brand">
            <component :is="linkTag" v-bind="linkProps('/')" class="logo-link">
              <span class="logo-mark logo-mark-footer" aria-hidden="true">
                <LatereLogoMark class="logo-mark-icon" />
              </span>
              <span class="logo-text">Latere AI</span>
            </component>
          </slot>
        </div>
        <div class="footer-social" role="group" :aria-label="t('footer.social')">
          <a v-for="s in FOOTER_SOCIALS" :key="s.title" :href="s.href" target="_blank" rel="noopener" :title="s.title" :aria-label="s.title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="s.d" /></svg>
          </a>
        </div>
        <hr class="footer-rule">
        <div class="footer-prefs">
          <ThemeMenu :theme="theme" :labels="themeLabels" placement="top-start" @update:theme="emit('update:theme', $event)" />
          <LocaleMenu :locale="locale" :locales="locales" :label="t('footer.language')" placement="top-start" @update:locale="emit('update:locale', $event)" />
        </div>
      </div>

      <nav class="footer-cols" :aria-label="t('footer.navigation')">
        <div v-for="(column, index) in FOOTER_COLUMNS" :key="index" class="footer-col">
          <div v-for="group in column" :key="group.id" class="footer-group" :data-footer-group="group.id" role="group" :aria-label="t(group.labelKey)">
            <h2 class="footer-col-title">{{ t(group.labelKey) }}</h2>
            <ul class="footer-links">
              <li v-for="link in group.links" :key="link.slug">
                <a v-if="link.html" :href="link.href" class="footer-link" v-html="t(link.labelKey)" />
                <component :is="linkTag" v-else-if="link.site" v-bind="linkProps(link.href)" class="footer-link">{{ t(link.labelKey) }}</component>
                <a v-else :href="link.href" class="footer-link" :data-brand="link.brand">{{ t(link.labelKey) }}</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>

    <div class="footer-bottom">
      <p v-html="t('footer.rights')" />
    </div>
  </footer>
</template>
