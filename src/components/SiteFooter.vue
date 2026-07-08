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

// Types now live in ../i18n/footer (a .ts module) and the package entrypoint
// re-exports them from there — never re-export types from a .vue file, since a
// consumer's `vue-tsc` can fall back to the default-only `*.vue` shim and lose
// the named members (breaks clean/SSG builds). Re-exported here for any code
// that still imports them from this SFC.
export type { Locale, Messages, Theme, LocaleOption };

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
      <a href="https://cella.latere.ai/"><span class="cella-brand">{{ t('footer.products.cella') }}</span></a>
      <a href="https://lux.latere.ai/"><span class="lux-brand">{{ t('footer.products.lux') }}</span></a>
      <a href="https://lectio.latere.ai/"><span class="lectio-brand">{{ t('footer.products.lectio') }}</span></a>
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
        <a href="https://discord.gg/kAHqEAEA" target="_blank" rel="noopener" title="Discord">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.198.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
        </a>
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
          <a href="https://wf.latere.ai/"><span class="wallfacer-brand">{{ t('footer.products.wallfacer') }}</span></a>
          <a href="https://topos.latere.ai/"><span class="topos-brand">{{ t('footer.products.topos') }}</span></a>
          <a href="https://cella.latere.ai/"><span class="cella-brand">{{ t('footer.products.cella') }}</span></a>
          <a href="https://lux.latere.ai/"><span class="lux-brand">{{ t('footer.products.lux') }}</span></a>
          <a href="https://lectio.latere.ai/"><span class="lectio-brand">{{ t('footer.products.lectio') }}</span></a>
        </div>
        <div class="footer-col">
          <h4 class="footer-col-title" v-html="t('footer.latere')" />
          <component :is="linkTag" v-bind="linkProps('/about')">{{ t('footer.about') }}</component>
          <component :is="linkTag" v-bind="linkProps('/blog/why-latere')">{{ t('footer.whyLatere') }}</component>
          <component :is="linkTag" v-bind="linkProps('/blog')">{{ t('footer.blog') }}</component>
          <a href="mailto:contact@latere.ai" v-html="t('footer.contact')" />
          <a href="https://auth.latere.ai/" v-html="t('footer.identity')" />
        </div>
        <div class="footer-col">
          <h4 class="footer-col-title" v-html="t('footer.legal')" />
          <component :is="linkTag" v-bind="linkProps('/legal/privacy')">{{ t('footer.privacy') }}</component>
          <component :is="linkTag" v-bind="linkProps('/legal/terms')">{{ t('footer.terms') }}</component>
          <component :is="linkTag" v-bind="linkProps('/legal/impressum')">{{ t('footer.impressum') }}</component>
        </div>
        <div class="footer-col">
          <h4 class="footer-col-title" v-html="t('footer.community')" />
          <a href="https://discord.gg/kAHqEAEA" target="_blank" rel="noopener" class="footer-external">Discord</a>
          <a href="https://x.com/LatereAI" target="_blank" rel="noopener" class="footer-external">X</a>
          <a href="https://github.com/latere-ai" target="_blank" rel="noopener" class="footer-external">GitHub</a>
          <a href="https://www.linkedin.com/company/latere-ai/about/" target="_blank" rel="noopener" class="footer-external">LinkedIn</a>
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
          <a href="https://discord.gg/kAHqEAEA" target="_blank" rel="noopener" title="Discord">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.198.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
          </a>
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
