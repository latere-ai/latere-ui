import { Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as Base from '../../src/react';
import * as Basic from '../../src/react/basic';
import * as Shell from '../../src/react/shell';
import * as Overlays from '../../src/react/overlays';
import { initLiquidGlass } from '../../src/glass/liquidGlass';
import {
  options, selectOptions, nav, paletteNav, principal, locales, tiers, badgeTones,
  alertTones, menuItems, columns, rows, groups, article, createWorkspaceRows,
  buttonSizes, buttonVariants, progressValues, brands, workspaceMetrics,
} from './parity-data';

const UI = { ...Base, ...Basic, ...Shell, ...Overlays };

/** The same examples as VueGallery, rendered through actual React adapters. */
function ReactParityGallery({ scenario }: { scenario: string }) {
  const params = new URLSearchParams(location.search);
  const showToc = params.get('showToc') !== 'false';
  const matchWidth = params.get('matchWidth') === 'true';
  const placement = (params.get('placement') || 'bottom-start') as 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  const [text, setText] = useState('Studio workspace');
  const [checked, setChecked] = useState(true);
  const [selected, setSelected] = useState('daily');
  const [open, setOpen] = useState(false);
  const [workspaceCollapsed, setWorkspaceCollapsed] = useState(() => matchMedia('(max-width: 720px)').matches);
  const [workspaceRows, setWorkspaceRows] = useState(createWorkspaceRows);
  const [innerOpen, setInnerOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  const [locale, setLocale] = useState('en');
  const [selectValue, setSelectValue] = useState('0');
  const [organization, setOrganization] = useState('studio');
  const orgState = UI.useOrgSwitcher({
    getOrgs: async () => principal.orgs.slice(0, 3),
    getCurrentOrgID: () => organization,
    switchOrg: async id => { setOrganization(id); },
    eager: true,
  });
  useEffect(() => {
    if (scenario === 'effects') initLiquidGlass(document.getElementById('stage')!);
  }, [scenario]);
  function addProject() {
    setWorkspaceRows(previous => [{ name: 'Untitled project', status: 'Ready', jobs: 0 }, ...previous]);
  }
  function notify() {
    UI.message.clear();
    if (params.get('long') === 'true') {
      UI.message.error('Workspace_' + 'x'.repeat(180), { duration: 0 });
      return;
    }
    for (const tone of alertTones) UI.message(tone, tone === 'error' ? 'The workspace could not be saved. Try again.' : `${tone}: Your workspace is ready.`, { duration: 0 });
  }
  function ask() {
    void UI.confirm({ title: 'Delete workspace?', message: 'This removes the workspace and its saved settings.', danger: true, confirmText: 'Delete workspace' });
  }
  const prefs = <UI.AccountPrefs theme={theme} locale={locale} localeOptions={locales} onSetTheme={setTheme} onSetLocale={setLocale} />;

  if (scenario === 'buttons') return <div className="stack">
    {buttonSizes.map(size => <section key={size} className="sample" data-component="GlassButton">
      <p className="sample-label">Buttons / {size}</p>
      <div className="row">{buttonVariants.map(variant => <Fragment key={variant}>
        <UI.GlassButton variant={variant} size={size}>{variant}</UI.GlassButton>
        <UI.GlassButton variant={variant} size={size} disabled>Disabled</UI.GlassButton>
        <UI.GlassButton variant={variant} size={size} loading>Saving</UI.GlassButton>
      </Fragment>)}</div>
    </section>)}
    <section className="sample" data-component="GlassIconButton"><p className="sample-label">Icon buttons</p><div className="row"><UI.GlassIconButton label="Add">+</UI.GlassIconButton><UI.GlassIconButton label="Small add" size="sm">+</UI.GlassIconButton><UI.GlassIconButton label="Pinned" pressed>★</UI.GlassIconButton><UI.GlassIconButton label="Unavailable" disabled>+</UI.GlassIconButton></div></section>
  </div>;
  if (scenario === 'forms') return <div className="stack">
    <div className="grid" data-component="GlassField"><UI.GlassField value={text} onChange={setText} label="Workspace name" /><UI.GlassField label="Email" placeholder="you@example.test" error="Enter an email address." /><UI.GlassField label="Notes" multiline value="A shared space for the team." /><UI.GlassField label="Disabled field" disabled value="Read only" /></div>
    <section className="sample row" data-component="GlassCheckbox"><UI.GlassCheckbox value={checked} onChange={setChecked} label="Selected" /><UI.GlassCheckbox value={false} label="Unselected" /><UI.GlassCheckbox value={true} disabled label="Disabled selected" /><UI.GlassCheckbox value={false} disabled label="Disabled" /></section>
    <section className="sample row" data-component="GlassSwitch"><UI.GlassSwitch value={checked} onChange={setChecked} label="Notifications" /><UI.GlassSwitch value={false} label="Off" /><UI.GlassSwitch value={true} disabled label="Disabled" /></section>
    <section className="sample row" data-component="GlassRadio">{options.map(option => <UI.GlassRadio key={option.value} value={selected} onChange={setSelected} name="frequency" optionValue={option.value} label={option.label} disabled={option.value === 'monthly'} />)}</section>
    <section className="sample" data-component="GlassSegmented"><UI.GlassSegmented value={selected} onChange={setSelected} options={options} ariaLabel="Frequency" /></section>
    <section className="sample" data-component="GlassTabs"><UI.GlassTabs value={selected} onChange={setSelected} tabs={options} ariaLabel="Report period" /></section>
  </div>;
  if (scenario === 'select') return <div className="stack" style={{ minHeight: 480 }} data-component="GlassSelect">
    <UI.GlassSelect value={selectValue} onChange={setSelectValue} options={selectOptions} ariaLabel="Workspace" />
    <UI.GlassSelect value="" options={[]} ariaLabel="Empty choices" />
    <UI.GlassSelect value="" options={selectOptions} disabled ariaLabel="Disabled choices" />
  </div>;
  if (scenario === 'feedback') return <div className="stack">
    <section className="sample stack" data-component="GlassBadge">{[false, true].map(solid => <div key={String(solid)} className="row">{badgeTones.map(tone => <UI.GlassBadge key={tone} tone={tone} solid={solid} dot>{tone}</UI.GlassBadge>)}</div>)}</section>
    <div className="grid" data-component="GlassAlert">{alertTones.map(tone => <UI.GlassAlert key={tone} tone={tone} title={tone} dismissible>Workspace activity is available here.</UI.GlassAlert>)}</div>
    <section className="sample row" data-component="GlassSpinner"><UI.GlassSpinner size={16} /><UI.GlassSpinner size={24} /><UI.GlassSpinner size={40} /></section>
    <section className="sample stack" data-component="GlassProgress">{progressValues.map(value => <UI.GlassProgress key={value} value={value} label={`Progress ${value}`} />)}</section>
    <section className="sample row" data-component="GlassSkeleton"><UI.GlassSkeleton width="48px" height="48px" circle /><div className="stack" style={{ flex: 1 }}><UI.GlassSkeleton /><UI.GlassSkeleton width="65%" /></div></section>
  </div>;
  if (scenario === 'workspace') return <div className="workspace-demo">
    <div className="workspace-rail" data-component="ConsoleSidebar"><UI.ConsoleSidebar model={nav} activeKey="overview" brandName="Workspace" brandSub="Console" search expandOnBrandClick collapsed={workspaceCollapsed} onCollapsedChange={setWorkspaceCollapsed} logo={<UI.LatereLogoMark />} /></div>
    <main className="workspace-main">
      <div className="workspace-heading"><div><p className="sample-label">Design studio</p><h2>Workspace overview</h2></div><span className="workspace-status">All changes saved</span></div>
      <div data-component="GlassBar"><UI.GlassBar><UI.GlassButton size="sm">All projects</UI.GlassButton><UI.GlassButton variant="ghost" size="sm">Recent</UI.GlassButton><span className="workspace-spacer" /><UI.GlassButton variant="primary" size="sm" onClick={addProject}>New project</UI.GlassButton></UI.GlassBar></div>
      <div className="workspace-metrics" data-component="GlassPanel">{workspaceMetrics(workspaceRows.length).map(metric => <UI.GlassPanel key={metric.label}><p>{metric.label}</p><strong>{metric.value}</strong><small>{metric.detail}</small></UI.GlassPanel>)}</div>
      <section className="workspace-projects" data-component="GlassTable"><div className="workspace-section-heading"><h3>Projects</h3><span>{workspaceRows.length} projects</span></div><UI.GlassTable columns={columns} rows={workspaceRows} /></section>
      <div className="workspace-note"><span>Activity</span><p>Alex updated the component library <span>· 12 minutes ago</span></p></div>
    </main>
  </div>;
  if (scenario === 'containers') return <div className="stack">
    <div className="material-stage material-grid" data-component="GlassSurface">{tiers.map(tier => <UI.GlassSurface key={tier} tier={tier} interactive className="material">{tier} surface · The quick brown fox</UI.GlassSurface>)}</div>
    <div className="grid" data-component="GlassPanel"><UI.GlassPanel>Regular panel</UI.GlassPanel><UI.GlassPanel tier="smoke">Smoke panel</UI.GlassPanel><UI.GlassPanel flush><div style={{ padding: 20 }}>Flush panel with host padding</div></UI.GlassPanel></div>
    <div data-component="GlassBar"><UI.GlassBar header>Workspace toolbar <UI.GlassButton size="sm">New project</UI.GlassButton></UI.GlassBar></div>
    <div data-component="GlassTable"><UI.GlassTable columns={columns} rows={rows} /></div>
  </div>;
  if (scenario === 'popover') return <div className="popover-stage" data-component="GlassPopover"><UI.GlassPopover placement={placement} matchWidth={matchWidth} trigger={<UI.GlassButton>Open menu</UI.GlassButton>}><div data-component="GlassMenu"><UI.GlassMenu items={menuItems} /></div></UI.GlassPopover></div>;
  if (scenario === 'tooltip') return <div className="popover-stage row" data-component="GlassTooltip"><UI.GlassTooltip text="Copy workspace link"><UI.GlassButton>Top tooltip</UI.GlassButton></UI.GlassTooltip><UI.GlassTooltip text="More information" placement="bottom"><UI.GlassButton>Bottom tooltip</UI.GlassButton></UI.GlassTooltip></div>;
  if (scenario === 'modal') return <div data-component="GlassModal"><UI.GlassButton onClick={() => setOpen(true)}>Open modal</UI.GlassButton><UI.GlassModal open={open} onClose={() => setOpen(false)} title="Workspace settings" footer={<><UI.GlassButton onClick={() => setOpen(false)}>Cancel</UI.GlassButton><UI.GlassButton variant="primary" onClick={() => setOpen(false)}>Save changes</UI.GlassButton></>}><UI.GlassField value={text} onChange={setText} label="Workspace name" /><p>Update the details your team sees.</p><UI.GlassButton onClick={() => setInnerOpen(true)}>Open nested modal</UI.GlassButton></UI.GlassModal><UI.GlassModal open={innerOpen} onClose={() => setInnerOpen(false)} title="Nested settings"><UI.GlassButton onClick={() => setInnerOpen(false)}>Close nested</UI.GlassButton></UI.GlassModal></div>;
  if (scenario.startsWith('drawer-')) return <div data-component="GlassDrawer"><UI.GlassButton onClick={() => setOpen(true)}>Open drawer</UI.GlassButton><UI.GlassDrawer open={open} onClose={() => setOpen(false)} title="Workspace details" side={scenario === 'drawer-left' ? 'left' : 'right'}><UI.GlassField value={text} onChange={setText} label="Name" />{Array.from({ length: 16 }, (_, i) => <p key={i + 1}>Detail {i + 1}: Workspace activity and settings.</p>)}<UI.GlassButton onClick={() => setOpen(false)}>Done</UI.GlassButton></UI.GlassDrawer></div>;
  if (scenario === 'toast') return <div data-component="GlassToaster"><UI.GlassButton onClick={notify}>Show notifications</UI.GlassButton><UI.GlassToaster /></div>;
  if (scenario === 'confirm') return <div data-component="GlassConfirmHost"><UI.GlassButton onClick={ask}>Delete workspace</UI.GlassButton><UI.GlassConfirmHost /></div>;
  if (scenario.startsWith('sidebar')) return <div className="shell-stage" data-component="ConsoleSidebar"><UI.ConsoleSidebar model={nav} activeKey="jobs" brandName="Workspace" brandSub="Console" search collapsed={scenario === 'sidebar-collapsed'} logo={<UI.LatereLogoMark />} /><div className="shell-content"><h2>Workspace overview</h2><p>Projects and activity appear beside the navigation.</p></div></div>;
  if (scenario === 'palette') return <div data-component="ConsolePalette"><UI.GlassButton onClick={() => setOpen(true)}>Open palette</UI.GlassButton><UI.ConsolePalette open={open} model={paletteNav} onClose={() => setOpen(false)} /></div>;
  if (scenario === 'docs') return <div data-component="DocsLayout"><UI.DocsLayout showToc={showToc} groups={groups} activeSlug="intro" articleHtml={article} /></div>;
  if (scenario === 'account') return <form data-component="AccountMenu" style={{ display: 'flex', justifyContent: 'flex-end' }} onSubmit={event => { event.preventDefault(); setText('Unexpected submit'); }}><UI.AccountMenu principal={principal} dashboardPath="#dashboard" prefs={<div data-component="AccountPrefs">{prefs}</div>} /></form>;
  if (scenario === 'preferences') return <div className="sample" data-component="AccountPrefs">{prefs}</div>;
  if (scenario === 'products') return <div data-component="ProductSwitcher"><UI.ProductSwitcher current="" /></div>;
  if (scenario === 'organizations') return <div className="sample" data-component="OrgSwitcher"><UI.OrgSwitcher state={orgState} /></div>;
  if (scenario.startsWith('footer')) return <div data-component="SiteFooter"><UI.SiteFooter theme={theme} locale={locale} locales={locales} compact={scenario === 'footer-compact'} onThemeChange={setTheme} onLocaleChange={setLocale} /></div>;
  if (scenario === 'logo') return <div className="logo-stage row" data-component="LatereLogoMark"><UI.LatereLogoMark />{brands.map(brand => <span key={brand} className={`${brand}-brand`} style={{ fontSize: 28 }}>{brand}</span>)}</div>;
  if (scenario === 'effects') return <div className="material-stage" data-component="GlassSurface"><UI.GlassButton onClick={() => initLiquidGlass()}>Refresh effects</UI.GlassButton><UI.GlassSurface className="effect-surface" data-lg-refract="off">Frosted glass · refraction off</UI.GlassSurface><UI.GlassSurface className="effect-surface" data-lg-refract="">Edge refraction · patterned backdrop</UI.GlassSurface><UI.GlassSurface className="effect-surface" data-lg-sheen="" data-lg-refract="off">Pointer sheen · move across this surface</UI.GlassSurface></div>;
  return <div>Unknown scenario: {scenario}</div>;
}

export function mountReactParityGallery(root: HTMLElement, scenario: string) {
  const app = createRoot(root);
  app.render(<ReactParityGallery scenario={scenario} />);
  return () => app.unmount();
}
