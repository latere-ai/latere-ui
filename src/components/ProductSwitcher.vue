<script setup lang="ts">
// Google-Workspace-style app grid: a GlassIconButton with a 3x3-dots glyph
// opening a GlassPopover with one tile per Latere product console. Tiles are
// plain anchors (the shared auth session makes cross-console SSO transparent);
// the current product renders as a non-navigating tile with a ring so users
// always see where they are. Escape / outside click close via GlassPopover,
// tiles are keyboard reachable in tab order, z-layering rides the --lu-z
// ladder. Requires `import 'latere-ui/glass'`.
import { computed } from 'vue';

import GlassIconButton from './GlassIconButton.vue';
import GlassPopover from './GlassPopover.vue';
import {
  DEFAULT_PRODUCT_SWITCHER_LABELS,
  LATERE_PRODUCTS,
  type ProductInfo,
  type ProductSwitcherLabelOverrides,
  type ProductSwitcherLabels,
} from './productSwitcher';

export type { ProductInfo, ProductSwitcherLabels };

const props = withDefaults(
  defineProps<{
    /** Slug of the console rendering the switcher; its tile does not navigate. */
    current: string;
    /** Product list override (filtering, localization); defaults to the registry. */
    products?: readonly ProductInfo[];
    /** Per-locale a11y label overrides. */
    labels?: ProductSwitcherLabelOverrides;
    /** Trigger button size; `sm` for dense chrome like the console sidebar head. */
    size?: 'sm' | 'md';
  }>(),
  {
    products: () => LATERE_PRODUCTS,
    labels: undefined,
    size: 'md',
  },
);

const t = computed<ProductSwitcherLabels>(() => ({
  ...DEFAULT_PRODUCT_SWITCHER_LABELS,
  ...props.labels,
}));
</script>

<template>
  <GlassPopover class="lu-ps" placement="bottom-end">
    <template #trigger="{ open }">
      <GlassIconButton
        :label="t.switchProduct"
        :size="size"
        :aria-expanded="open ? 'true' : 'false'"
        aria-haspopup="true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="5" r="1.7" /><circle cx="12" cy="5" r="1.7" /><circle cx="19" cy="5" r="1.7" />
          <circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" />
          <circle cx="5" cy="19" r="1.7" /><circle cx="12" cy="19" r="1.7" /><circle cx="19" cy="19" r="1.7" />
        </svg>
      </GlassIconButton>
    </template>
    <template #default="{ close }">
      <nav class="lu-ps-grid" :aria-label="t.products">
        <template v-for="p in products" :key="p.slug">
          <!-- The current console: marked with a ring, never a link, so a
               stray click cannot reload the app the user is already in. -->
          <span v-if="p.slug === current" class="lu-ps-tile is-current" aria-current="true">
            <span class="lu-ps-ic" :style="{ color: p.color }" aria-hidden="true">
              <svg
                width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                v-html="p.icon"
              />
            </span>
            <span class="lu-ps-name" :class="p.brandClass">{{ p.name }}</span>
            <span class="lu-ps-sr">{{ t.current }}</span>
          </span>
          <a v-else class="lu-ps-tile" :href="p.url" @click="close()">
            <span class="lu-ps-ic" :style="{ color: p.color }" aria-hidden="true">
              <svg
                width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                v-html="p.icon"
              />
            </span>
            <span class="lu-ps-name" :class="p.brandClass">{{ p.name }}</span>
          </a>
        </template>
      </nav>
    </template>
  </GlassPopover>
</template>

<style scoped>
.lu-ps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 4px;
  width: 264px;
  max-width: min(264px, calc(100vw - 32px));
}
.lu-ps-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 4px 10px;
  border-radius: var(--radius-md, 14px);
  text-decoration: none;
  color: var(--text, #111);
  position: relative;
  transition: background 0.12s ease;
}
.lu-ps-tile:hover {
  background: var(--accent-subtle, var(--bg-raised, rgba(0, 0, 0, 0.05)));
}
.lu-ps-tile:focus-visible {
  outline: 2px solid var(--accent, #171717);
  outline-offset: -2px;
}
/* Current console: a quiet ring instead of a hover surface. */
.lu-ps-tile.is-current {
  box-shadow: inset 0 0 0 1.5px var(--accent, #171717);
  cursor: default;
}
.lu-ps-tile.is-current:hover {
  background: transparent;
}
.lu-ps-ic {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
}
.lu-ps-name {
  font-size: 12px;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Visually hidden current-product marker for screen readers. */
.lu-ps-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
