<script setup lang="ts">
// Shared product-console sidebar: brand headline · grouped nav tabs · foldable
// rail · an account foot slot. Styled via the opt-in `latere-ui/console`
// stylesheet (class prefix `lu-cs-`), with state surfaced as data attributes so
// hosts can override. The nav model and collapse logic are headless
// (src/console/nav.ts); this is the thin Vue adapter, mirroring OrgSwitcher.vue.

import {
  computed,
  h,
  onMounted,
  onUnmounted,
  ref,
  useId,
  useSlots,
  watch,
  type Component,
  type FunctionalComponent,
  type VNodeChild,
} from 'vue';

import {
  activePath,
  hasChildren,
  isItemDisabled,
  navTarget,
  partitionGroups,
  type ConsoleNavModel,
  type NavFootItem,
  type NavGroup,
  type NavItem,
} from '../console/nav';
import { consoleIcon } from '../console/icons';
import { handleNavKey } from '../console/navKeys';
import {
  DEFAULT_NAV_OPEN_KEY,
  isNavOpen,
  openActivePath,
  readNavOpen,
  setNavOpen,
  writeNavOpen,
} from '../console/openState';
import ConsoleIcon from './ConsoleIcon.vue';
import ProductSwitcher from './ProductSwitcher.vue';
import type { ProductSwitcherLabelOverrides } from './productSwitcher';

type BrandTheme = 'lux' | 'cella' | 'topos' | 'wallfacer' | 'lectio';

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
  /**
   * Compact head: the brand, name and fold button share one row as tall as a
   * nav row, and the collapsed rail keeps a single button that shows the
   * logo and expands the rail. Also sets the rail's inset from
   * `--lu-cs-inset` and the account card's corner from `--radius-window`.
   */
  compact?: boolean;
  /**
   * localStorage key under which the open parents persist for this viewer.
   * `null` keeps them for the page's lifetime only.
   */
  openKey?: string | null;
  /** Rows set in the foot above the #foot slot: links or actions with a value. */
  footItems?: NavFootItem[];
  /**
   * Where groups pinned to the bottom render. `'nav'` (the default) ends the
   * scrolling nav with them; `'foot'` sets them in the foot with the foot
   * rows, above the #foot slot, so they stay in view while the nav scrolls
   * and read as one group with the foot rows.
   */
  bottomGroups?: 'nav' | 'foot';
  /**
   * The chip a row with an `audience` carries in the expanded rail, and the
   * suffix of its collapsed tooltip. A row whose own label already says it
   * (a row named "Admin") carries no chip.
   */
  audienceLabel?: string;
  /** Injected RouterLink component; falls back to a plain `<a>` off-router. */
  routerLink?: Component;
  /** Home target for the brand link. */
  homeTo?: string;
  /** Gradient wordmark theme for the default brand. */
  brandTheme?: BrandTheme;
  /** Display name shown in the default brand (e.g. "Workspace"). */
  brandName?: string;
  /** Subtitle under the brand (e.g. "Console"). */
  brandSub?: string;
  /**
   * Background for the logo box (any CSS color/gradient). Gives each product a
   * distinct, colored logo mark while keeping one consistent brand layout.
   * Provide the mark itself via the #logo slot.
   */
  brandColor?: string;
  /** When collapsed, clicking the brand expands the rail (optional). */
  expandOnBrandClick?: boolean;
  /** Show the built-in search bar (emits `search`; ⌘K/Ctrl-K also emits it). */
  search?: boolean;
  /** Search bar placeholder label. */
  searchLabel?: string;
  /** Keyboard hint shown in the search bar. */
  searchHint?: string;
  /** Label rendered next to the live-badge dot. */
  liveLabel?: string;
  /** Accessible labels for the fold button. */
  expandLabel?: string;
  collapseLabel?: string;
  /**
   * Slug of this console in the shared product registry. When
   * set, a ProductSwitcher (cross-console app grid) renders in the head next
   * to the brand; when omitted the head is byte-for-byte what it was, so
   * existing adopters are unaffected until they opt in. Requires the
   * `latere-ui/glass` stylesheet (for the popover material).
   */
  product?: string;
  /** A11y label overrides forwarded to the ProductSwitcher. */
  productLabels?: ProductSwitcherLabelOverrides;
}

