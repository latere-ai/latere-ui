<script setup lang="ts">
// A content card: a regular-tier glass surface with comfortable padding. Inner
// regions that must stay crisp (code, media) should opt out of glass and paint
// an opaque background themselves — glass is chrome, not content.
import GlassSurface from './GlassSurface.vue';
import type { GlassTier } from '../glass/useGlass';

withDefaults(defineProps<{
  /** Override the tier if a panel needs a thinner/thicker material. */
  tier?: GlassTier;
  /** Drop the default padding (for panels that own their own layout). */
  flush?: boolean;
}>(), {
  tier: 'regular',
  flush: false,
});
</script>

<template>
  <GlassSurface :tier="tier" class="lu-panel" :class="{ 'lu-panel-flush': flush }">
    <slot />
  </GlassSurface>
</template>

<style scoped>
.lu-panel { padding: var(--space-5, 20px); }
.lu-panel-flush { padding: 0; }
</style>
