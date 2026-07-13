// React port of tests/account-menu.test.ts, plus a case for the optional
// SessionProvider context integration (principal/login/logout/switchOrg
// falling back to the ambient provider when the corresponding prop is
// omitted — the one behavior with no Vue analogue, since Vue's AccountMenu
// has no such ambient context to opt into).
import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Principal } from '../../session/types';
import { AccountMenu } from '../AccountMenu';
import { SessionProvider } from '../session';

const base: Principal = {
  principal_id: 'p1',
  email: 'a@b.c',
  display_name: 'Ada Lovelace',
  initials: 'AL',
  org_id: '',
  orgs: [],
};

function mountOpen(principal: Principal | null, placement: 'top-end' | 'bottom-start' = 'top-end') {
  const utils = render(
    <AccountMenu principal={principal} placement={placement} prefs={<div className="test-prefs">THEME+LANG</div>} />,
  );
  fireEvent.click(utils.container.querySelector('.lu-am-trigger')!);
  return utils;
}

describe('AccountMenu (react)', () => {
  it('renders the prefs prop when open (theme/language survive)', () => {
    const { container } = mountOpen(base);
    expect(container.querySelector('.test-prefs')).not.toBeNull();
    expect(container.textContent).toContain('THEME+LANG');
  });

  it('hides the org section when the principal has no orgs (no lonely Personal)', () => {
    const { container } = mountOpen({ ...base, orgs: [] });
    expect(container.querySelector('.lu-am-org')).toBeNull();
    expect(container.textContent).not.toContain('Organizations');
  });

  it('shows the org switcher (Personal + memberships) when orgs exist', () => {
    const { container } = mountOpen({
      ...base,
      org_id: 'o1',
      orgs: [{ id: 'o1', name: 'Org One', slug: 'org-one', owner: true }],
    });
    const orgRows = container.querySelectorAll('.lu-am-org');
    expect(orgRows.length).toBe(2);
    expect(container.textContent).toContain('Org One');
    expect(container.textContent).toContain('Personal');
  });

  it('calls onSwitchOrg when a membership row is clicked', () => {
    const onSwitchOrg = vi.fn();
    const { container } = render(
      <AccountMenu principal={{ ...base, org_id: '', orgs: [{ id: 'o1', name: 'Org One' }] }} onSwitchOrg={onSwitchOrg} />,
    );
    fireEvent.click(container.querySelector('.lu-am-trigger')!);
    const orgRows = container.querySelectorAll('.lu-am-org');
    fireEvent.click(orgRows[1]);
    expect(onSwitchOrg).toHaveBeenCalledWith('o1');
  });

  it('renders data-driven extraItems styled as menu items', () => {
    const onNavigate = vi.fn();
    const onItemSelect = vi.fn();
    const { container } = render(
      <AccountMenu
        principal={base}
        onNavigate={onNavigate}
        onItemSelect={onItemSelect}
        extraItems={[
          { label: 'Admin Panel', href: 'https://auth.test/admin' },
          { label: 'Deck access', to: '/admin/decks' },
          { label: 'Do thing', id: 'thing' },
        ]}
      />,
    );
    fireEvent.click(container.querySelector('.lu-am-trigger')!);
    const items = container.querySelectorAll('.lu-am-item');
    const labels = Array.from(items).map((i) => i.textContent);
    expect(labels).toContain('Admin Panel');
    expect(labels).toContain('Deck access');
    const a = container.querySelector('a.lu-am-item')!;
    expect(a.getAttribute('href')).toBe('https://auth.test/admin');
    let buttons = Array.from(container.querySelectorAll('button.lu-am-item'));
    fireEvent.click(buttons.find((b) => b.textContent === 'Deck access')!);
    expect(onNavigate).toHaveBeenCalledWith('/admin/decks');
    // Clicking a row closes the dropdown (matches the Vue original); reopen
    // it before exercising the second row.
    fireEvent.click(container.querySelector('.lu-am-trigger')!);
    buttons = Array.from(container.querySelectorAll('button.lu-am-item'));
    fireEvent.click(buttons.find((b) => b.textContent === 'Do thing')!);
    expect(onItemSelect).toHaveBeenCalledWith('thing');
  });

  it('logged out with no content: trigger is a direct Sign in (no dropdown)', () => {
    const onLogin = vi.fn();
    const { container } = render(<AccountMenu principal={null} onLogin={onLogin} />);
    fireEvent.click(container.querySelector('.lu-am-trigger')!);
    expect(container.querySelector('.lu-am-dd')).toBeNull();
    expect(container.querySelector('.lu-am-chev')).toBeNull();
    expect(container.querySelector('.lu-am-avatar')!.textContent).toBe('?');
    expect(container.querySelector('.lu-am-id-name')!.textContent).toBe('Sign in');
    expect(container.querySelector('.lu-am-id-sub')).toBeNull();
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('logged out WITH prefs: still opens a dropdown (theme/lang useful)', () => {
    const { container } = render(
      <AccountMenu principal={null} prefs={<div className="test-prefs">PREFS</div>} />,
    );
    fireEvent.click(container.querySelector('.lu-am-trigger')!);
    expect(container.querySelector('.lu-am-dd')).not.toBeNull();
    expect(container.querySelector('.test-prefs')).not.toBeNull();
  });

  it('bottom-start variant marks the menu as opening upward (sidebar fit)', () => {
    const { container } = mountOpen(base, 'bottom-start');
    expect(container.querySelector('.lu-am-up')).not.toBeNull();
    expect(container.querySelector('.lu-am-dd-left')).not.toBeNull();
  });

  it('renders nothing when logged out and signedInOnly is set', () => {
    const { container } = render(<AccountMenu principal={null} signedInOnly />);
    expect(container.querySelector('.lu-am')).toBeNull();
  });

  it('an extraItem with no href/id/to (bare action row) does not call onItemSelect', () => {
    const onItemSelect = vi.fn();
    const { container } = render(
      <AccountMenu
        principal={base}
        onItemSelect={onItemSelect}
        extraItems={[{ label: 'No-op' }]}
      />,
    );
    fireEvent.click(container.querySelector('.lu-am-trigger')!);
    fireEvent.click(container.querySelector('button.lu-am-item')!);
    expect(onItemSelect).not.toHaveBeenCalled();
  });
});

describe('AccountMenu role badge (shared four-role account model)', () => {
  it('renders a Platform Admin accent badge and "Individual" subline for a no-org superadmin', () => {
    const { container } = render(<AccountMenu principal={{ ...base, role: 'platform_admin' }} />);
    const badge = container.querySelector('.lu-am-role')!;
    expect(badge.textContent).toBe('Platform Admin');
    expect(badge.className).toContain('lu-am-role-platform_admin');
    expect(container.querySelector('.lu-am-id-sub-text')!.textContent).toBe('Individual');
  });

  it('shows the org name as subline and an Admin badge for an org admin', () => {
    const { container } = render(
      <AccountMenu principal={{ ...base, org_id: 'o1', org_name: 'Acme', role: 'org_admin' }} />,
    );
    expect(container.querySelector('.lu-am-role')!.textContent).toBe('Admin');
    expect(container.querySelector('.lu-am-id-sub-text')!.textContent).toBe('Acme');
  });

  it('shows no badge for a plain individual (subline carries it)', () => {
    const { container } = render(<AccountMenu principal={{ ...base, role: 'individual' }} />);
    expect(container.querySelector('.lu-am-role')).toBeNull();
    expect(container.querySelector('.lu-am-id-sub-text')!.textContent).toBe('Individual');
  });

  it('falls back to the legacy Personal subline when no role is set', () => {
    const { container } = render(<AccountMenu principal={base} />);
    expect(container.querySelector('.lu-am-role')).toBeNull();
    expect(container.querySelector('.lu-am-id-sub-text')!.textContent).toBe('Personal');
  });

  it('honors custom role labels', () => {
    const { container } = render(
      <AccountMenu
        principal={{ ...base, role: 'platform_admin' }}
        labels={{ roles: { platform_admin: '平台管理员' } }}
      />,
    );
    expect(container.querySelector('.lu-am-role')!.textContent).toBe('平台管理员');
  });
});

describe('AccountMenu dropdown identity descriptor', () => {
  it('shows the role badge + individual context in the open dropdown', () => {
    const { container } = mountOpen({ ...base, role: 'platform_admin' });
    const meta = container.querySelector('.lu-am-head-meta')!;
    expect(meta.querySelector('.lu-am-role')!.textContent).toBe('Platform Admin');
    expect(meta.querySelector('.lu-am-head-context')!.textContent).toBe('Individual');
  });

  it('shows the org name as context for an org member', () => {
    const { container } = mountOpen({ ...base, org_id: 'o1', org_name: 'Acme', role: 'org_member' });
    expect(container.querySelector('.lu-am-head-context')!.textContent).toBe('Acme');
    expect(container.querySelector('.lu-am-head-meta .lu-am-role')!.textContent).toBe('Member');
  });
});

// SessionProvider integration: no Vue analogue (Vue's AccountMenu never reads
// an ambient store), but the ported component's headline feature.
describe('AccountMenu under SessionProvider', () => {
  function mockFetch(responses: Array<[number, unknown]>) {
    let i = 0;
    return vi.fn(async () => {
      const [status, body] = responses[Math.min(i++, responses.length - 1)];
      return {
        ok: status >= 200 && status < 300,
        status,
        statusText: 'x',
        text: async () => JSON.stringify(body),
      } as Response;
    });
  }

  beforeEach(() => {
    const loc = { pathname: '/', search: '', href: '' } as unknown as Location;
    Object.defineProperty(loc, 'href', { get: () => '', set: vi.fn() });
    Object.defineProperty(window, 'location', { value: loc, configurable: true, writable: true });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reads the ambient principal when the prop is omitted', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, base]]));
    const { container } = render(
      <SessionProvider>
        <AccountMenu />
      </SessionProvider>,
    );
    await waitFor(() => expect(container.querySelector('.lu-am-id-name')!.textContent).toBe('Ada Lovelace'));
  });

  it('falls back to the ambient logout when onLogout is omitted', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, base]]));
    const hrefSpy = vi.fn();
    Object.defineProperty(window.location, 'href', { set: hrefSpy, get: () => '' });
    const { container } = render(
      <SessionProvider logoutPath="/sign-out">
        <AccountMenu />
      </SessionProvider>,
    );
    await waitFor(() => expect(container.querySelector('.lu-am-id-name')!.textContent).toBe('Ada Lovelace'));
    fireEvent.click(container.querySelector('.lu-am-trigger')!);
    fireEvent.click(container.querySelector('.lu-am-danger')!);
    expect(hrefSpy).toHaveBeenCalledWith('/sign-out');
  });

  it('an explicit principal prop overrides the ambient one', async () => {
    vi.stubGlobal('fetch', mockFetch([[200, base]]));
    const { container } = render(
      <SessionProvider>
        <AccountMenu principal={null} signedInOnly />
      </SessionProvider>,
    );
    // Give the provider's fetchMe a tick to resolve; the explicit `null` prop
    // must still win over the now-resolved ambient principal.
    await new Promise((r) => setTimeout(r, 0));
    expect(container.querySelector('.lu-am')).toBeNull();
  });
});