const props = withDefaults(defineProps<Props>(), {
  collapsible: true,
  compact: false,
  openKey: DEFAULT_NAV_OPEN_KEY,
  collapsed: null,
  homeTo: '/',
  searchLabel: 'Search',
  searchHint: '⌘K',
  liveLabel: 'Live',
  expandLabel: 'Expand sidebar',
  collapseLabel: 'Collapse sidebar',
  bottomGroups: 'nav',
  audienceLabel: 'Admin',
});

const emit = defineEmits<{
  'update:collapsed': [boolean];
  navigate: [NavItem];
  search: [];
}>();

// Global ⌘K / Ctrl-K opens search, so every console shares the shortcut.
function onKeydown(e: KeyboardEvent) {
  if (!props.search) return;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    emit('search');
  }
}
onMounted(() => {
  if (typeof document !== 'undefined') document.addEventListener('keydown', onKeydown);
});
onUnmounted(() => {
  if (typeof document !== 'undefined') document.removeEventListener('keydown', onKeydown);
});

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

// Top groups first, then bottom-pinned groups, which end the nav or, with
// `bottomGroups="foot"`, open the foot. The first bottom group in the nav is
// flagged so CSS can push it (and everything after) to the rail's foot.
const partitioned = computed(() => partitionGroups(props.model.groups));
const navGroups = computed<(NavGroup & { firstPinned: boolean })[]>(() => [
  ...partitioned.value.top.map((g) => ({ ...g, firstPinned: false })),
  ...(props.bottomGroups === 'foot' ? [] : partitioned.value.bottom.map((g, i) => ({ ...g, firstPinned: i === 0 }))),
]);
const footGroups = computed<(NavGroup & { firstPinned: boolean })[]>(() =>
  props.bottomGroups === 'foot' ? partitioned.value.bottom.map((g) => ({ ...g, firstPinned: false })) : [],
);

function rowActive(item: NavItem): boolean {
  return props.activeKey !== undefined && item.id === props.activeKey;
}

const slots = useSlots();
const navId = useId();
const navEl = ref<HTMLElement | null>(null);
const path = computed(() => activePath(props.model.groups, props.activeKey));
const openState = ref(readNavOpen(props.openKey));
// Arriving at a page opens every parent above it; the viewer's choice for
// any other parent stays as they left it.
watch(path, (p) => {
  const next = openActivePath(openState.value, p);
  if (next === openState.value) return;
  openState.value = next;
  writeNavOpen(props.openKey, next);
}, { immediate: true });

function setOpen(id: string, open: boolean) {
  const next = setNavOpen(openState.value, id, open);
  if (next === openState.value) return;
  openState.value = next;
  writeNavOpen(props.openKey, next);
}
function isOpen(item: NavItem): boolean {
  return isNavOpen(openState.value, item.id, path.value);
}
function onNavKeydown(e: KeyboardEvent) {
  if (navEl.value) handleNavKey(e, navEl.value, setOpen);
}
const footNavEl = ref<HTMLElement | null>(null);
function onFootNavKeydown(e: KeyboardEvent) {
  if (footNavEl.value) handleNavKey(e, footNavEl.value, setOpen);
}

// The audience chip a row carries, unless its label already names the
// audience; and the audience in the collapsed rail's tooltip.
function namesAudience(item: NavItem): boolean {
  return item.label.trim().toLowerCase() === props.audienceLabel.trim().toLowerCase();
}
function audienceChip(item: NavItem): VNodeChild {
  if (!item.audience || collapsed.value || namesAudience(item)) return null;
  return h('span', { class: 'lu-cs-audience' }, props.audienceLabel);
}
function audienceTitle(item: NavItem, label: string): string {
  return item.audience && !namesAudience(item) ? `${label} · ${props.audienceLabel}` : label;
}
// A row on the path to the current page: the page itself or a parent of it.
function inPath(item: NavItem): boolean {
  return path.value.some((p) => p.id === item.id);
}
function groupId(item: NavItem): string {
  return `${navId}-${item.id}`;
}
// A collapsed rail has no room for children: a parent is a link to its own
// page, or its first child's.
function collapsedLink(item: NavItem): NavItem {
  return { ...item, to: navTarget(item), children: undefined };
}

