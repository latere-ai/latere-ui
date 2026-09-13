<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import * as UI from '../../src';
import { options, selectOptions, nav, paletteNav, principal, locales, tiers, badgeTones, alertTones, menuItems, columns, rows, groups, article, createWorkspaceRows, buttonSizes, buttonVariants, progressValues, brands, workspaceMetrics, effectCaptions } from './parity-data';
const effectText = effectCaptions(!!document.documentElement.dataset.design);
const props = defineProps<{ scenario: string }>();
const accountLinks = new URLSearchParams(location.search).get('accountLinks') === 'true' ? [{ label: 'Account help', href: '#account-help' }] : [];
const currentProduct = new URLSearchParams(location.search).get('currentProduct') ?? '';
const showToc = new URLSearchParams(location.search).get('showToc') !== 'false';
const matchWidth = new URLSearchParams(location.search).get('matchWidth') === 'true';
const placement = (new URLSearchParams(location.search).get('placement') || 'bottom-start') as 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
const text = ref('Studio workspace');
const checked = ref(true);
const selected = ref('daily');
const menuSelection = ref('');
const confirmResult = ref('');
const open = ref(false);
const workspaceCollapsed = ref(matchMedia('(max-width: 720px)').matches);
const workspaceRows = ref(createWorkspaceRows());
function addProject() { workspaceRows.value.unshift({ name: 'Untitled project', status: 'Ready', jobs: 0 }); }
const innerOpen = ref(false);
const theme = ref<'light' | 'dark' | 'auto'>(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
const locale = ref('en');
const selectValue = ref('0');
const organization = ref('studio');
const orgState = UI.createOrgSwitcher({ getOrgs: async () => principal.orgs.slice(0, 3), getCurrentOrgID: () => organization.value, switchOrg: async (id) => { organization.value = id; }, eager: true });
function notify() { UI.message.clear(); if (new URLSearchParams(location.search).get('long') === 'true') { UI.message.error('Workspace_' + 'x'.repeat(180), { duration: 0 }); return; } for (const tone of alertTones) UI.message(tone, tone === 'error' ? 'The workspace could not be saved. Try again.' : `${tone}: Your workspace is ready.`, { duration: 0 }); }
function ask() { confirmResult.value = 'pending'; void UI.confirm({ title: 'Delete workspace?', message: 'This removes the workspace and its saved settings.', danger: true, confirmText: 'Delete workspace' }).then(accepted => { confirmResult.value = accepted ? 'accepted' : 'cancelled'; }); }
onMounted(async () => { await nextTick(); if (props.scenario === 'effects') UI.initLiquidGlass(document.getElementById('stage')!); });
</script>

<template>
  <div v-if="scenario === 'buttons'" class="stack">
    <section v-for="size in buttonSizes" :key="size" class="sample" data-component="GlassButton">
      <p class="sample-label">Buttons / {{ size }}</p>
      <div class="button-variants"><div v-for="variant in buttonVariants" :key="variant" class="button-state-group" role="group" :aria-label="`${variant} ${size} states`"><UI.GlassButton :variant="variant" :size="size">{{ variant }}</UI.GlassButton><UI.GlassButton :variant="variant" :size="size" disabled>Disabled</UI.GlassButton><UI.GlassButton :variant="variant" :size="size" loading>Saving</UI.GlassButton></div></div>
    </section>
    <section class="sample" data-component="GlassIconButton"><p class="sample-label">Icon buttons</p><div class="row"><UI.GlassIconButton label="Add">+</UI.GlassIconButton><UI.GlassIconButton label="Small add" size="sm">+</UI.GlassIconButton><UI.GlassIconButton label="Pinned" pressed>★</UI.GlassIconButton><UI.GlassIconButton label="Unavailable" disabled>+</UI.GlassIconButton></div></section>
  </div>
  <div v-else-if="scenario === 'forms'" class="stack">
    <div class="grid" data-component="GlassField"><UI.GlassField v-model="text" label="Workspace name" /><UI.GlassField label="Email" placeholder="you@example.test" error="Enter an email address." /><UI.GlassField label="Notes" multiline model-value="A shared space for the team." /><UI.GlassField label="Disabled field" disabled model-value="Read only" /></div>
    <section class="sample row" data-component="GlassCheckbox"><UI.GlassCheckbox v-model="checked" label="Selected"/><UI.GlassCheckbox :model-value="false" label="Unselected"/><UI.GlassCheckbox :model-value="true" disabled label="Disabled selected"/><UI.GlassCheckbox :model-value="false" disabled label="Disabled"/></section>
    <section class="sample row" data-component="GlassSwitch"><UI.GlassSwitch v-model="checked" label="Notifications"/><UI.GlassSwitch :model-value="false" label="Off"/><UI.GlassSwitch :model-value="true" disabled label="Disabled"/></section>
    <section class="sample row" data-component="GlassRadio"><UI.GlassRadio v-for="option in options" :key="option.value" v-model="selected" name="frequency" :value="option.value" :label="option.label" :disabled="option.value === 'monthly'"/></section>
    <section class="sample" data-component="GlassSegmented"><UI.GlassSegmented v-model="selected" :options="options" aria-label="Frequency"/></section>
    <section class="sample" data-component="GlassTabs"><UI.GlassTabs v-model="selected" :tabs="options" aria-label="Report period"/></section>
  </div>
  <div v-else-if="scenario === 'select'" class="stack" style="min-height: 480px" data-component="GlassSelect">
    <UI.GlassSelect v-model="selectValue" :options="selectOptions" aria-label="Workspace"/>
    <UI.GlassSelect model-value="" :options="[]" aria-label="Empty choices"/>
    <UI.GlassSelect model-value="" :options="selectOptions" disabled aria-label="Disabled choices"/>
  </div>
  <div v-else-if="scenario === 'feedback'" class="stack">
    <section class="sample stack" data-component="GlassBadge"><div v-for="solid in [false, true]" :key="String(solid)" class="row"><UI.GlassBadge v-for="tone in badgeTones" :key="tone" :tone="tone" :solid="solid" dot>{{ tone }}</UI.GlassBadge></div></section>
    <div class="grid" data-component="GlassAlert"><UI.GlassAlert v-for="tone in alertTones" :key="tone" :tone="tone" :title="tone" dismissible>Workspace activity is available here.</UI.GlassAlert></div>
    <section class="sample row" data-component="GlassSpinner"><UI.GlassSpinner :size="16"/><UI.GlassSpinner :size="24"/><UI.GlassSpinner :size="40"/></section>
    <section class="sample stack" data-component="GlassProgress"><UI.GlassProgress v-for="value in progressValues" :key="value" :value="value" :label="`Progress ${value}`"/></section>
    <section class="sample row" data-component="GlassSkeleton"><UI.GlassSkeleton width="48px" height="48px" circle/><div class="stack" style="flex:1"><UI.GlassSkeleton/><UI.GlassSkeleton width="65%"/></div></section>
  </div>
  <div v-else-if="scenario === 'workspace'" class="workspace-demo">
    <div class="workspace-rail" data-component="ConsoleSidebar"><UI.ConsoleSidebar :model="nav" active-key="overview" brand-name="Workspace" brand-sub="Console" search expand-on-brand-click v-model:collapsed="workspaceCollapsed"><template #logo><UI.LatereLogoMark/></template></UI.ConsoleSidebar></div>
    <main class="workspace-main">
      <div class="workspace-heading"><div><p class="sample-label">Design studio</p><h2>Workspace overview</h2></div><span class="workspace-status">All changes saved</span></div>
      <div data-component="GlassBar"><UI.GlassBar><UI.GlassButton size="sm">All projects</UI.GlassButton><UI.GlassButton variant="ghost" size="sm">Recent</UI.GlassButton><span class="workspace-spacer"/><UI.GlassButton variant="primary" size="sm" @click="addProject">New project</UI.GlassButton></UI.GlassBar></div>
      <div class="workspace-metrics" data-component="GlassPanel"><UI.GlassPanel v-for="metric in workspaceMetrics(workspaceRows.length)" :key="metric.label"><p>{{ metric.label }}</p><strong>{{ metric.value }}</strong><small>{{ metric.detail }}</small></UI.GlassPanel></div>
      <section class="workspace-projects" data-component="GlassTable"><div class="workspace-section-heading"><h3>Projects</h3><span>{{ workspaceRows.length }} projects</span></div><UI.GlassTable :columns="columns" :rows="workspaceRows"/></section>
      <div class="workspace-note"><span>Activity</span><p>Alex updated the component library <span>· 12 minutes ago</span></p></div>
    </main>
  </div>
  <div v-else-if="scenario === 'containers'" class="stack">
    <div class="material-stage material-grid" data-component="GlassSurface"><UI.GlassSurface v-for="tier in tiers" :key="tier" :tier="tier" interactive class="material">{{ tier }} surface · The quick brown fox</UI.GlassSurface></div>
    <div class="grid" data-component="GlassPanel"><UI.GlassPanel>Regular panel</UI.GlassPanel><UI.GlassPanel tier="smoke">Smoke panel</UI.GlassPanel><UI.GlassPanel flush><div style="padding:20px">Flush panel with host padding</div></UI.GlassPanel></div>
    <div data-component="GlassBar"><UI.GlassBar header>Workspace toolbar <UI.GlassButton size="sm">New project</UI.GlassButton></UI.GlassBar></div>
    <div data-component="GlassTable"><UI.GlassTable :columns="columns" :rows="rows"/></div>
  </div>
  <div v-else-if="scenario === 'popover'" class="popover-stage" data-component="GlassPopover" :data-selection="menuSelection"><UI.GlassPopover :placement="placement" :match-width="matchWidth"><template #trigger><UI.GlassButton>Open menu</UI.GlassButton></template><template #default="{ close }"><div data-component="GlassMenu"><UI.GlassMenu :items="menuItems" @select="menuSelection = $event; close()"/></div></template></UI.GlassPopover></div>
  <div v-else-if="scenario === 'tooltip'" class="popover-stage row" data-component="GlassTooltip"><UI.GlassTooltip text="Copy workspace link"><UI.GlassButton>Top tooltip</UI.GlassButton></UI.GlassTooltip><UI.GlassTooltip text="More information" placement="bottom"><UI.GlassButton>Bottom tooltip</UI.GlassButton></UI.GlassTooltip></div>
  <div v-else-if="scenario === 'modal'" data-component="GlassModal"><UI.GlassButton @click="open = true">Open modal</UI.GlassButton><UI.GlassModal v-model:open="open" title="Workspace settings"><UI.GlassField v-model="text" label="Workspace name"/><p>Update the details your team sees.</p><UI.GlassButton @click="innerOpen = true">Open nested modal</UI.GlassButton><template #footer><UI.GlassButton @click="open = false">Cancel</UI.GlassButton><UI.GlassButton variant="primary" @click="open = false">Save changes</UI.GlassButton></template></UI.GlassModal><UI.GlassModal v-model:open="innerOpen" title="Nested settings"><UI.GlassButton @click="innerOpen = false">Close nested</UI.GlassButton></UI.GlassModal></div>
  <div v-else-if="scenario.startsWith('drawer-')" data-component="GlassDrawer"><UI.GlassButton @click="open = true">Open drawer</UI.GlassButton><UI.GlassDrawer v-model:open="open" title="Workspace details" :side="scenario === 'drawer-left' ? 'left' : 'right'"><UI.GlassField v-model="text" label="Name"/><p v-for="n in 16" :key="n">Detail {{ n }}: Workspace activity and settings.</p><UI.GlassButton @click="open = false">Done</UI.GlassButton></UI.GlassDrawer></div>
  <div v-else-if="scenario === 'toast'" data-component="GlassToaster"><UI.GlassButton @click="notify">Show notifications</UI.GlassButton><UI.GlassToaster/></div>
  <div v-else-if="scenario === 'confirm'" data-component="GlassConfirmHost" :data-result="confirmResult"><UI.GlassButton @click="ask">Delete workspace</UI.GlassButton><UI.GlassConfirmHost/></div>
  <div v-else-if="scenario.startsWith('sidebar')" class="shell-stage" data-component="ConsoleSidebar"><UI.ConsoleSidebar :model="nav" active-key="jobs" brand-name="Workspace" brand-sub="Console" search :collapsed="scenario === 'sidebar-collapsed'"><template #logo><UI.LatereLogoMark/></template></UI.ConsoleSidebar><div class="shell-content"><h2>Workspace overview</h2><p>Projects and activity appear beside the navigation.</p></div></div>
  <div v-else-if="scenario === 'palette'" data-component="ConsolePalette"><UI.GlassButton @click="open = true">Open palette</UI.GlassButton><UI.ConsolePalette :open="open" :model="paletteNav" @close="open = false"/></div>
  <div v-else-if="scenario === 'docs'" data-component="DocsLayout"><UI.DocsLayout :show-toc="showToc" :groups="groups" active-slug="intro" :article-html="article"/></div>
  <form v-else-if="scenario === 'account'" data-component="AccountMenu" style="display:flex;justify-content:flex-end" @submit.prevent="text = 'Unexpected submit'"><UI.AccountMenu :principal="principal" :extra-items="accountLinks" dashboard-path="#dashboard"><template #prefs><div data-component="AccountPrefs"><UI.AccountPrefs :theme="theme" :locale="locale" :locale-options="locales" @set-theme="theme = $event" @set-locale="locale = $event"/></div></template></UI.AccountMenu></form>
  <div v-else-if="scenario === 'preferences'" class="sample" data-component="AccountPrefs"><UI.AccountPrefs :theme="theme" :locale="locale" :locale-options="locales" @set-theme="theme = $event" @set-locale="locale = $event"/></div>
  <div v-else-if="scenario === 'products'" data-component="ProductSwitcher"><UI.ProductSwitcher :current="currentProduct"/></div>
  <div v-else-if="scenario === 'organizations'" class="sample organization-demo" data-component="OrgSwitcher"><UI.OrgSwitcher :state="orgState"><template #header><p class="sample-label">Switch workspace</p></template></UI.OrgSwitcher></div>
  <div v-else-if="scenario.startsWith('footer')" data-component="SiteFooter"><UI.SiteFooter :theme="theme" v-model:locale="locale" :locales="locales" :compact="scenario === 'footer-compact'" @update:theme="theme = $event"/></div>
  <div v-else-if="scenario === 'logo'" class="logo-stage row" data-component="LatereLogoMark"><UI.LatereLogoMark/><span v-for="brand in brands" :key="brand" :class="`${brand}-brand`" style="font-size:28px">{{ brand }}</span></div>
  <div v-else-if="scenario === 'effects'" class="material-stage" data-component="GlassSurface"><UI.GlassButton @click="UI.initLiquidGlass()">Refresh effects</UI.GlassButton><UI.GlassSurface class="effect-surface" data-lg-refract="off">{{ effectText[0] }}</UI.GlassSurface><UI.GlassSurface class="effect-surface" data-lg-refract>{{ effectText[1] }}</UI.GlassSurface><UI.GlassSurface class="effect-surface" data-lg-sheen data-lg-refract="off">{{ effectText[2] }}</UI.GlassSurface></div>
  <div v-else>Unknown scenario: {{ scenario }}</div>
</template>
