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
import { computed, nextTick, ref, watch } from 'vue';

import GlassIconButton from './GlassIconButton.vue';
import { productPlacement } from './productPlacement';
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
const shiftX = ref(0);
const shiftY = ref(0);

function reposition() {
  const anchor = root.value?.getBoundingClientRect();
  const pane = panel.value?.getBoundingClientRect();
  if (!anchor || !pane || typeof window === 'undefined') return;
  const placement = productPlacement(anchor, pane, { width: window.innerWidth, height: window.innerHeight });
  side.value = placement.side;
  align.value = placement.align;
  shiftX.value = placement.shiftX;
  shiftY.value = placement.shiftY;
}

watch(open, (isOpen, _previous, onCleanup) => {
  if (!isOpen) return;
  window.addEventListener('resize', reposition);
  // Capture scrolling inside host containers as well as the document.
  window.addEventListener('scroll', reposition, true);
  onCleanup(() => {
    window.removeEventListener('resize', reposition);
    window.removeEventListener('scroll', reposition, true);
  });
});

async function toggle() {
  open.value = !open.value;
  if (open.value) {
    // Measure after the panel renders; until then it keeps the default
    // bottom/start placement, so there is no flash of a wrong position.
    side.value = 'bottom';
    align.value = 'start';
    shiftX.value = 0;
    shiftY.value = 0;
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
        :style="{ '--lu-ps-shift-x': `${shiftX}px`, '--lu-ps-shift-y': `${shiftY}px` }"
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

<style src="../styles/components/product-switcher.css"></style>
