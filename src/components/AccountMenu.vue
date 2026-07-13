<script setup lang="ts">
// Shared account menu for every Latere SPA. Modeled on lux's UserOrgMenu (the
// most comprehensive): identity header → optional "Open dashboard" → an org
// list with an explicit Personal (no-org) row and each membership (owner
// badge, slug, active check, per-row switch spinner that dims the others) →
// an optional prefs slot (theme/locale) → Sign out / Sign in.
//
// Decoupled: it imports neither the session store nor vue-router. Org rows
// emit `switch-org`, the dashboard row emits `navigate`, and auth actions emit
// `login`/`logout`; the host wires those to its store + router. Self-contained
// trigger + dropdown with scoped styles, so consumers get consistent layout
// with no CSS import. Relies on the platform CSS tokens (--text, --bg-raised,
// --accent, …) that every app already defines.
import { computed, ref, useSlots } from 'vue';

import '../styles/components/account-menu.css';
import type { Principal } from '../session/types';
import { useClickOutside } from '../composables/useClickOutside';
import {
  type AccountMenuLabels,
  type AccountMenuLabelOverrides,
  type AccountMenuItem,
  DEFAULT_ACCOUNT_MENU_LABELS,
} from './accountMenu';

export type { AccountMenuLabels, AccountMenuItem };

type Placement = 'top-end' | 'bottom-start';

const DEFAULT_LABELS = DEFAULT_ACCOUNT_MENU_LABELS;

const props = withDefaults(
  defineProps<{
    /** The signed-in principal, or null when logged out. */
    principal: Principal | null;
    /** `top-end`: top-nav dropdown opening down-right. `bottom-start`: left-rail pill opening up. */
    placement?: Placement;
    /** When set, shows an "Open dashboard" row that emits `navigate`. */
    dashboardPath?: string | null;
    /** Org id currently being switched to ('' = Personal); drives the spinner + dims others. */
    switchingOrgId?: string | null;
    /** When true, render nothing while logged out (instead of a Sign-in CTA). */
    signedInOnly?: boolean;
    /** Per-locale label overrides (deep-partial; roles merge over defaults). */
    labels?: AccountMenuLabelOverrides;
    /**
     * Per-app custom rows (e.g. Admin Panel) rendered in the menu's own style,
     * between the prefs and Sign out. Prefer this over the #extra slot, whose
     * slotted markup can't pick up the scoped item styles.
     */
    extraItems?: AccountMenuItem[];
  }>(),
  {
    placement: 'top-end',
    dashboardPath: null,
    switchingOrgId: null,
    signedInOnly: false,
    labels: undefined,
    extraItems: () => [],
  },
);

const emit = defineEmits<{
  (e: 'switch-org', orgId: string): void;
  (e: 'navigate', path: string): void;
  (e: 'login'): void;
  (e: 'logout'): void;
  (e: 'item-select', id: string): void;
}>();

const t = computed<AccountMenuLabels>(() => ({
  ...DEFAULT_LABELS,
  ...props.labels,
  // Deep-merge the roles sub-object so a consumer passing partial role
  // labels doesn't wipe the defaults for the rest.
  roles: { ...DEFAULT_LABELS.roles, ...props.labels?.roles },
}));

const slots = useSlots();
// A dropdown is only worth opening when it has content: the signed-in
// surface (identity + orgs + sign out), or app-provided prefs/extra/items.
// When logged out with none of those, the trigger is a plain "Log in" button
// (no dropdown, no chevron) — avoids the empty "Not signed in" panel.
const hasDropdown = computed(
  () => !!props.principal || !!slots.prefs || !!slots.extra || props.extraItems.length > 0,
);

const open = ref(false);
const root = ref<HTMLElement | null>(null);
useClickOutside(
  root,
  () => open.value,
  () => (open.value = false),
);

function onTrigger() {
  if (hasDropdown.value) open.value = !open.value;
  else emit('login'); // logged out + nothing to show → straight to login
}

const me = computed(() => props.principal);
const initials = computed(() => me.value?.initials || '?');
const avatarUrl = computed(() => me.value?.avatar_url || '');
const name = computed(
  () => me.value?.display_name || me.value?.name || me.value?.email || t.value.account,
);
const email = computed(() => me.value?.email || '');
const orgName = computed(() => me.value?.org_name || '');