// The icon a row shows: the host's #icon slot, a built-in one named by
// `item.icon`, or, for a top-level row in the collapsed rail, the label's
// first letter. Nothing at all renders no slot, so a label never follows
// empty space.
function hasIcon(item: NavItem, depth: number): boolean {
  return !!slots.icon || !!consoleIcon(item.icon) || (collapsed.value && depth === 0);
}
const IconSlot: FunctionalComponent<{ item: NavItem; depth: number }> = ({ item, depth }) => {
  if (!hasIcon(item, depth)) return null;
  const content: VNodeChild = slots.icon
    ? slots.icon({ item, collapsed: collapsed.value })
    : consoleIcon(item.icon)
      ? h(ConsoleIcon, { name: item.icon! })
      : letter(item.label);
  return h('span', { class: 'lu-cs-item-icon' }, [content]);
};
IconSlot.props = ['item', 'depth'];

// One link, action or disabled row. `active` overrides the row's own match
// (a collapsed parent carries the selection for its children); `value` is a
// foot row's trailing text.
const LeafRow: FunctionalComponent<{ item: NavItem; depth: number; active?: boolean; value?: string; extraClass?: string }> = ({ item, depth, active, value, extraClass }) => {
  const selected = active ?? rowActive(item);
  const disabled = isItemDisabled(item);
  const label = value !== undefined ? `${item.label} ${value}` : item.label;
  const tag = rowTag(item);
  const children = [
    h(IconSlot, { item, depth }),
    !collapsed.value ? h('span', { class: 'lu-cs-item-label' }, item.label) : null,
    audienceChip(item),
    item.dot && !collapsed.value ? h('span', { class: 'lu-cs-dot', 'aria-hidden': 'true' }) : null,
    item.badge !== undefined && !collapsed.value
      ? item.badge === 'live'
        ? h('span', { class: 'lu-cs-badge lu-cs-badge-live' }, [h('span', { class: 'lu-cs-badge-dot', 'aria-hidden': 'true' }), props.liveLabel])
        : h('span', { class: 'lu-cs-badge' }, String(item.badge))
      : null,
    value !== undefined && !collapsed.value ? h('span', { class: 'lu-cs-item-value' }, value) : null,
  ];
  const attrs = {
    ...rowProps(item),
    class: ['lu-cs-item', depth > 0 ? 'lu-cs-child' : '', extraClass ?? ''].filter(Boolean).join(' '),
    'data-active': selected ? 'true' : 'false',
    'data-disabled': disabled ? 'true' : 'false',
    'data-nav-id': item.id,
    'data-audience': item.audience,
    title: collapsed.value ? audienceTitle(item, label) : disabled ? 'Not yet available' : undefined,
    'aria-current': rowActive(item) ? 'page' : undefined,
    onClick: (e: MouseEvent) => onRowClick(item, e),
  };
  return typeof tag === 'string' ? h(tag, attrs, children) : h(tag, attrs, { default: () => children });
};
// Declared so the template's kebab-case attributes reach the render as props
// (an undeclared `active` would also arrive as '' rather than undefined).
LeafRow.props = ['item', 'depth', 'active', 'value', 'extraClass'];

