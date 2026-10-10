import React, { useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AccountMenu, ConsoleSidebar, GlassAlert, GlassBadge, GlassBar, GlassButton,
  GlassCheckbox, GlassField, GlassMenu, GlassModal, GlassPanel, GlassPopover, GlassSegmented, GlassSelect,
  GlassSpinner, GlassTable, LatereLogoMark, SiteFooter,
  type ConsoleNavModel, type GlassTier, type Locale, type Principal, type Theme,
} from '../../src/react';
import { GlassSurface } from '../../src/react/GlassSurface';

const principal: Principal = {
  principal_id: 'visual-user', email: 'alex@example.test', display_name: 'Alex Morgan',
  initials: 'AM', org_id: 'studio', org_name: 'Design Studio', role: 'org_admin',
  orgs: [{ id: 'studio', name: 'Design Studio', owner: true }, { id: 'research', name: 'Research Lab' }],
};
const tiers: GlassTier[] = ['ultrathin', 'thin', 'regular', 'thick', 'smoke'];
const options = [
  { value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly', disabled: true },
];
const model: ConsoleNavModel = { groups: [
  { label: 'Workspace', items: [
    { id: 'overview', label: 'Overview', to: '#overview' },
    { id: 'projects', label: 'Projects', to: '#projects', badge: 12 },
    { id: 'activity', label: 'Activity', to: '#activity', badge: 'live' },
    { id: 'inbox', label: 'Inbox', to: '#inbox', dot: true },
    { id: 'archive', label: 'Archive', disabled: true },
  ] },
  { label: 'Manage', pin: 'bottom', items: [{ id: 'settings', label: 'Settings', action: true }] },
] };

function Sample({ name, label, children }: { name: string; label?: string; children: ReactNode }) {
  return <section className="sample" data-component={name}>
    <div className="sample-label">{label ?? name}</div>{children}
  </section>;
}

function Buttons() {
  const [count, setCount] = useState(0);
  return <Sample name="GlassButton"><div className="stack">
    {(['glass', 'primary', 'ghost', 'danger'] as const).map(variant => <div className="row" key={variant}>
      <GlassButton variant={variant} onClick={() => setCount(count + 1)}>{variant}</GlassButton>
      <GlassButton variant={variant} size="sm">Small</GlassButton>
      <GlassButton variant={variant} disabled>Disabled</GlassButton>
      <GlassButton variant={variant} loading>Loading</GlassButton>
      <GlassButton variant={variant} icon={<span aria-hidden="true">＋</span>}>Create</GlassButton>
    </div>)}
    <p aria-live="polite">Actions: {count}</p>
  </div></Sample>;
}

function Forms() {
  const [text, setText] = useState('Design system');
  const [checked, setChecked] = useState(true);
  const [selected, setSelected] = useState('weekly');
  const [segment, setSegment] = useState('daily');
  return <div className="stack">
    <Sample name="GlassField"><div className="grid">
      <GlassField label="Project name" value={text} onChange={setText} />
      <GlassField label="Empty field" placeholder="Enter a name" />
      <GlassField label="Email" value="alex@" error="Enter a valid email address." />
      <GlassField label="Disabled field" value="Read only" disabled />
      <GlassField label="Notes" value={'A shared visual language.\nBuilt for every product.'} multiline />
    </div></Sample>
    <Sample name="GlassCheckbox"><div className="row">
      <GlassCheckbox label="Enable notifications" value={checked} onChange={setChecked} />
      <GlassCheckbox label="Unchecked" value={false} />
      <GlassCheckbox label="Disabled checked" value disabled />
      <GlassCheckbox label="Disabled unchecked" value={false} disabled />
    </div></Sample>
    <Sample name="GlassSelect"><div className="grid">
      <GlassSelect ariaLabel="Schedule" value={selected} options={options} onChange={setSelected} />
      <GlassSelect ariaLabel="Placeholder select" value="" options={options} placeholder="Choose a schedule" />
      <GlassSelect ariaLabel="Disabled select" value="daily" options={options} disabled />
      <GlassSelect ariaLabel="Empty select" value="" options={[]} placeholder="No schedules" />
    </div></Sample>
    <Sample name="GlassSegmented"><GlassSegmented ariaLabel="View interval" value={segment}
      options={options.map(({ value, label }) => ({ value, label }))} onChange={setSegment} /></Sample>
  </div>;
}

function Feedback() {
  const [dismissed, setDismissed] = useState(false);
  return <div className="stack">
    <Sample name="GlassBadge"><div className="stack">
      {(['neutral', 'running', 'idle', 'stopped', 'error', 'creating'] as const).map(tone => <div className="row" key={tone}>
        <GlassBadge tone={tone}>{tone}</GlassBadge><GlassBadge tone={tone} dot>{tone}</GlassBadge>
        <GlassBadge tone={tone} solid>{tone}</GlassBadge><GlassBadge tone={tone} solid dot>{tone}</GlassBadge>
      </div>)}
    </div></Sample>
    <Sample name="GlassAlert"><div className="stack">
      {(['info', 'success', 'warning', 'error'] as const).map(tone => <GlassAlert key={tone} tone={tone} title={tone}>
        Your workspace changes are ready to review.
      </GlassAlert>)}
      {!dismissed && <GlassAlert title="Dismissible notice" dismissible onDismiss={() => setDismissed(true)}>You can close this notice.</GlassAlert>}
    </div></Sample>
    <Sample name="GlassSpinner"><div className="row">{[16, 20, 32].map(size => <GlassSpinner key={size} size={size} label={`Loading ${size}`} />)}</div></Sample>
  </div>;
}

function Containers() {
  return <div className="stack">
    <Sample name="GlassSurface"><div className="grid material-stage">{tiers.map(tier => <GlassSurface key={tier} tier={tier} interactive>
      <div style={{ padding: 20 }}><strong>{tier}</strong><p>Glass over a textured canvas.</p></div>
    </GlassSurface>)}</div></Sample>
    <Sample name="GlassPanel"><div className="grid material-stage">{tiers.map(tier => <GlassPanel key={tier} tier={tier}>
      <strong>{tier} panel</strong><p>Content with comfortable spacing.</p>
    </GlassPanel>)}<GlassPanel flush><div style={{ padding: 12 }}>Flush panel with custom spacing.</div></GlassPanel></div></Sample>
    <Sample name="GlassBar"><GlassBar header sticky><strong>Workspace</strong><GlassButton size="sm">New project</GlassButton></GlassBar></Sample>
    <Sample name="GlassTable"><GlassTable
      columns={[{ key: 'name', label: 'Project' }, { key: 'status', label: 'Status' }, { key: 'jobs', label: 'Jobs', align: 'right' }]}
      rows={[{ name: 'Design system', status: 'Running', jobs: 12 }, { name: 'Documentation', status: 'Idle', jobs: 3 }, { name: 'Release checks', status: 'Complete', jobs: 24 }]}
    /></Sample>
  </div>;
}

function Modal() {
  const [open, setOpen] = useState(false);
  const [nested, setNested] = useState(false);
  return <Sample name="GlassModal">
    <GlassButton onClick={() => setOpen(true)}>Open modal</GlassButton>
    <GlassModal open={open} title="Create project" onClose={() => setOpen(false)} footer={<>
      <GlassButton onClick={() => setOpen(false)}>Cancel</GlassButton>
      <GlassButton variant="primary" onClick={() => setNested(true)}>Create project</GlassButton>
    </>}><p>A focused reading surface above the workspace.</p><GlassField label="Project name" value="Design system" /></GlassModal>
    <GlassModal open={nested} layer="confirm" title="Confirm creation" onClose={() => setNested(false)} footer={<GlassButton onClick={() => setNested(false)}>Back</GlassButton>}>
      This dialog stays above the project form.
    </GlassModal>
  </Sample>;
}

// Floating panels where a box would clip them: a select and a menu in a
// dialog's form, a select at the bottom of a scrolling panel, and a select
// and a menu in a bar pinned to the bottom of the viewport, where only the
// room above holds them.
const roles = [{ value: 'member', label: 'Member' }, { value: 'admin', label: 'Admin' }];
const keyActions = [{ value: 'rotate', label: 'Rotate key' }, { value: 'copy', label: 'Copy key ID' }, { value: 'revoke', label: 'Revoke key', danger: true }];

function Layers() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [schedule, setSchedule] = useState('weekly');
  const [effort, setEffort] = useState('daily');
  return <div className="stack">
    <Sample name="GlassModal" label="Select and menu in a dialog">
      <GlassButton onClick={() => setOpen(true)}>Create service account</GlassButton>
      <GlassModal open={open} title="Create a service account" width="32rem" onClose={() => setOpen(false)} footer={<>
        <GlassButton onClick={() => setOpen(false)}>Cancel</GlassButton>
        <GlassButton variant="primary" onClick={() => setOpen(false)}>Create service account</GlassButton>
      </>}>
        <p>A service account acts for the organization in scripts and pipelines, with keys of its own.</p>
        {/* The select is the body's last line, as in the console's form, so
            its menu reaches past the dialog's lower edge. */}
        <GlassField label="Name" value={name} placeholder="Nightly builds" onChange={setName} />
        <div className="row" style={{ marginTop: 12 }}>
          <div style={{ flex: 1 }}><GlassSelect value={role} options={roles} ariaLabel="Role" onChange={setRole} /></div>
          <GlassPopover placement="bottom-end" trigger={<GlassButton>Key actions</GlassButton>}>{({ close }) =>
            <GlassMenu items={keyActions} label="Key actions" autofocus onSelect={() => close()} />}
          </GlassPopover>
        </div>
      </GlassModal>
    </Sample>
    <Sample name="GlassSelect" label="Select at the bottom of a scrolling panel">
      <div className="layers-scroller" data-testid="scroller" style={{ height: 160, overflowY: 'auto', border: '1px solid var(--border, #ddd)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
        {Array.from({ length: 3 }, (_, i) => <p key={i}>{`Line ${i + 1} of the schedule notes.`}</p>)}
        <div style={{ width: 220 }}><GlassSelect value={schedule} options={options} ariaLabel="Schedule" onChange={setSchedule} /></div>
        {Array.from({ length: 8 }, (_, i) => <p key={i}>{`Line ${i + 4} of the schedule notes.`}</p>)}
      </div>
    </Sample>
    <div className="layers-bar" style={{ position: 'fixed', left: 16, right: 16, bottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 200 }}><GlassSelect value={effort} options={options} ariaLabel="Effort" onChange={setEffort} /></div>
      <GlassPopover trigger={<GlassButton>Composer actions</GlassButton>}>{({ close }) =>
        <GlassMenu items={keyActions} label="Composer actions" autofocus onSelect={() => close()} />}
      </GlassPopover>
    </div>
  </div>;
}

function Account({ sidebar = false }: { sidebar?: boolean }) {
  const [account, setAccount] = useState(principal);
  const [appearance, setAppearance] = useState(document.documentElement.dataset.theme ?? 'light');
  return <AccountMenu principal={account} placement={sidebar ? 'bottom-start' : 'top-end'} dashboardPath="#dashboard"
    onSwitchOrg={id => setAccount({ ...account, org_id: id, org_name: principal.orgs.find(org => org.id === id)?.name })}
    onNavigate={() => undefined} onLogout={() => undefined}
    extraItems={[{ id: 'settings', label: 'Account settings' }]}
    prefs={<div className="row" style={{ padding: 8 }}><span>Appearance</span><GlassSegmented ariaLabel="Appearance" value={appearance} onChange={value => { setAppearance(value); document.documentElement.dataset.theme = value; }} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /></div>}
  />;
}

function Sidebar({ initiallyCollapsed }: { initiallyCollapsed: boolean }) {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const [active, setActive] = useState('overview');
  return <Sample name="ConsoleSidebar"><div className="shell-stage">
    <ConsoleSidebar model={model} activeKey={active} collapsed={collapsed} onCollapsedChange={setCollapsed}
      brandName="Workspace" brandSub="Console" search onNavigate={item => setActive(item.id)}
      foot={<div data-component="AccountMenu"><Account sidebar /></div>} />
  </div></Sample>;
}

function Footer() {
  const [locale, setLocale] = useState<Locale>('en');
  const [theme, setTheme] = useState<Theme>(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  return <Sample name="SiteFooter" label="Footer"><SiteFooter locale={locale}
    theme={theme} onLocaleChange={setLocale} onThemeChange={value => { setTheme(value); document.documentElement.dataset.theme = value; }}
    locales={[{ code: 'en', label: 'EN', name: 'English' }, { code: 'zh', label: '中', name: '中文' }, { code: 'de', label: 'DE', name: 'Deutsch' }]} />
  </Sample>;
}

function Gallery({ scenario }: { scenario: string }) {
  switch (scenario) {
    case 'buttons': return <Buttons />;
    case 'forms': return <Forms />;
    case 'feedback': return <Feedback />;
    case 'containers': return <Containers />;
    case 'modal': return <Modal />;
    case 'layers': return <Layers />;
    case 'sidebar': return <Sidebar initiallyCollapsed={false} />;
    case 'sidebar-collapsed': return <Sidebar initiallyCollapsed />;
    case 'account': return <Sample name="AccountMenu"><div style={{ minHeight: 530, display: 'flex', justifyContent: 'flex-end' }}><div><Account /></div></div><AccountMenu principal={null} onLogin={() => undefined} /></Sample>;
    case 'footer': return <Footer />;
    case 'logo': return <Sample name="LatereLogoMark"><div className="row">{[24, 48, 96].map(size => <div key={size} style={{ width: size, height: size }}><LatereLogoMark width={size} height={size} /></div>)}</div></Sample>;
    default: throw new Error(`Unknown React visual scenario: ${scenario}`);
  }
}

export function mountReactGallery(root: HTMLElement, scenario: string): void {
  createRoot(root).render(<Gallery scenario={scenario} />);
}
