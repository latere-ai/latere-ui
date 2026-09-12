<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import * as UI from '../../src';
const props = defineProps<{ scenario: string }>();
const matchWidth = new URLSearchParams(location.search).get('matchWidth') === 'true';
const placement = (new URLSearchParams(location.search).get('placement') || 'bottom-start') as 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
const text = ref('Studio workspace');
const checked = ref(true);
const selected = ref('daily');
const open = ref(false);
const innerOpen = ref(false);
const theme = ref<'light' | 'dark' | 'auto'>(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
const locale = ref('en');
const options = [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }];
const selectOptions = Array.from({ length: 20 }, (_, i) => ({ value: String(i), label: `Workspace ${String(i + 1).padStart(2, '0')}`, disabled: i === 1 }));
const selectValue = ref('0');
const nav = { groups: [{ label: 'Workspace', items: [{ id: 'overview', label: 'Overview', to: '#overview', icon: 'home' }, { id: 'jobs', label: 'Jobs', to: '#jobs', badge: 12 }, { id: 'live', label: 'Activity', to: '#activity', badge: 'live' as const }, { id: 'future', label: 'Coming soon', disabled: true }] }, { pin: 'bottom' as const, items: [{ id: 'settings', label: 'Settings', to: '#settings' }] }] };
const paletteNav = { groups: [{ label: 'Workspace', items: Array.from({ length: 30 }, (_, i) => ({ id: String(i), label: `Page ${String(i + 1).padStart(2, '0')}`, to: `#page-${i}` })) }] };
const principal = { principal_id: 'user-1', email: 'alex@example.test', display_name: 'Alex Morgan', initials: 'AM', org_id: 'studio', org_name: 'Design studio', role: 'org_admin' as const, orgs: Array.from({ length: 16 }, (_, i) => ({ id: i ? `org-${i}` : 'studio', name: i ? `Workspace ${i}` : 'Design studio', slug: `workspace-${i}`, owner: i === 0 })) };
const locales = [{ code: 'en', label: 'EN', name: 'English' }, { code: 'zh', label: '中', name: '中文' }, { code: 'de', label: 'DE', name: 'Deutsch' }];
const organization = ref('studio');
const orgState = UI.createOrgSwitcher({ getOrgs: async () => principal.orgs.slice(0, 3), getCurrentOrgID: () => organization.value, switchOrg: async (id) => { organization.value = id; }, eager: true });
const tiers = ['ultrathin', 'thin', 'regular', 'thick', 'smoke'] as const;
const badgeTones = ['neutral', 'running', 'idle', 'stopped', 'error', 'creating'] as const;
const alertTones = ['info', 'success', 'warning', 'error'] as const;
const menuItems = [{ value: 'copy', label: 'Copy link' }, { value: 'move', label: 'Move to folder' }, { value: 'disabled', label: 'Unavailable', disabled: true }, { value: 'delete', label: 'Delete', danger: true }];
const columns = [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }, { key: 'jobs', label: 'Jobs' }];
const rows = [{ name: 'Design studio', status: 'Running', jobs: 12 }, { name: 'Research lab', status: 'Idle', jobs: 4 }, { name: 'Archive', status: 'Stopped', jobs: 0 }];
const groups = [{ id: 'start', label: 'Getting started', pages: [{ slug: 'intro', title: 'Introduction' }, { slug: 'setup', title: 'Setup' }] }, { id: 'guides', label: 'Guides', pages: [{ slug: 'sharing', title: 'Sharing' }] }];
const article = '<p>Build a shared workspace for your team.</p><h2>Start a workspace</h2><p>Choose a name, invite your team, and begin a project.</p><blockquote>Your work stays together.</blockquote><h3>Invite teammates</h3><p>Share access with the people who need it.</p><pre><code>workspace.create({ name: "Studio" })</code></pre><h2>Review activity</h2><table><thead><tr><th>Role</th><th>Access</th></tr></thead><tbody><tr><td>Owner</td><td>Manage workspace</td></tr><tr><td>Member</td><td>Create projects</td></tr></tbody></table>';
function notify() { UI.message.clear(); if (new URLSearchParams(location.search).get('long') === 'true') { UI.message.error('Workspace_' + 'x'.repeat(180), { duration: 0 }); return; } for (const tone of alertTones) UI.message(tone, tone === 'error' ? 'The workspace could not be saved. Try again.' : `${tone}: Your workspace is ready.`, { duration: 0 }); }
function ask() { void UI.confirm({ title: 'Delete workspace?', message: 'This removes the workspace and its saved settings.', danger: true, confirmText: 'Delete workspace' }); }
onMounted(async () => { await nextTick(); if (props.scenario === 'effects') UI.initLiquidGlass(document.getElementById('stage')!); });
</script>

