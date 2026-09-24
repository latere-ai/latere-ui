<script setup lang="ts">
// One stroke icon from the console set (src/console/icons.ts). A name outside
// the set renders nothing, so a host can pass any `NavItem.icon` and a row
// without a known icon keeps no slot.
import { computed } from 'vue';

import { consoleIcon, consoleIconAttrs } from '../console/icons';

const props = withDefaults(defineProps<{
  /** A name from the built-in set; any other string renders nothing. */
  name: string;
  /** Edge length in CSS pixels. */
  size?: number;
}>(), { size: 16 });

const shape = computed(() => consoleIcon(props.name));
const attrs = computed(() => consoleIconAttrs(props.size));
</script>

<template>
  <svg v-if="shape" v-bind="attrs" class="lu-ci" :data-icon="name">
    <component :is="tag" v-for="([tag, shapeAttrs], i) in shape" :key="i" v-bind="shapeAttrs" />
  </svg>
</template>