// A group's rows, rendered in the nav or in the foot. A parent in the
// expanded rail is a disclosure over its children, which stay in the DOM and
// are hidden while folded; in the collapsed rail it is a link that carries
// the selection while any page under it is open. Every row passes through
// the #item slot when the host fills it.
function itemRow(item: NavItem, depth: number): VNodeChild {
  return slots.item
    ? slots.item({ item, active: rowActive(item), collapsed: collapsed.value, disabled: isItemDisabled(item) })
    : h(LeafRow, { key: item.id, item, depth });
}
const GroupRows: FunctionalComponent<{ items: NavItem[] }> = ({ items }) =>
  items.flatMap((item): VNodeChild[] => {
    if (hasChildren(item) && !collapsed.value) {
      const open = isOpen(item);
      return [
        h('button', {
          key: item.id,
          type: 'button',
          class: 'lu-cs-item lu-cs-parent',
          'data-active': rowActive(item) ? 'true' : 'false',
          'data-path': inPath(item) ? 'true' : 'false',
          'data-disabled': item.disabled === true ? 'true' : 'false',
          'data-nav-id': item.id,
          'data-audience': item.audience,
          'aria-expanded': open ? 'true' : 'false',
          'aria-controls': groupId(item),
          disabled: item.disabled === true,
          onClick: () => setOpen(item.id, !open),
        }, [
          h(IconSlot, { item, depth: 0 }),
          h('span', { class: 'lu-cs-item-label' }, item.label),
          audienceChip(item),
          item.dot ? h('span', { class: 'lu-cs-dot', 'aria-hidden': 'true' }) : null,
          h('span', { class: 'lu-cs-item-chevron', 'aria-hidden': 'true' }, [h(ConsoleIcon, { name: 'chevron', size: 14 })]),
        ]),
        h('div', {
          key: `${item.id}:children`,
          id: groupId(item),
          class: 'lu-cs-children',
          role: 'group',
          'aria-label': item.label,
          hidden: !open,
        }, item.children!.map((child) => itemRow(child, 1))),
      ];
    }
    if (hasChildren(item)) return [h(LeafRow, { key: item.id, item: collapsedLink(item), depth: 0, active: inPath(item) })];
    return [itemRow(item, 0)];
  });
GroupRows.props = ['items'];

// The element a nav row renders as: the injected RouterLink, a plain anchor,
// or a non-interactive span for disabled rows.
function rowTag(item: NavItem): Component | string {
  if (isItemDisabled(item)) return 'span';
  // Action rows (no route, side-effect on click) render as buttons.
  if (item.action && !item.to) return 'button';
  if (props.routerLink && !item.external) return props.routerLink;
  return 'a';
}

// Bind the right href/to attr for whichever tag we render.
function rowProps(item: NavItem): Record<string, unknown> {
  if (isItemDisabled(item)) return {};
  if (item.action && !item.to) return { type: 'button' };
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
  // The fold button is the expand control; brand-click-to-expand is opt-in
  // (expandOnBrandClick) to avoid fighting the brand's home-link navigation.
  if (props.expandOnBrandClick && collapsed.value) {
    e.preventDefault();
    setCollapsed(false);
  }
}

// While collapsed with expand-on-brand-click, the brand is a non-navigating
// <button>: clicking it only expands the rail. Rendering it as a router link
// would navigate home before onBrandClick's preventDefault could run — the
// router's click handler and ours sit on the same element and the router's
// fires first — jumping the user off the current page.
const brandAsButton = computed(() => !!props.expandOnBrandClick && collapsed.value);
const brandTag = computed(() => (brandAsButton.value ? 'button' : (props.routerLink ?? 'a')));
const brandProps = computed(() =>
  brandAsButton.value
    ? { type: 'button' as const }
    : (props.routerLink ? { to: props.homeTo } : { href: props.homeTo }),
);

// The compact collapsed head is one button: the logo, which turns into the
// expand glyph on hover or focus.
const compactFold = computed(() => props.compact && collapsed.value && props.collapsible);

// First grapheme of the label, used as a fallback mark in collapsed mode when
// the host supplies no #icon slot.
function letter(label: string): string {
  return (label.trim()[0] ?? '?').toUpperCase();
}
</script>