<template>
  <div v-if="scenario === 'buttons'" class="stack">
    <section v-for="size in (['md', 'sm'] as const)" :key="size" class="sample" data-component="GlassButton">
      <p class="sample-label">Buttons / {{ size }}</p>
      <div class="row"><template v-for="variant in (['glass', 'primary', 'ghost', 'danger'] as const)" :key="variant"><UI.GlassButton :variant="variant" :size="size">{{ variant }}</UI.GlassButton><UI.GlassButton :variant="variant" :size="size" disabled>Disabled</UI.GlassButton><UI.GlassButton :variant="variant" :size="size" loading>Saving</UI.GlassButton></template></div>
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
    <section class="sample stack" data-component="GlassProgress"><UI.GlassProgress v-for="value in [0, 50, 100, 150, -10]" :key="value" :value="value" :label="`Progress ${value}`"/></section>
    <section class="sample row" data-component="GlassSkeleton"><UI.GlassSkeleton width="48px" height="48px" circle/><div class="stack" style="flex:1"><UI.GlassSkeleton/><UI.GlassSkeleton width="65%"/></div></section>
  </div>
  <div v-else-if="scenario === 'containers'" class="stack">
    <div class="material-stage stack" data-component="GlassSurface"><UI.GlassSurface v-for="tier in tiers" :key="tier" :tier="tier" interactive class="material">{{ tier }} surface · The quick brown fox</UI.GlassSurface></div>
    <div class="grid" data-component="GlassPanel"><UI.GlassPanel>Regular panel</UI.GlassPanel><UI.GlassPanel tier="smoke">Smoke panel</UI.GlassPanel><UI.GlassPanel flush><div style="padding:20px">Flush panel with host padding</div></UI.GlassPanel></div>
    <div data-component="GlassBar"><UI.GlassBar header>Workspace toolbar <UI.GlassButton size="sm">New project</UI.GlassButton></UI.GlassBar></div>
    <div data-component="GlassTable"><UI.GlassTable :columns="columns" :rows="rows"/></div>
  </div>
  <div v-else-if="scenario === 'popover'" class="popover-stage" data-component="GlassPopover"><UI.GlassPopover :placement="placement" :match-width="matchWidth"><template #trigger><UI.GlassButton>Open menu</UI.GlassButton></template><template #default><div data-component="GlassMenu"><UI.GlassMenu :items="menuItems"/></div></template></UI.GlassPopover></div>
  <div v-else-if="scenario === 'tooltip'" class="popover-stage row" data-component="GlassTooltip"><UI.GlassTooltip text="Copy workspace link"><UI.GlassButton>Top tooltip</UI.GlassButton></UI.GlassTooltip><UI.GlassTooltip text="More information" placement="bottom"><UI.GlassButton>Bottom tooltip</UI.GlassButton></UI.GlassTooltip></div>
  <div v-else-if="scenario === 'modal'" data-component="GlassModal"><UI.GlassButton @click="open = true">Open modal</UI.GlassButton><UI.GlassModal v-model:open="open" title="Workspace settings"><UI.GlassField v-model="text" label="Workspace name"/><p>Update the details your team sees.</p><UI.GlassButton @click="innerOpen = true">Open nested modal</UI.GlassButton><template #footer><UI.GlassButton @click="open = false">Cancel</UI.GlassButton><UI.GlassButton variant="primary" @click="open = false">Save changes</UI.GlassButton></template></UI.GlassModal><UI.GlassModal v-model:open="innerOpen" title="Nested settings"><UI.GlassButton @click="innerOpen = false">Close nested</UI.GlassButton></UI.GlassModal></div>
  <div v-else-if="scenario.startsWith('drawer-')" data-component="GlassDrawer"><UI.GlassButton @click="open = true">Open drawer</UI.GlassButton><UI.GlassDrawer v-model:open="open" title="Workspace details" :side="scenario === 'drawer-left' ? 'left' : 'right'"><UI.GlassField v-model="text" label="Name"/><p v-for="n in 16" :key="n">Detail {{ n }}: Workspace activity and settings.</p><UI.GlassButton @click="open = false">Done</UI.GlassButton></UI.GlassDrawer></div>
  <div v-else-if="scenario === 'toast'" data-component="GlassToaster"><UI.GlassButton @click="notify">Show notifications</UI.GlassButton><UI.GlassToaster/></div>
  <div v-else-if="scenario === 'confirm'" data-component="GlassConfirmHost"><UI.GlassButton @click="ask">Delete workspace</UI.GlassButton><UI.GlassConfirmHost/></div>
  <div v-else-if="scenario.startsWith('sidebar')" class="shell-stage" data-component="ConsoleSidebar"><UI.ConsoleSidebar :model="nav" active-key="jobs" brand-name="Lux" brand-theme="lux" brand-sub="Console" search :collapsed="scenario === 'sidebar-collapsed'"><template #logo><UI.LatereLogoMark/></template></UI.ConsoleSidebar><div class="shell-content"><h2>Workspace overview</h2><p>Projects and activity appear beside the navigation.</p></div></div>
  <div v-else-if="scenario === 'palette'" data-component="ConsolePalette"><UI.GlassButton @click="open = true">Open palette</UI.GlassButton><UI.ConsolePalette :open="open" :model="paletteNav" @close="open = false"/></div>
  <div v-else-if="scenario === 'docs'" data-component="DocsLayout"><UI.DocsLayout :groups="groups" active-slug="intro" :article-html="article"/></div>
  <form v-else-if="scenario === 'account'" data-component="AccountMenu" style="display:flex;justify-content:flex-end" @submit.prevent="text = 'Unexpected submit'"><UI.AccountMenu :principal="principal" dashboard-path="#dashboard"><template #prefs><div data-component="AccountPrefs"><UI.AccountPrefs :theme="theme" :locale="locale" :locale-options="locales" @set-theme="theme = $event" @set-locale="locale = $event"/></div></template></UI.AccountMenu></form>
  <div v-else-if="scenario === 'preferences'" class="sample" data-component="AccountPrefs"><UI.AccountPrefs :theme="theme" :locale="locale" :locale-options="locales" @set-theme="theme = $event" @set-locale="locale = $event"/></div>
  <div v-else-if="scenario === 'products'" data-component="ProductSwitcher"><UI.ProductSwitcher current="lux"/></div>
  <div v-else-if="scenario === 'organizations'" class="sample" data-component="OrgSwitcher"><UI.OrgSwitcher :state="orgState"/></div>
  <div v-else-if="scenario.startsWith('footer')" data-component="SiteFooter"><UI.SiteFooter :theme="theme" v-model:locale="locale" :locales="locales" :compact="scenario === 'footer-compact'" @update:theme="theme = $event"/></div>
  <div v-else-if="scenario === 'logo'" class="logo-stage row" data-component="LatereLogoMark"><UI.LatereLogoMark/><span v-for="brand in ['lux','cella','topos','wallfacer','lectio']" :key="brand" :class="`${brand}-brand`" style="font-size:28px">{{ brand }}</span></div>
  <div v-else-if="scenario === 'effects'" class="material-stage" data-component="GlassSurface"><UI.GlassButton @click="UI.initLiquidGlass()">Refresh effects</UI.GlassButton><UI.GlassSurface class="effect-surface" data-lg-refract="off">Frosted glass · refraction off</UI.GlassSurface><UI.GlassSurface class="effect-surface" data-lg-refract>Edge refraction · patterned backdrop</UI.GlassSurface><UI.GlassSurface class="effect-surface" data-lg-sheen data-lg-refract="off">Pointer sheen · move across this surface</UI.GlassSurface></div>
  <div v-else>Unknown scenario: {{ scenario }}</div>
</template>
