<script setup lang="ts">
// Google-Workspace-style app grid: a GlassIconButton with a 3x3-dots glyph
// opening a panel with one tile per Latere product console. Tiles are plain
// anchors (the shared auth session makes cross-console SSO transparent); the
// current product renders as a non-navigating tile with a ring so users
// always see where they are.
//
// The panel is self-anchored to the trigger (below, start-aligned by
// default) and flips to the opposite side/alignment when the viewport would
// clip it, so it stays fully on-screen even from a narrow sidebar at the
// screen edge. Like AccountMenu's dropdown, it composites the glass tint
// OVER a solid surface: it commonly opens inside a glass sidebar whose own
// backdrop-filter neutralizes a nested blur, and a translucent fill would
// let the nav items bleed through. The solid base keeps it fully opaque.
// Escape / outside click close via useClickOutside, tiles are keyboard
// reachable in tab order, z-layering rides the --lu-z ladder. Requires
// `import 'latere-ui/glass'` (for the trigger button material).
import { computed, nextTick, ref } from 'vue';

import GlassIconButton from './GlassIconButton.vue';
import { useClickOutside } from '../composables/useClickOutside';
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

const root = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const open = ref(false);
useClickOutside(root, () => open.value, close);

// Collision-aware placement. Start below the trigger, aligned to its start
// edge (panel grows rightward, safe for a sidebar at the left screen edge);
// flip alignment/side only when the default would clip AND the flip fits.
const side = ref<'bottom' | 'top'>('bottom');
const align = ref<'start' | 'end'>('start');
const MARGIN = 8; // gap to the trigger and minimum inset from the viewport

function reposition() {
  const anchor = root.value?.getBoundingClientRect();
  const pane = panel.value?.getBoundingClientRect();
  if (!anchor || !pane || typeof window === 'undefined') return;
  const startClips = anchor.left + pane.width > window.innerWidth - MARGIN;
  const endFits = anchor.right - pane.width >= MARGIN;
  align.value = startClips && endFits ? 'end' : 'start';
  const bottomClips = anchor.bottom + MARGIN + pane.height > window.innerHeight - MARGIN;
  const topFits = anchor.top - MARGIN - pane.height >= MARGIN;
  side.value = bottomClips && topFits ? 'top' : 'bottom';
}

async function toggle() {
  open.value = !open.value;
  if (open.value) {
    // Measure after the panel renders; until then it keeps the default
    // bottom/start placement, so there is no flash of a wrong position.
    side.value = 'bottom';
    align.value = 'start';
    await nextTick();
    reposition();
  }
}
function close() {
  open.value = false;
}
</script>

<template>
  <div ref="root" class="lu-ps">
    <GlassIconButton
      :label="t.switchProduct"
      :size="size"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="true"
      @click="toggle"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="5" r="1.7" /><circle cx="12" cy="5" r="1.7" /><circle cx="19" cy="5" r="1.7" />
        <circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" />
        <circle cx="5" cy="19" r="1.7" /><circle cx="12" cy="19" r="1.7" /><circle cx="19" cy="19" r="1.7" />
      </svg>
    </GlassIconButton>
    <Transition name="lu-ps">
      <div
        v-if="open"
        ref="panel"
        class="lu-ps-panel"
        :data-side="side"
        :data-align="align"
      >
        <nav class="lu-ps-grid" :aria-label="t.products">
          <template v-for="p in products" :key="p.slug">
            <!-- The current console: marked with a ring, never a link, so a
                 stray click cannot reload the app the user is already in. -->
            <span v-if="p.slug === current" class="lu-ps-tile is-current" aria-current="true">
              <span class="lu-ps-ic" aria-hidden="true" v-html="p.icon" />
              <span class="lu-ps-name" :class="p.brandClass">{{ p.name }}</span>
              <span class="lu-ps-sr">{{ t.current }}</span>
            </span>
            <a v-else class="lu-ps-tile" :href="p.url" @click="close()">
              <span class="lu-ps-ic" aria-hidden="true" v-html="p.icon" />
              <span class="lu-ps-name" :class="p.brandClass">{{ p.name }}</span>
            </a>
          </template>
        </nav>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.lu-ps {
  position: relative;
  display: inline-block;
}
.lu-ps-panel {
  position: absolute;
  z-index: var(--lu-z-popover, 900);
  /* Opaque reading surface: glass tint composited over a solid base, so the
   * nav beneath never bleeds through even when a nested backdrop-filter
   * cannot resolve (see AccountMenu's dropdown for the full rationale). */
  background:
    linear-gradient(var(--glass-bg-thick, rgba(255, 255, 255, 0.9)),
                    var(--glass-bg-thick, rgba(255, 255, 255, 0.9))),
    var(--bg-surface, #fff);
  -webkit-backdrop-filter: blur(36px) saturate(180%);
  backdrop-filter: blur(36px) saturate(180%);
  border: 1px solid var(--glass-border, var(--border, #ccc));
  border-radius: var(--radius-lg, 22px);
  box-shadow: var(--shadow-glass, var(--shadow-lg, 0 8px 30px rgba(0, 0, 0, 0.12)));
  padding: 6px;
}
.lu-ps-panel[data-side='bottom'] { top: calc(100% + 8px); }
.lu-ps-panel[data-side='top'] { bottom: calc(100% + 8px); }
.lu-ps-panel[data-align='start'] { left: 0; }
.lu-ps-panel[data-align='end'] { right: 0; }
.lu-ps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  /* Fixed width: three 84px columns, so tiles never clip or reflow. */
  width: 264px;
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
/* The canonical marks arrive via v-html, outside this scope; size defensively. */
.lu-ps-ic :deep(svg) {
  width: 22px;
  height: 22px;
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
.lu-ps-enter-active, .lu-ps-leave-active { transition: opacity 0.14s ease, transform 0.14s ease; }
.lu-ps-enter-from, .lu-ps-leave-to { opacity: 0; transform: translateY(-4px); }
@media (prefers-reduced-motion: reduce) {
  .lu-ps-enter-active, .lu-ps-leave-active { transition: none; }
  .lu-ps-enter-from, .lu-ps-leave-to { transform: none; }
}
</style>
