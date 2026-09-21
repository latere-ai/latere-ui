<script setup lang="ts">
import LatereLogoMark from './LatereLogoMark.vue';
import { PLATFORM_MARK } from '../brand/platformMark';
</script>

<template>
  <svg class="platform-logo-mark" :viewBox="PLATFORM_MARK.viewBox" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <LatereLogoMark v-bind="PLATFORM_MARK.logo" />
    <path :d="PLATFORM_MARK.layers" stroke="currentColor" :stroke-width="PLATFORM_MARK.strokeWidth"
      stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
