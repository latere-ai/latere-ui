<script setup lang="ts">
// Shared product-console sidebar: brand headline · grouped nav tabs · foldable
// rail · an account foot slot. Styled via the opt-in `latere-ui/console`
// stylesheet (class prefix `lu-cs-`), with state surfaced as data attributes so
// hosts can override. The nav model and collapse logic are headless
// (src/console/nav.ts); this is the thin Vue adapter, mirroring OrgSwitcher.vue.

import { computed, ref, type Component } from 'vue';

import {
  partitionGroups,
  isItemDisabled,
  type ConsoleNavModel,
  type NavGroup,
  type NavItem,
} from '../console/nav';

type BrandTheme = 'lux' | 'cella' | 'topos' | 'wallfacer' | 'agon' | 'lectio';

interface Props {
  /** Grouped navigation model. */
  model: ConsoleNavModel;
  /** Active row: matched against `NavItem.id`. */
  activeKey?: string;
  /**
   * Controlled collapsed state (v-model:collapsed). Omit (null) for an
   * uncontrolled rail that manages its own state. `null` rather than
   * `undefined` is the "unset" sentinel because Vue casts an absent
   * Boolean-typed prop to `false`, which would otherwise look controlled.
   */
  collapsed?: boolean | null;
  /** Show the fold button. Set false for a fixed rail (sandbox). */
  collapsible?: boolean;
  /** Injected RouterLink component; falls back to a plain `<a>` off-router. */
  routerLink?: Component;
  /** Home target for the brand link. */
  homeTo?: string;
  /** Gradient wordmark theme for the default brand. */
  brandTheme?: BrandTheme;
  /** Product name shown in the default brand (e.g. "Lux"). */
  brandName?: string;
  /** Subtitle under the brand (e.g. "Console"). */
  brandSub?: string;
  /** When collapsed, clicking the brand expands the rail (wallfacer affordance). */
  expandOnBrandClick?: boolean;
  /** Label rendered next to the live-badge dot. */
  liveLabel?: string;
  /** Accessible labels for the fold button. */
  expandLabel?: string;
  collapseLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  collapsible: true,
  collapsed: null,
  homeTo: '/',
  liveLabel: 'Live',
  expandLabel: 'Expand sidebar',
  collapseLabel: 'Collapse sidebar',
});

const emit = defineEmits<{
  'update:collapsed': [boolean];
  navigate: [NavItem];
}>();

// Controlled when `collapsed` is passed; otherwise the rail owns its state.
const internalCollapsed = ref(false);
const isControlled = computed(
  () => props.collapsed !== null && props.collapsed !== undefined,
);
const collapsed = computed(() =>
  isControlled.value ? !!props.collapsed : internalCollapsed.value,
);

function setCollapsed(v: boolean) {
  if (!isControlled.value) internalCollapsed.value = v;
  emit('update:collapsed', v);
}
function toggle() {
  setCollapsed(!collapsed.value);
}

// Top groups first, then bottom-pinned groups. The first bottom group is
// flagged so CSS can push it (and everything after) to the rail's foot.
const orderedGroups = computed<(NavGroup & { firstPinned: boolean })[]>(() => {
  const { top, bottom } = partitionGroups(props.model.groups);
  return [
    ...top.map((g) => ({ ...g, firstPinned: false })),
    ...bottom.map((g, i) => ({ ...g, firstPinned: i === 0 })),
  ];
});

function rowActive(item: NavItem): boolean {
  return props.activeKey !== undefined && item.id === props.activeKey;
}

// The element a nav row renders as: the injected RouterLink, a plain anchor,
// or a non-interactive span for disabled rows.
function rowTag(item: NavItem): Component | string {
  if (isItemDisabled(item)) return 'span';
  if (props.routerLink && !item.external) return props.routerLink;
  return 'a';
}

// Bind the right href/to attr for whichever tag we render.
function rowProps(item: NavItem): Record<string, unknown> {
  if (isItemDisabled(item)) return {};
  if (props.routerLink && !item.external) return { to: item.to };
  return item.external
    ? { href: item.to, target: '_blank', rel: 'noreferrer' }
    : { href: item.to };
}