// Canonical role badge (shared four-role account model). The subline text
// carries the org context ("Individual" for a no-org principal); the badge
// names the role. `individual` needs no badge — the subline already says it.
const role = computed(() => me.value?.role);
const roleBadge = computed(() =>
  role.value && role.value !== 'individual' ? t.value.roles[role.value] : '',
);
// Subline: the org name when in an org, otherwise the role-aware personal
// label ("Individual") when a role is set, falling back to the legacy
// "Personal" string for consumers that don't pass a role.
const identitySub = computed(() => {
  if (orgName.value) return orgName.value;
  if (role.value) return t.value.roles.individual;
  return t.value.personal;
});
const orgs = computed(() => me.value?.orgs ?? []);
const activeOrgId = computed(() => me.value?.org_id || '');
const isPersonal = computed(() => !activeOrgId.value);

const opensUp = computed(() => props.placement === 'bottom-start');

function rowOpacity(id: string): number {
  const s = props.switchingOrgId;
  return s !== null && s !== id ? 0.5 : 1;
}

function pickOrg(id: string) {
  if (id === activeOrgId.value || props.switchingOrgId !== null) return;
  emit('switch-org', id);
}
function goto(path: string) {
  open.value = false;
  emit('navigate', path);
}
function onSignOut() {
  open.value = false;
  emit('logout');
}
function onSignIn() {
  open.value = false;
  emit('login');
}
function onExtraItem(item: AccountMenuItem) {
  // Only reached from the `<button v-else>` branch (rendered when !item.href);
  // href rows go through the native `<a>` branch, which never calls this.
  open.value = false;
  if (item.to) emit('navigate', item.to);
  else if (item.id) emit('item-select', item.id);
}
</script>

