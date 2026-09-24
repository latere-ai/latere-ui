// The expandable tree, the compact head, foot rows and built-in icons of the
// React ConsoleSidebar. tests/console-sidebar-tree.test.ts holds the Vue twin.
import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConsoleIcon } from '../ConsoleIcon';
import { ConsoleSidebar } from '../ConsoleSidebar';
import type { ConsoleNavModel } from '../../console/nav';
import { installLocalStorage } from '../../../tests/local-storage';

const model: ConsoleNavModel = {
  groups: [{
    items: [
      { id: 'home', label: 'Home', to: '/', icon: 'home' },
      {
        id: 'storage', label: 'Storage', to: '/storage', icon: 'folder', children: [
          { id: 'storage:files', label: 'Files', to: '/storage/files' },
          { id: 'storage:trash', label: 'Trash', to: '/storage/trash' },
        ],
      },
      { id: 'admin', label: 'Admin', icon: 'shield', children: [{ id: 'admin:fleet', label: 'Fleet', to: '/admin/fleet' }] },
      { id: 'plain', label: 'Plain', to: '/plain' },
    ],
  }],
};

const parent = (c: HTMLElement, id: string) => c.querySelector<HTMLElement>(`.lu-cs-parent[data-nav-id="${id}"]`)!;
const row = (c: HTMLElement, id: string) => c.querySelector<HTMLElement>(`.lu-cs-item[data-nav-id="${id}"]`)!;

beforeEach(() => {
  installLocalStorage();
});

describe('ConsoleSidebar icons (react)', () => {
  it('renders a built-in icon for a known name and no slot for a row without one', () => {
    const { container } = render(<ConsoleSidebar model={model} />);
    expect(row(container, 'home').querySelector('.lu-cs-item-icon svg[data-icon="home"]')).not.toBeNull();
    expect(row(container, 'plain').querySelector('.lu-cs-item-icon')).toBeNull();
    expect(row(container, 'plain').firstElementChild?.className).toBe('lu-cs-item-label');
  });

  it('falls back to the first letter only in the collapsed rail', () => {
    const { container } = render(<ConsoleSidebar model={model} collapsed />);
    expect(row(container, 'plain').querySelector('.lu-cs-item-icon')?.textContent).toBe('P');
  });

  it('drops the slot when the host renderer returns nothing', () => {
    const { container } = render(<ConsoleSidebar model={model} renderIcon={({ item }) => (item.id === 'home' ? <i>h</i> : null)} />);
    expect(row(container, 'home').querySelector('.lu-cs-item-icon i')).not.toBeNull();
    expect(row(container, 'plain').querySelector('.lu-cs-item-icon')).toBeNull();
  });

  it('renders nothing for an unknown icon name', () => {
    const { container } = render(<ConsoleIcon name="nope" />);
    expect(container.innerHTML).toBe('');
    const known = render(<ConsoleIcon name="key" size={18} className="x" />).container.querySelector('svg')!;
    expect(known.getAttribute('width')).toBe('18');
    expect(known.getAttribute('stroke-width')).toBe('2');
    expect(known.getAttribute('class')).toBe('lu-ci x');
  });
});

