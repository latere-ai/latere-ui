<script setup lang="ts">
// Unstyled headless adapter around `createOrgSwitcher`. Renders a list of
// buttons (one per org plus a Personal row). Hosts apply their own CSS via
// the documented data attributes (`data-active`, `data-owner`) and the
// available named slots.

import type { OrgSwitcherState } from '../session/orgSwitcher';

interface Props {
  /** A state returned by `createOrgSwitcher`. */
  state: OrgSwitcherState;
}
defineProps<Props>();
</script>

<template>
  <div class="latere-org-switcher" data-loading="state.loading.value">
    <slot name="header" :current-label="state.currentLabel.value" />
    <ul role="menu" class="latere-org-switcher__list">
      <li
        v-for="item in state.items.value"
        :key="item.id || 'personal'"
        class="latere-org-switcher__item"
        :data-active="item.active ? 'true' : 'false'"
        :data-owner="item.owner ? 'true' : 'false'"
        role="none"
      >
        <slot name="item" :item="item" :select="() => state.select(item.id)">
          <button
            type="button"
            role="menuitem"
            class="latere-org-switcher__button"
            :aria-current="item.active ? 'true' : 'false'"
            @click="state.select(item.id)"
          >
            {{ item.name }}
          </button>
        </slot>
      </li>
    </ul>
    <slot v-if="state.error.value" name="error" :error="state.error.value" />
  </div>
</template>
