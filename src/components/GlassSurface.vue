<script setup lang="ts">
// Base Liquid Glass primitive. Every other Glass* component composes this: it
// paints one material tier by applying the corresponding global utility class
// from `latere-ui/glass` (so the centralized reduce-transparency fallback
// reaches it) and adds a rounded, positioned box for content to sit on.
//
// Requires the material CSS: `import 'latere-ui/glass'` once in the app.
import { computed } from 'vue';
import { glassClass, type GlassTier } from '../glass/useGlass';

const props = withDefaults(defineProps<{
  /** HTML tag (or component) to render as. */
  as?: string;
  /** Material depth. thin = controls, regular = panels/chrome, thick = overlays. */
  tier?: GlassTier;
  /** Lift the specular highlight on hover — for clickable surfaces. */
  interactive?: boolean;
}>(), {
  as: 'div',
  tier: 'regular',
  interactive: false,
});

const classes = computed(() => [
  'lu-gs',
  glassClass(props.tier),
  { 'lu-gs-interactive': props.interactive },
]);
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>

<style scoped>
.lu-gs {
  position: relative;
  border-radius: var(--glass-radius, 22px);
  color: var(--text, #0a0a0a);
}
.lu-gs-interactive {
  cursor: pointer;
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}
.lu-gs-interactive:hover {
  box-shadow: var(--glass-edge-thick, var(--glass-edge));
}
@media (prefers-reduced-motion: reduce) {
  .lu-gs-interactive { transition: none; }
}
</style>
