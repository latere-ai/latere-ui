<script setup lang="ts">
import { computed, type Component } from 'vue';
import { translator, type Locale, type Messages } from '../i18n/footer';
import LatereLogoMark from './LatereLogoMark.vue';

export type Theme = 'light' | 'dark' | 'auto';
export type { Locale, Messages };

/** One selectable language in the footer's locale dropdown. */
export interface LocaleOption {
  code: string;
  /** Short label (e.g. "EN", "中"); falls back to `code` if `name` is absent. */
  label: string;
  /** Full display name shown in the dropdown (e.g. "English", "中文"). */
  name?: string;
}

const props = withDefaults(defineProps<{
  /** Current theme; drives the active state of the theme toggle. */
  theme: Theme;
  /** Current locale; selects footer copy and the active language option. */
  locale: Locale;
  /** Languages offered in the locale dropdown. Defaults to English + Chinese. */
  locales?: LocaleOption[];
  /** Per-locale string overrides, merged over the bundled footer dictionaries. */
  messages?: Messages;
  /**
   * Compact layout: brand + a single wrapped row of links + controls, instead
   * of the full product-showcase columns. ~1/3 the height; for app surfaces
   * (auth, dashboards) where the full footer is too tall.
   */
  compact?: boolean;
  /** Origin used for the site's own links (Team, Blog, Legal, home). */
  baseUrl?: string;
  /**
   * Optional router-link component. When provided (e.g. vue-router's
   * RouterLink), internal links render through it with a relative `to`,
   * preserving SPA navigation. Otherwise they fall back to absolute `<a>`.
   */
  routerLink?: Component;
}>(), {
  locales: () => [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'zh', label: '中', name: '中文' },
  ],
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

const themes: { v: Theme; label: string }[] = [
  { v: 'light', label: '☀' },
  { v: 'dark', label: '☾' },
  { v: 'auto', label: '◐' },
];

function onLocaleChange(e: Event) {
  emit('update:locale', (e.target as HTMLSelectElement).value);
}

// Internal link rendering: relative `to` for routerLink, absolute href otherwise.
const linkTag = computed<Component | 'a'>(() => props.routerLink ?? 'a');
function linkProps(path: string) {
  return props.routerLink ? { to: path } : { href: props.baseUrl + path };
}
</script>

<template>
  <!-- Compact: a single-line bar (copyright · scrollable links · controls) for
       app surfaces where the full footer is too tall. Stays one line tall at any
       width; the link strip scrolls horizontally when it does not fit. -->
  <footer v-if="compact" class="site-footer site-footer-compact">
    <p class="footer-compact-copy" v-html="t('footer.rights')" />
    <nav class="footer-compact-links" :aria-label="t('footer.products')">
      <a href="https://wf.latere.ai/"><span class="wallfacer-brand">{{ t('footer.products.wallfacer') }}</span></a>
      <a href="https://topos.latere.ai/"><span class="topos-brand">{{ t('footer.products.topos') }}</span></a>
      <a href="https://agon.latere.ai/"><span class="agon-brand">{{ t('footer.products.agon') }}</span></a>
      <a href="https://cella.latere.ai/"><span class="cella-brand">{{ t('footer.products.cella') }}</span></a>
      <a href="https://lux.latere.ai/"><span class="lux-brand">{{ t('footer.products.lux') }}</span></a>
      <a href="https://auth.latere.ai/" v-html="t('footer.identity')" />
      <component :is="linkTag" v-bind="linkProps('/about')">{{ t('footer.team') }}</component>
      <component :is="linkTag" v-bind="linkProps('/blog')">{{ t('footer.blog') }}</component>
      <a href="mailto:contact@latere.ai" v-html="t('footer.contact')" />
      <component :is="linkTag" v-bind="linkProps('/legal/privacy')">{{ t('footer.privacy') }}</component>
      <component :is="linkTag" v-bind="linkProps('/legal/terms')">{{ t('footer.terms') }}</component>
      <component :is="linkTag" v-bind="linkProps('/legal/impressum')">{{ t('footer.impressum') }}</component>
    </nav>
    <div class="footer-extra">
      <div class="footer-prefs">
        <div class="footer-seg" role="group" :aria-label="t('footer.theme')">
          <button
            v-for="opt in themes"
            :key="opt.v"
            type="button"
            class="footer-seg-btn"
            :class="{ 'is-active': theme === opt.v }"
            @click="emit('update:theme', opt.v)">{{ opt.label }}</button>
        </div>
        <div class="footer-lang">
          <select
            class="footer-lang-select"
            :value="locale"
            :aria-label="t('footer.language')"
            @change="onLocaleChange">
            <option v-for="opt in locales" :key="opt.code" :value="opt.code">{{ opt.name ?? opt.label }}</option>
          </select>
        </div>
      </div>
      <div class="footer-social">
        <a href="https://www.linkedin.com/company/latere-ai/about/" target="_blank" rel="noopener" title="LinkedIn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <a href="https://x.com/LatereAI" target="_blank" rel="noopener" title="X">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="https://github.com/latere-ai" target="_blank" rel="noopener" title="GitHub">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        </a>
      </div>
    </div>
  </footer>

  <footer v-else class="site-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <component :is="linkTag" v-bind="linkProps('/')" class="logo-link">
          <span class="logo-mark logo-mark-footer" aria-hidden="true">
            <LatereLogoMark class="logo-mark-icon" />
          </span>
          <span class="logo-text">Latere AI</span>
        </component>
        <p class="footer-tagline" v-html="t('footer.tagline')" />
      </div>

      <div class="footer-cols">
        <div class="footer-col">
          <h4 class="footer-col-title" v-html="t('footer.products')" />
          <div class="footer-subgroup">
            <span class="footer-subgroup-title" v-html="t('nav.cat.workspace')" />
            <a href="https://wf.latere.ai/"><span class="wallfacer-brand">{{ t('footer.products.wallfacer') }}</span></a>
          </div>
          <div class="footer-subgroup">
            <span class="footer-subgroup-title" v-html="t('nav.cat.agents')" />
            <a href="https://topos.latere.ai/"><span class="topos-brand">{{ t('footer.products.topos') }}</span></a>
            <a href="https://agon.latere.ai/"><span class="agon-brand">{{ t('footer.products.agon') }}</span></a>
          </div>
          <div class="footer-subgroup">
            <span class="footer-subgroup-title" v-html="t('nav.cat.infrastructure')" />
            <a href="https://cella.latere.ai/"><span class="cella-brand">{{ t('footer.products.cella') }}</span></a>
            <a href="https://lux.latere.ai/"><span class="lux-brand">{{ t('footer.products.lux') }}</span></a>
          </div>
        </div>
        <div class="footer-col">
          <h4 class="footer-col-title" v-html="t('footer.foundation')" />
          <a href="https://auth.latere.ai/" v-html="t('footer.identity')" />
          <p class="footer-col-note" v-html="t('footer.identity.note')" />
        </div>
        <div class="footer-col">
          <h4 class="footer-col-title" v-html="t('footer.company')" />
          <component :is="linkTag" v-bind="linkProps('/about')">{{ t('footer.team') }}</component>
          <component :is="linkTag" v-bind="linkProps('/blog')">{{ t('footer.blog') }}</component>
          <a href="mailto:contact@latere.ai" v-html="t('footer.contact')" />
        </div>
        <div class="footer-col">
          <h4 class="footer-col-title" v-html="t('footer.legal')" />
          <component :is="linkTag" v-bind="linkProps('/legal/privacy')">{{ t('footer.privacy') }}</component>
          <component :is="linkTag" v-bind="linkProps('/legal/terms')">{{ t('footer.terms') }}</component>
          <component :is="linkTag" v-bind="linkProps('/legal/impressum')">{{ t('footer.impressum') }}</component>
        </div>
      </div>

      <div class="footer-extra">
        <div class="footer-prefs">
          <div class="footer-seg" role="group" :aria-label="t('footer.theme')">
            <button
              v-for="opt in themes"
              :key="opt.v"
              type="button"
              class="footer-seg-btn"
              :class="{ 'is-active': theme === opt.v }"
              @click="emit('update:theme', opt.v)">{{ opt.label }}</button>
          </div>
          <div class="footer-lang">
            <select
              class="footer-lang-select"
              :value="locale"
              :aria-label="t('footer.language')"
              @change="onLocaleChange">
              <option v-for="opt in locales" :key="opt.code" :value="opt.code">{{ opt.name ?? opt.label }}</option>
            </select>
          </div>
        </div>
        <div class="footer-social">
          <a href="https://www.linkedin.com/company/latere-ai/about/" target="_blank" rel="noopener" title="LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://x.com/LatereAI" target="_blank" rel="noopener" title="X">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://github.com/latere-ai" target="_blank" rel="noopener" title="GitHub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p v-html="t('footer.rights')" />
    </div>
  </footer>
</template>