describe('ConsoleSidebar children (react)', () => {
  it('folds a parent by default and names its group with aria-controls', () => {
    const { container } = render(<ConsoleSidebar model={model} />);
    const storage = parent(container, 'storage');
    expect(storage.tagName).toBe('BUTTON');
    expect(storage.getAttribute('aria-expanded')).toBe('false');
    const group = document.getElementById(storage.getAttribute('aria-controls')!)!;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.hidden).toBe(true);
    expect(group.querySelectorAll('.lu-cs-child')).toHaveLength(2);
  });

  it('toggles on click and remembers the choice for the viewer', () => {
    const { container, unmount } = render(<ConsoleSidebar model={model} openKey="k" />);
    fireEvent.click(parent(container, 'admin'));
    expect(parent(container, 'admin').getAttribute('aria-expanded')).toBe('true');
    expect(JSON.parse(localStorage.getItem('k')!)).toEqual({ admin: true });
    unmount();
    const again = render(<ConsoleSidebar model={model} openKey="k" />);
    expect(parent(again.container, 'admin').getAttribute('aria-expanded')).toBe('true');
  });

  it('opens the parent of the active page and marks the path', () => {
    const { container, rerender } = render(<ConsoleSidebar model={model} activeKey="storage:trash" openKey="k" />);
    const storage = parent(container, 'storage');
    expect(storage.getAttribute('aria-expanded')).toBe('true');
    expect(storage.dataset.path).toBe('true');
    expect(row(container, 'storage:trash').dataset.active).toBe('true');
    expect(row(container, 'storage:trash').getAttribute('aria-current')).toBe('page');
    expect(JSON.parse(localStorage.getItem('k')!)).toEqual({ storage: true });
    // Folding the current section stays folded until the page changes.
    fireEvent.click(storage);
    expect(storage.getAttribute('aria-expanded')).toBe('false');
    rerender(<ConsoleSidebar model={model} activeKey="storage:files" openKey="k" />);
    expect(parent(container, 'storage').getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps nothing in storage when openKey is null', () => {
    const { container } = render(<ConsoleSidebar model={model} openKey={null} />);
    fireEvent.click(parent(container, 'admin'));
    expect(localStorage.length).toBe(0);
  });

  it('moves and toggles with the arrow keys', () => {
    const { container } = render(<ConsoleSidebar model={model} />);
    row(container, 'home').focus();
    fireEvent.keyDown(row(container, 'home'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(parent(container, 'storage'));
    fireEvent.keyDown(parent(container, 'storage'), { key: 'ArrowRight' });
    expect(parent(container, 'storage').getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(parent(container, 'storage'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(row(container, 'storage:files'));
    fireEvent.keyDown(row(container, 'storage:files'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(row(container, 'storage:trash'));
    fireEvent.keyDown(row(container, 'storage:trash'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(parent(container, 'storage'));
    fireEvent.keyDown(parent(container, 'storage'), { key: 'ArrowLeft' });
    expect(parent(container, 'storage').getAttribute('aria-expanded')).toBe('false');
    // Folded children are skipped.
    fireEvent.keyDown(parent(container, 'storage'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(parent(container, 'admin'));
    fireEvent.keyDown(parent(container, 'admin'), { key: 'End' });
    expect(document.activeElement).toBe(row(container, 'plain'));
    fireEvent.keyDown(row(container, 'plain'), { key: 'Home' });
    expect(document.activeElement).toBe(row(container, 'home'));
    fireEvent.keyDown(row(container, 'home'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(row(container, 'home'));
    // A modified key is the browser's.
    fireEvent.keyDown(row(container, 'home'), { key: 'ArrowDown', metaKey: true });
    expect(document.activeElement).toBe(row(container, 'home'));
  });

  it('links a parent to its page in the collapsed rail and carries the selection', () => {
    const onNavigate = vi.fn();
    const { container } = render(<ConsoleSidebar model={model} collapsed activeKey="admin:fleet" onNavigate={onNavigate} />);
    expect(container.querySelector('.lu-cs-parent')).toBeNull();
    expect(container.querySelector('.lu-cs-children')).toBeNull();
    const admin = row(container, 'admin');
    expect(admin.tagName).toBe('A');
    expect(admin.getAttribute('href')).toBe('/admin/fleet');
    expect(admin.dataset.active).toBe('true');
    expect(admin.getAttribute('aria-current')).toBeNull();
    expect(admin.getAttribute('title')).toBe('Admin');
    expect(row(container, 'storage').getAttribute('href')).toBe('/storage');
    expect(row(container, 'storage').dataset.active).toBe('false');
    fireEvent.click(admin);
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'admin', to: '/admin/fleet' }));
  });

  it('passes child rows through renderItem', () => {
    const { container } = render(
      <ConsoleSidebar model={model} activeKey="storage:files" renderItem={({ item, active }) => <b data-id={item.id} data-on={String(active)}>{item.label}</b>} />,
    );
    expect(container.querySelector('b[data-id="storage:files"]')?.getAttribute('data-on')).toBe('true');
    expect(parent(container, 'storage')).not.toBeNull();
  });
});

describe('ConsoleSidebar compact head and foot rows (react)', () => {
  it('marks the rail compact and keeps one button in the collapsed head', () => {
    const logo = <svg data-logo="yes" />;
    const onChange = vi.fn();
    const { container, rerender } = render(<ConsoleSidebar model={model} compact brandName="Latere" brandSub="Console" logo={logo} collapsed={false} onCollapsedChange={onChange} />);
    const aside = container.querySelector('.lu-cs')!;
    expect(aside.getAttribute('data-compact')).toBe('true');
    expect(container.querySelector('.lu-cs-brand')).not.toBeNull();
    expect(container.querySelector('.lu-cs-fold-mark')).toBeNull();
    rerender(<ConsoleSidebar model={model} compact brandName="Latere" logo={logo} collapsed onCollapsedChange={onChange} />);
    const head = container.querySelector('.lu-cs-head')!;
    expect(head.children).toHaveLength(1);
    const fold = head.querySelector('.lu-cs-fold')!;
    expect(fold.querySelector('.lu-cs-fold-mark [data-logo="yes"]')).not.toBeNull();
    expect(fold.querySelector('.lu-cs-fold-glyph')).not.toBeNull();
    expect(fold.getAttribute('aria-label')).toBe('Expand sidebar');
    fireEvent.click(fold);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('leaves the default head without the compact marker', () => {
    const { container } = render(<ConsoleSidebar model={model} collapsed />);
    expect(container.querySelector('.lu-cs')!.hasAttribute('data-compact')).toBe(false);
    expect(container.querySelector('.lu-cs-brand')).not.toBeNull();
  });

  it('sets foot rows above the account control with a trailing value', () => {
    const onNavigate = vi.fn();
    const footItems = [
      { id: 'docs', label: 'Documentation', to: '/docs', icon: 'book' },
      { id: 'credits', label: 'Credits', to: '/billing', icon: 'coins', value: '$8.16' },
    ];
    const { container, rerender } = render(<ConsoleSidebar model={model} footItems={footItems} foot={<div className="acct" />} onNavigate={onNavigate} />);
    const foot = container.querySelector('.lu-cs-foot')!;
    expect(foot.firstElementChild?.className).toBe('lu-cs-foot-items');
    expect(foot.lastElementChild?.className).toBe('acct');
    const credits = row(container, 'credits');
    expect(credits.className).toBe('lu-cs-item lu-cs-foot-item');
    expect(credits.querySelector('.lu-cs-item-value')?.textContent).toBe('$8.16');
    fireEvent.click(credits);
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'credits' }));
    rerender(<ConsoleSidebar model={model} footItems={footItems} collapsed />);
    expect(row(container, 'credits').getAttribute('title')).toBe('Credits $8.16');
    expect(row(container, 'credits').querySelector('.lu-cs-item-value')).toBeNull();
  });

  it('keeps an empty foot empty', () => {
    const { container } = render(<ConsoleSidebar model={model} footItems={[]} />);
    expect(container.querySelector('.lu-cs-foot')!.innerHTML).toBe('');
  });
});
