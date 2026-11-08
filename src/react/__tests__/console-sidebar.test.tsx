// The ConsoleSidebar's rows, brand, collapse state, search and render props.
import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConsoleSidebar } from '../ConsoleSidebar';
import type { ConsoleNavModel } from '../../console/nav';

const model: ConsoleNavModel = {
  groups: [
    {
      label: 'Workspace',
      items: [
        { id: 'requests', label: 'Requests', to: '/requests', badge: 'live' },
        { id: 'keys', label: 'Keys', to: '/keys', badge: 3 },
        { id: 'soon', label: 'Coming soon' }, // no `to` → disabled
      ],
    },
    {
      label: 'Settings',
      pin: 'bottom',
      items: [{ id: 'org', label: 'Organization', to: '/org' }],
    },
  ],
};

// Stands in for a real router's `Link`: forwards `to` as `data-rl` (so tests
// can assert on it) and spreads everything else onto the anchor — className,
// title, onClick, children, the way react-router's `Link` does. React has no
// automatic attribute fallthrough onto a child component's root element, so a
// router-link stub must forward these explicitly.
function RouterLinkStub({
  to,
  children,
  ...rest
}: { to: string; children?: React.ReactNode } & Record<string, unknown>) {
  return (
    <a data-rl={to} {...rest}>
      {children}
    </a>
  );
}