<template>
  <aside class="lu-cs" :data-collapsed="collapsed ? 'true' : 'false'" :data-compact="compact ? 'true' : undefined">
    <div class="lu-cs-head">
      <slot v-if="!compactFold" name="brand" :collapsed="collapsed">
        <component
          :is="brandTag"
          v-bind="brandProps"
          class="lu-cs-brand"
          :title="collapsed ? expandLabel : undefined"
          @click="onBrandClick"
        >
          <span
            class="lu-cs-brand-mark"
            :class="{ 'lu-cs-brand-mark--colored': brandColor }"
            :style="brandColor ? { background: brandColor } : undefined"
          >
            <slot name="logo">{{ letter(brandName ?? 'L') }}</slot>
          </span>
          <span v-if="!collapsed" class="lu-cs-brand-text">
            <span class="lu-cs-brand-name" :class="brandTheme ? `${brandTheme}-brand` : undefined">{{ brandName }}</span>
            <span v-if="brandSub" class="lu-cs-brand-sub">{{ brandSub }}</span>
          </span>
        </component>
      </slot>

      <slot v-if="!compactFold" name="brand-extra" :collapsed="collapsed" />

      <!-- Cross-console app grid, opt-in via `product`. Hidden while the rail
           is collapsed: the 64px column head stacks vertically and only keeps
           the essentials (brand mark + fold button). -->
      <ProductSwitcher
        v-if="product && !collapsed"
        class="lu-cs-switch"
        :current="product"
        :labels="productLabels"
        size="sm"
      />

      <button
        v-if="collapsible"
        type="button"
        class="lu-cs-fold"
        :title="collapsed ? expandLabel : collapseLabel"
        :aria-label="collapsed ? expandLabel : collapseLabel"
        @click="toggle"
      >
        <span v-if="compactFold" class="lu-cs-fold-mark" aria-hidden="true">
          <slot name="logo">{{ letter(brandName ?? 'L') }}</slot>
        </span>
        <svg class="lu-cs-fold-glyph" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="9" y1="4" x2="9" y2="20" />
          <polyline v-if="!collapsed" points="15.5 9 13 12 15.5 15" />
          <polyline v-else points="13 9 15.5 12 13 15" />
        </svg>
      </button>
    </div>

    <!-- App-specific content above the search bar (e.g. a workspace switcher). -->
    <slot name="top" :collapsed="collapsed" />

    <button
      v-if="search"
      type="button"
      class="lu-cs-search"
      :data-collapsed="collapsed ? 'true' : 'false'"
      :title="`${searchLabel} (${searchHint})`"
      @click="emit('search')"
    >
      <span class="lu-cs-search-ic" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <span v-if="!collapsed" class="lu-cs-search-label">{{ searchLabel }}</span>
      <span v-if="!collapsed && searchHint" class="lu-cs-search-hint">{{ searchHint }}</span>
    </button>

    <nav ref="navEl" class="lu-cs-nav" @keydown="onNavKeydown">
      <div
        v-for="(g, gi) in navGroups"
        :key="`g-${gi}`"
        class="lu-cs-group"
        :class="{ 'lu-cs-group-pinned': g.firstPinned }"
        :data-pin="g.pin === 'bottom' ? 'bottom' : 'top'"
      >
        <div v-if="g.label && !collapsed" class="lu-cs-group-label">{{ g.label }}</div>
        <GroupRows :items="g.items" />
      </div>

      <!-- App-specific contextual content (recent lists, filters, workspace
           switcher) flows below the nav groups, within the scroll area. -->
      <slot name="extra" :collapsed="collapsed" />
    </nav>

    <div class="lu-cs-foot" :class="{ 'lu-cs-foot-has-nav': footGroups.length > 0 }">
      <div v-if="footGroups.length > 0" ref="footNavEl" class="lu-cs-foot-nav" @keydown="onFootNavKeydown">
        <div
          v-for="(g, gi) in footGroups"
          :key="`g-${gi}`"
          class="lu-cs-group"
          data-pin="bottom"
        >
          <div v-if="g.label && !collapsed" class="lu-cs-group-label">{{ g.label }}</div>
          <GroupRows :items="g.items" />
        </div>
        <div v-if="footItems && footItems.length > 0" class="lu-cs-foot-items">
          <LeafRow v-for="item in footItems" :key="item.id" :item="item" :depth="0" :value="item.value" extra-class="lu-cs-foot-item" />
        </div>
      </div>
      <div v-else-if="footItems && footItems.length > 0" class="lu-cs-foot-items">
        <LeafRow v-for="item in footItems" :key="item.id" :item="item" :depth="0" :value="item.value" extra-class="lu-cs-foot-item" />
      </div>
      <slot name="foot" :collapsed="collapsed" />
    </div>
  </aside>
</template>