<template>
  <div
    v-if="principal || !signedInOnly"
    class="lu-am"
    :class="{ 'lu-am-up': opensUp }"
    ref="root"
  >
    <button
      class="lu-am-trigger"
      @click="onTrigger"
      :aria-expanded="hasDropdown ? open : undefined"
      :title="principal ? t.account : t.signIn"
    >
      <!-- Avatar always present so the pill keeps its shape; logged out shows
           the "?" initials fallback. -->
      <span class="lu-am-avatar">
        <img v-if="avatarUrl" :src="avatarUrl" alt="" referrerpolicy="no-referrer" />
        <span v-else>{{ initials }}</span>
      </span>
      <span class="lu-am-id">
        <span class="lu-am-id-name">{{ principal ? name : t.signIn }}</span>
        <!-- Sub-label (role badge + org / Individual) only when signed in —
             the logged-out "Sign in" trigger stays a single line. -->
        <span class="lu-am-id-sub" v-if="principal">
          <span
            v-if="roleBadge"
            class="lu-am-role"
            :class="`lu-am-role-${role}`"
          >{{ roleBadge }}</span>
          <span class="lu-am-id-sub-text">{{ identitySub }}</span>
        </span>
      </span>
      <svg
        v-if="hasDropdown"
        class="lu-am-chev"
        width="11"
        height="11"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path v-if="opensUp" d="M3 7.5l3-3 3 3" />
        <path v-else d="M3 4.5l3 3 3-3" />
      </svg>
    </button>

    <div v-if="open && hasDropdown" class="lu-am-dd" :class="placement === 'top-end' ? 'lu-am-dd-right' : 'lu-am-dd-left'">
      <!-- Identity header -->
      <div class="lu-am-head" v-if="principal">
        <span class="lu-am-head-avatar">
          <img v-if="avatarUrl" :src="avatarUrl" alt="" referrerpolicy="no-referrer" />
          <span v-else>{{ initials }}</span>
        </span>
        <div class="lu-am-head-text">
          <div class="lu-am-head-name">{{ name }}</div>
          <div class="lu-am-head-email">{{ email }}</div>
          <!-- Identity descriptor: the role badge + org/individual context.
               Triggers may hide these to stay compact, so the dropdown is the
               canonical place they always resolve. -->
          <div v-if="roleBadge || identitySub" class="lu-am-head-meta">
            <span
              v-if="roleBadge"
              class="lu-am-role"
              :class="`lu-am-role-${role}`"
            >{{ roleBadge }}</span>
            <span class="lu-am-head-context">{{ identitySub }}</span>
          </div>
        </div>
      </div>
      <div class="lu-am-head lu-am-head-muted" v-else>{{ t.notSignedIn }}</div>

      <template v-if="principal">
        <!-- Dashboard link -->
        <div v-if="dashboardPath" class="lu-am-section">
          <button class="lu-am-item" @click="goto(dashboardPath)">
            <span>{{ t.openDashboard }}</span>
          </button>
        </div>

        <!-- Organizations — only when the principal actually has memberships, so
             a degraded /api/me (orgs fetch failed) doesn't show a lonely Personal. -->
        <div v-if="orgs.length" class="lu-am-section">
          <div class="lu-am-section-label">{{ t.organizations }}</div>

          <!-- Personal (no-org): present so the user can switch back. -->
          <button
            class="lu-am-item lu-am-org"
            :class="{ 'is-active': isPersonal }"
            :style="{ opacity: rowOpacity('') }"
            @click="pickOrg('')"
          >
            <span class="lu-am-org-mark">{{ initials }}</span>
            <span class="lu-am-org-text">
              <span class="lu-am-org-name">{{ t.personal }}</span>
              <span class="lu-am-org-meta">{{ t.noOrganization }}</span>
            </span>
            <svg
              v-if="isPersonal"
              class="lu-am-check"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12l5 5L20 6" />
            </svg>
            <span v-else-if="switchingOrgId === ''" class="lu-am-spin">…</span>
          </button>

          <button
            v-for="o in orgs"
            :key="o.id"
            class="lu-am-item lu-am-org"
            :class="{ 'is-active': o.id === activeOrgId }"
            :style="{ opacity: rowOpacity(o.id) }"
            @click="pickOrg(o.id)"
          >
            <span class="lu-am-org-mark lu-am-org-team">{{ (o.name || o.id).slice(0, 2).toUpperCase() }}</span>
            <span class="lu-am-org-text">
              <span class="lu-am-org-name">
                {{ o.name || o.id }}
                <span v-if="o.owner" class="lu-am-owner">{{ t.owner }}</span>
              </span>
              <span v-if="o.slug" class="lu-am-org-meta">@{{ o.slug }}</span>
            </span>
            <svg
              v-if="o.id === activeOrgId"
              class="lu-am-check"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12l5 5L20 6" />
            </svg>
            <span v-else-if="switchingOrgId === o.id" class="lu-am-spin">…</span>
          </button>
        </div>
      </template>

      <!-- App-provided preferences (theme / locale pills). -->
      <div v-if="$slots.prefs" class="lu-am-section">
        <slot name="prefs" />
      </div>

      <!-- Per-app custom rows (data-driven; styled in this component's scope so
           they always match). Links render as <a>, router paths emit navigate,
           pure actions emit item-select. -->
      <div v-if="extraItems.length" class="lu-am-section">
        <template v-for="(item, i) in extraItems" :key="item.id || item.href || item.to || i">
          <a
            v-if="item.href"
            class="lu-am-item"
            :class="{ 'lu-am-danger': item.danger }"
            :href="item.href"
            :target="item.target"
            :rel="item.target === '_blank' ? 'noopener' : undefined"
            @click="open = false"
          >
            <span>{{ item.label }}</span>
          </a>
          <button
            v-else
            class="lu-am-item"
            :class="{ 'lu-am-danger': item.danger }"
            @click="onExtraItem(item)"
          >
            <span>{{ item.label }}</span>
          </button>
        </template>
      </div>

      <!-- Escape hatch for fully-custom markup. Slotted content is styled via
           :slotted(.lu-am-item) below so it still matches the menu. -->
      <div v-if="$slots.extra" class="lu-am-section">
        <slot name="extra" />
      </div>

      <div class="lu-am-section">
        <button v-if="principal" class="lu-am-item lu-am-danger" @click="onSignOut">
          <span>{{ t.signOut }}</span>
        </button>
        <button v-else class="lu-am-item" @click="onSignIn">
          <span>{{ t.signIn }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