describe('<ConsoleSidebar /> (react)', () => {
  it('renders grouped rows with their labels', () => {
    const { container } = render(<ConsoleSidebar model={model} />);
    const labels = Array.from(container.querySelectorAll('.lu-cs-group-label')).map(
      (n) => n.textContent,
    );
    expect(labels).toEqual(['Workspace', 'Settings']);
    expect(container.querySelectorAll('.lu-cs-item').length).toBe(4);
    expect(container.textContent).toContain('Requests');
    expect(container.textContent).toContain('Organization');
  });

  it('marks the active row from activeKey', () => {
    const { container } = render(<ConsoleSidebar model={model} activeKey="keys" />);
    const active = Array.from(container.querySelectorAll('.lu-cs-item')).filter(
      (i) => i.getAttribute('data-active') === 'true',
    );
    expect(active.length).toBe(1);
    expect(active[0].textContent).toContain('Keys');
    expect(active[0].getAttribute('aria-current')).toBe('page');
  });

  it('pins bottom groups with the pinned class', () => {
    const { container } = render(<ConsoleSidebar model={model} />);
    const pinned = container.querySelector('.lu-cs-group-pinned');
    expect(pinned).not.toBeNull();
    expect(pinned!.getAttribute('data-pin')).toBe('bottom');
    expect(pinned!.textContent).toContain('Settings');
  });

  it('renders disabled rows as non-interactive spans that do not navigate', () => {
    const onNavigate = vi.fn();
    const { container } = render(<ConsoleSidebar model={model} onNavigate={onNavigate} />);
    const soon = Array.from(container.querySelectorAll('.lu-cs-item')).find((i) =>
      i.textContent?.includes('Coming soon'),
    )!;
    expect(soon.tagName).toBe('SPAN');
    expect(soon.getAttribute('data-disabled')).toBe('true');
    fireEvent.click(soon);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('emits navigate with the item on an enabled row click', () => {
    const onNavigate = vi.fn();
    const { container } = render(<ConsoleSidebar model={model} onNavigate={onNavigate} />);
    const keys = Array.from(container.querySelectorAll('.lu-cs-item')).find((i) =>
      i.textContent?.includes('Keys'),
    )!;
    fireEvent.click(keys);
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'keys', to: '/keys' }));
  });

  it('renders badge variants (numeric pill + live dot)', () => {
    const { container } = render(<ConsoleSidebar model={model} />);
    expect(container.querySelector('.lu-cs-badge-live')).not.toBeNull();
    expect(container.querySelector('.lu-cs-badge-dot')).not.toBeNull();
    const numeric = Array.from(container.querySelectorAll('.lu-cs-badge')).find(
      (b) => b.textContent === '3',
    );
    expect(numeric).toBeTruthy();
  });

  it('renders the brand as a non-navigating button when collapsed with expandOnBrandClick', () => {
    const onCollapsedChange = vi.fn();
    const { container } = render(
      <ConsoleSidebar
        model={model}
        collapsed
        expandOnBrandClick
        routerLink={RouterLinkStub}
        homeTo="/home"
        onCollapsedChange={onCollapsedChange}
      />,
    );
    const brand = container.querySelector('.lu-cs-brand')!;
    expect(brand.tagName).toBe('BUTTON');
    expect(brand.getAttribute('data-rl')).toBeNull();
    fireEvent.click(brand);
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it('renders the brand as a home link when expanded', () => {
    const { container } = render(
      <ConsoleSidebar
        model={model}
        collapsed={false}
        expandOnBrandClick
        routerLink={RouterLinkStub}
        homeTo="/home"
      />,
    );
    const brand = container.querySelector('.lu-cs-brand')!;
    expect(brand.tagName).toBe('A');
    expect(brand.getAttribute('data-rl')).toBe('/home');
  });

  it('toggles its own collapsed state and fires onCollapsedChange (uncontrolled)', () => {
    const onCollapsedChange = vi.fn();
    const { container } = render(
      <ConsoleSidebar model={model} onCollapsedChange={onCollapsedChange} />,
    );
    expect(container.querySelector('.lu-cs')!.getAttribute('data-collapsed')).toBe('false');
    fireEvent.click(container.querySelector('.lu-cs-fold')!);
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(container.querySelector('.lu-cs')!.getAttribute('data-collapsed')).toBe('true');
    expect(container.querySelector('.lu-cs-item-label')).toBeNull();
  });

  it('respects a controlled collapsed prop (does not self-toggle)', () => {
    const onCollapsedChange = vi.fn();
    const { container, rerender } = render(
      <ConsoleSidebar model={model} collapsed={false} onCollapsedChange={onCollapsedChange} />,
    );
    fireEvent.click(container.querySelector('.lu-cs-fold')!);
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(container.querySelector('.lu-cs')!.getAttribute('data-collapsed')).toBe('false');
    rerender(<ConsoleSidebar model={model} collapsed onCollapsedChange={onCollapsedChange} />);
    expect(container.querySelector('.lu-cs')!.getAttribute('data-collapsed')).toBe('true');
  });

  it('hides the fold button when collapsible is false', () => {
    const { container } = render(<ConsoleSidebar model={model} collapsible={false} />);
    expect(container.querySelector('.lu-cs-fold')).toBeNull();
  });

  it('routes enabled rows through an injected routerLink', () => {
    const { container } = render(<ConsoleSidebar model={model} routerLink={RouterLinkStub} />);
    const tos = Array.from(container.querySelectorAll('[data-rl]')).map((a) =>
      a.getAttribute('data-rl'),
    );
    expect(tos).toContain('/requests');
    expect(tos).toContain('/org');
  });

  it('renders the foot and brand render props', () => {
    const { container } = render(
      <ConsoleSidebar
        model={model}
        brandName="Lux"
        foot={<div className="test-foot">ACCOUNT</div>}
        brand={<div className="test-brand">BRAND</div>}
      />,
    );
    expect(container.querySelector('.test-foot')!.textContent).toBe('ACCOUNT');
    expect(container.querySelector('.test-brand')!.textContent).toBe('BRAND');
    expect(container.querySelector('.lu-cs-brand-mark')).toBeNull();
  });

  it('renders the built-in search bar and fires onSearch on click + Cmd-K', () => {
    const onSearch = vi.fn();
    const { container } = render(
      <ConsoleSidebar
        model={model}
        search
        searchLabel="Search & run"
        searchHint="⌘K"
        onSearch={onSearch}
      />,
    );
    const bar = container.querySelector('.lu-cs-search')!;
    expect(bar.textContent).toContain('Search & run');
    fireEvent.click(bar);
    expect(onSearch).toHaveBeenCalledTimes(1);
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    expect(onSearch).toHaveBeenCalledTimes(2);
    vi.restoreAllMocks();
  });

  it('omits the search bar unless search is enabled', () => {
    const { container } = render(<ConsoleSidebar model={model} />);
    expect(container.querySelector('.lu-cs-search')).toBeNull();
  });

  it('renders a logo prop and a colored brand box from brandColor', () => {
    const { container } = render(
      <ConsoleSidebar
        model={model}
        brandName="Lux"
        brandColor="#3a4ed1"
        logo={<svg className="test-logo" />}
      />,
    );
    const mark = container.querySelector('.lu-cs-brand-mark')!;
    expect(container.querySelector('.test-logo')).not.toBeNull();
    expect(mark.className).toContain('lu-cs-brand-mark--colored');
    expect(mark.getAttribute('style')).toContain('3a4ed1');
  });

  it('renders the top slot between the head and the nav', () => {
    const { container } = render(
      <ConsoleSidebar model={model} top={<button className="test-top">CMDK</button>} />,
    );
    expect(container.querySelector('.test-top')).not.toBeNull();
    const html = container.innerHTML;
    expect(html.indexOf('test-top')).toBeLessThan(html.indexOf('lu-cs-nav'));
  });

  it('renders the extra slot below the nav groups, above the foot', () => {
    const { container } = render(
      <ConsoleSidebar
        model={model}
        extra={<div className="test-extra">RECENT</div>}
        foot={<div className="test-foot2">ACCT</div>}
      />,
    );
    expect(container.querySelector('.test-extra')).not.toBeNull();
    const html = container.innerHTML;
    expect(html.indexOf('lu-cs-nav')).toBeLessThan(html.indexOf('test-extra'));
    expect(html.indexOf('test-extra')).toBeLessThan(html.indexOf('test-foot2'));
  });

  it('renders an action item (no route) as a clickable button that navigates', () => {
    const onNavigate = vi.fn();
    const m: ConsoleNavModel = {
      groups: [{ items: [{ id: 'terminal', label: 'Terminal', action: true }] }],
    };
    const { container } = render(<ConsoleSidebar model={m} onNavigate={onNavigate} />);
    const row = container.querySelector('.lu-cs-item')!;
    expect(row.tagName).toBe('BUTTON');
    expect(row.getAttribute('data-disabled')).toBe('false');
    fireEvent.click(row);
    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'terminal', action: true }),
    );
  });

  it('renders a trailing dot for items with dot:true', () => {
    const m: ConsoleNavModel = {
      groups: [{ items: [{ id: 'board', label: 'Board', to: '/', dot: true }] }],
    };
    const { container } = render(<ConsoleSidebar model={m} />);
    expect(container.querySelector('.lu-cs-dot')).not.toBeNull();
  });

  it('uses the default brand with a gradient wordmark theme', () => {
    const { container } = render(
      <ConsoleSidebar model={model} brandName="Lux" brandSub="Console" brandTheme="lux" />,
    );
    expect(container.querySelector('.lu-cs-brand-name')!.className).toContain('lux-brand');
    expect(container.querySelector('.lu-cs-brand-sub')!.textContent).toBe('Console');
  });

  it('supports a custom renderItem render prop', () => {
    const { container } = render(
      <ConsoleSidebar
        model={model}
        renderItem={({ item }) => <button className="custom-row">{item.label}</button>}
      />,
    );
    expect(container.querySelectorAll('.custom-row').length).toBe(4);
    expect(container.querySelector('.lu-cs-item')).toBeNull();
  });
});

