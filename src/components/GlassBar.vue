<script setup lang="ts">
// A horizontal chrome bar — top strip, toolbar, section header. Regular-tier
// glass that is safe to lay over scrolling content (that is the point of the
// material). Use `sticky` to pin it to the top of a scroll container.
import GlassSurface from './GlassSurface.vue';

withDefaults(defineProps<{
  /** Render as a <header> instead of a <div>. */
  header?: boolean;
  /** position: sticky; top: 0 — pins the bar while content scrolls under it. */
  sticky?: boolean;
}>(), {
  header: false,
  sticky: false,
});
</script>

<template>
  <GlassSurface
    :as="header ? 'header' : 'div'"
    tier="regular"
    class="lu-bar"
    :class="{ 'lu-bar-sticky': sticky }"
  >
    <slot />
  </GlassSurface>
</template>

<style scoped>
.lu-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-2, 8px) var(--space-4, 16px);
  border-radius: var(--radius-pill, 999px);
}
.lu-bar-sticky {
  position: sticky;
  top: 0;
  z-index: 20;
}
</style>