function onRowClick(item: NavItem, e: MouseEvent) {
  if (isItemDisabled(item)) {
    e.preventDefault();
    return;
  }
  emit('navigate', item);
}

function onBrandClick(e: MouseEvent) {
  if (props.expandOnBrandClick && collapsed.value) {
    e.preventDefault();
    setCollapsed(false);
  }
}

// First grapheme of the label, used as a fallback mark in collapsed mode when
// the host supplies no #icon slot.
function letter(label: string): string {
  return (label.trim()[0] ?? '?').toUpperCase();
}
</script>

<template>
  <aside class="lu-cs" :data-collapsed="collapsed ? 'true' : 'false'">
    <div class="lu-cs-head">
      <slot name="brand" :collapsed="collapsed">
        <component
          :is="routerLink ?? 'a'"
          v-bind="routerLink ? { to: homeTo } : { href: homeTo }"
          class="lu-cs-brand"
          @click="onBrandClick"
        >
          <span class="lu-cs-brand-mark">{{ letter(brandName ?? 'L') }}</span>
          <span v-if="!collapsed" class="lu-cs-brand-text">
            <span class="lu-cs-brand-name" :class="brandTheme ? `${brandTheme}-brand` : undefined">{{ brandName }}</span>
            <span v-if="brandSub" class="lu-cs-brand-sub">{{ brandSub }}</span>
          </span>
        </component>
      </slot>

      <slot name="brand-extra" :collapsed="collapsed" />

      <button
        v-if="collapsible"
        type="button"
        class="lu-cs-fold"
        :title="collapsed ? expandLabel : collapseLabel"
        :aria-label="collapsed ? expandLabel : collapseLabel"
        @click="toggle"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="9" y1="4" x2="9" y2="20" />
          <polyline v-if="!collapsed" points="15.5 9 13 12 15.5 15" />
          <polyline v-else points="13 9 15.5 12 13 15" />
        </svg>
      </button>
    </div>

    <slot name="top" :collapsed="collapsed" />

    <nav class="lu-cs-nav">
      <div
        v-for="(g, gi) in orderedGroups"
        :key="`g-${gi}`"
        class="lu-cs-group"
        :class="{ 'lu-cs-group-pinned': g.firstPinned }"
        :data-pin="g.pin === 'bottom' ? 'bottom' : 'top'"
      >
        <div v-if="g.label && !collapsed" class="lu-cs-group-label">{{ g.label }}</div>
        <slot
          v-for="item in g.items"
          :key="item.id"
          name="item"
          :item="item"
          :active="rowActive(item)"
          :collapsed="collapsed"
          :disabled="isItemDisabled(item)"
        >
          <component
            :is="rowTag(item)"
            v-bind="rowProps(item)"
            class="lu-cs-item"
            :data-active="rowActive(item) ? 'true' : 'false'"
            :data-disabled="isItemDisabled(item) ? 'true' : 'false'"
            :title="collapsed ? item.label : (isItemDisabled(item) ? 'Not yet available' : undefined)"
            :aria-current="rowActive(item) ? 'page' : undefined"
            @click="(e: MouseEvent) => onRowClick(item, e)"
          >
            <span class="lu-cs-item-icon">
              <slot name="icon" :item="item" :collapsed="collapsed">{{ collapsed ? letter(item.label) : '' }}</slot>
            </span>
            <span v-if="!collapsed" class="lu-cs-item-label">{{ item.label }}</span>
            <template v-if="item.badge !== undefined && !collapsed">
              <span v-if="item.badge === 'live'" class="lu-cs-badge lu-cs-badge-live">
                <span class="lu-cs-badge-dot" aria-hidden="true" />{{ liveLabel }}
              </span>
              <span v-else class="lu-cs-badge">{{ item.badge }}</span>
            </template>
          </component>
        </slot>
      </div>

      <!-- App-specific contextual content (recent lists, filters, workspace
           switcher) flows below the nav groups, within the scroll area. -->
      <slot name="extra" :collapsed="collapsed" />
    </nav>

    <div class="lu-cs-foot">
      <slot name="foot" :collapsed="collapsed" />
    </div>
  </aside>
</template>