describe('ConsoleSidebar collapsed names', () => {
  it('names a collapsed row without an icon by its label, not its first letter', () => {
    const { getByRole } = render(<ConsoleSidebar model={{ groups: [{ items: [
      { id: 'keys', label: 'Keys', to: '/keys' },
      { id: 'fleet', label: 'Fleet', to: '/fleet', value: '3' },
    ] }] }} collapsed />);
    expect(getByRole('link', { name: 'Keys' }).textContent).toBe('K');
    expect(getByRole('link', { name: 'Fleet 3' })).toBeTruthy();
  });

  it('names the collapsed brand button by what it does', () => {
    const { container } = render(<ConsoleSidebar model={model} collapsed expandOnBrandClick expandLabel="Open the sidebar" brandName="Lux" />);
    const brand = container.querySelector('.lu-cs-brand')!;
    expect(brand.tagName).toBe('BUTTON');
    expect(brand.getAttribute('aria-label')).toBe('Open the sidebar');
  });

  it('leaves expanded rows named by their content', () => {
    const { container } = render(<ConsoleSidebar model={model} />);
    expect(container.querySelector('.lu-cs-item[aria-label]')).toBeNull();
  });
});

describe('ConsoleSidebar search shortcut', () => {
  const press = (init: KeyboardEventInit) => {
    const event = new KeyboardEvent('keydown', { key: 'k', bubbles: true, cancelable: true, ...init });
    document.body.dispatchEvent(event);
  };
  const platform = (value: string) => vi.spyOn(navigator, 'platform', 'get').mockReturnValue(value);
  afterEach(() => vi.restoreAllMocks());

  it('leaves Ctrl-K to a field that already handled it', () => {
    platform('Win32');
    const onSearch = vi.fn();
    render(<><ConsoleSidebar model={model} search onSearch={onSearch} /><textarea aria-label="Editor" onKeyDown={event => event.preventDefault()} /></>);
    const editor = document.querySelector('textarea')!;
    editor.focus();
    fireEvent.keyDown(editor, { key: 'k', ctrlKey: true });
    expect(onSearch).not.toHaveBeenCalled();
    press({ ctrlKey: true });
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it('takes Cmd-K on a Mac and leaves it Ctrl-K, which edits text there', () => {
    platform('MacIntel');
    const onSearch = vi.fn();
    render(<ConsoleSidebar model={model} search onSearch={onSearch} />);
    press({ ctrlKey: true });
    expect(onSearch).not.toHaveBeenCalled();
    press({ metaKey: true });
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it('takes Ctrl-K elsewhere and shows it in the hint', () => {
    platform('Win32');
    const onSearch = vi.fn();
    const { container } = render(<ConsoleSidebar model={model} search onSearch={onSearch} />);
    expect(container.querySelector('.lu-cs-search-hint')!.textContent).toBe('Ctrl K');
    press({ metaKey: true });
    expect(onSearch).not.toHaveBeenCalled();
    press({ ctrlKey: true });
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it('shows the Command hint on a Mac and keeps a hint the host passes', () => {
    platform('MacIntel');
    const view = render(<ConsoleSidebar model={model} search />);
    expect(view.container.querySelector('.lu-cs-search-hint')!.textContent).toBe('⌘K');
    view.rerender(<ConsoleSidebar model={model} search searchHint="/" />);
    expect(view.container.querySelector('.lu-cs-search-hint')!.textContent).toBe('/');
  });
});
