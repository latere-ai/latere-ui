// Canonical content shared by the Vue and React visual galleries.
export const options = [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }];
export const selectOptions = Array.from({ length: 20 }, (_, i) => ({ value: String(i), label: `Workspace ${String(i + 1).padStart(2, '0')}`, disabled: i === 1 }));
export const nav = { groups: [{ label: 'Workspace', items: [{ id: 'overview', label: 'Overview', to: '#overview', icon: 'home' }, { id: 'jobs', label: 'Jobs', to: '#jobs', badge: 12 }, { id: 'live', label: 'Activity', to: '#activity', badge: 'live' as const }, { id: 'future', label: 'Coming soon', disabled: true }] }, { pin: 'bottom' as const, items: [{ id: 'settings', label: 'Settings', to: '#settings' }] }] };
export const paletteNav = { groups: [{ label: 'Workspace', items: Array.from({ length: 30 }, (_, i) => ({ id: String(i), label: `Page ${String(i + 1).padStart(2, '0')}`, to: `#page-${i}` })) }] };
export const principal = { principal_id: 'user-1', email: 'alex@example.test', display_name: 'Alex Morgan', initials: 'AM', org_id: 'studio', org_name: 'Design studio', role: 'org_admin' as const, orgs: Array.from({ length: 16 }, (_, i) => ({ id: i ? `org-${i}` : 'studio', name: i ? `Workspace ${i}` : 'Design studio', slug: `workspace-${i}`, owner: i === 0 })) };
export const locales = [{ code: 'en', label: 'EN', name: 'English' }, { code: 'zh', label: '中', name: '中文' }, { code: 'de', label: 'DE', name: 'Deutsch' }];
export const tiers = ['ultrathin', 'thin', 'regular', 'thick', 'smoke'] as const;
export const badgeTones = ['neutral', 'running', 'idle', 'stopped', 'error', 'creating'] as const;
export const alertTones = ['info', 'success', 'warning', 'error'] as const;
export const menuItems = [{ value: 'copy', label: 'Copy link' }, { value: 'move', label: 'Move to folder' }, { value: 'disabled', label: 'Unavailable', disabled: true }, { value: 'delete', label: 'Delete', danger: true }];
export const columns = [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }, { key: 'jobs', label: 'Jobs' }];
export const rows = [{ name: 'Design studio', status: 'Running', jobs: 12 }, { name: 'Research lab', status: 'Idle', jobs: 4 }, { name: 'Archive', status: 'Stopped', jobs: 0 }];
export const groups = [{ id: 'start', label: 'Getting started', pages: [{ slug: 'intro', title: 'Introduction' }, { slug: 'setup', title: 'Setup' }] }, { id: 'guides', label: 'Guides', pages: [{ slug: 'sharing', title: 'Sharing' }] }];
export const article = '<p>Build a shared workspace for your team.</p><h2>Start a workspace</h2><p>Choose a name, invite your team, and begin a project.</p><blockquote>Your work stays together.</blockquote><h3>Invite teammates</h3><p>Share access with the people who need it.</p><pre><code>workspace.create({ name: "Studio" })</code></pre><h2>Review activity</h2><table><thead><tr><th>Role</th><th>Access</th></tr></thead><tbody><tr><td>Owner</td><td>Manage workspace</td></tr><tr><td>Member</td><td>Create projects</td></tr></tbody></table>';
export function createWorkspaceRows() { return Array.from({ length: 8 }, (_, i) => ({ name: ['Design system', 'Website refresh', 'Research notes', 'Component library', 'Brand assets', 'Mobile workspace', 'Team handbook', 'Release checklist'][i], status: i % 3 ? 'In progress' : 'Ready', jobs: [12, 8, 3, 24, 6, 5, 2, 4][i] })); }
export const buttonSizes = ['md', 'sm'] as const;
export const buttonVariants = ['glass', 'primary', 'ghost', 'danger'] as const;
export const progressValues = [0, 50, 100, 150, -10];
export const brands = ['cella', 'drive', 'lectio', 'lux', 'topos', 'wallfacer'];
export function workspaceMetrics(count: number) { return [{ label: 'Active projects', value: count, detail: 'Across your workspace' }, { label: 'Team members', value: 12, detail: 'Working together' }, { label: 'Completed this week', value: 24, detail: '8 more than last week' }]; }
