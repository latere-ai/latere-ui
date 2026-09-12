<script setup lang="ts">
// Base Liquid Glass primitive. Every other Glass* component composes this: it
// paints one material tier by applying the corresponding global utility class
// from `latere-ui/glass` (so the centralized reduce-transparency fallback
// reaches it) and adds a rounded, positioned box for content to sit on.
//
// Requires the material CSS: `import 'latere-ui/glass'` once in the app.
import { computed } from 'vue';
import '../styles/components/glass-surface.css';
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
