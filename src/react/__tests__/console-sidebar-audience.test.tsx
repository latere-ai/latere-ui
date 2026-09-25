// Rows only admins are shown, and the bottom groups set in the foot, in the
// React ConsoleSidebar. tests/console-sidebar-audience.test.ts holds the Vue
// twin.
import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { ConsoleSidebar } from '../ConsoleSidebar';
import type { ConsoleNavModel, NavFootItem } from '../../console/nav';
import { installLocalStorage } from '../../../tests/local-storage';

const model: ConsoleNavModel = {
  groups: [
    { items: [{ id: 'home', label: 'Home', to: '/', icon: 'home' }, { id: 'keys', label: 'Keys', to: '/keys', icon: 'key' }] },
    {
      pin: 'bottom',
      items: [
        { id: 'org', label: 'Organization', to: '/org', icon: 'org', audience: 'admin', children: [{ id: 'org:members', label: 'Members', to: '/org/members' }] },
        { id: 'admin', label: 'Admin', to: '/admin', icon: 'shield', audience: 'admin', children: [{ id: 'admin:fleet', label: 'Fleet', to: '/admin/fleet' }] },
        { id: 'status', label: 'Status', to: '/status', audience: 'admin' },
      ],
    },
  ],
};
const footItems: NavFootItem[] = [
  { id: 'docs', label: 'Documentation', to: '/docs', icon: 'book' },
  { id: 'credits', label: 'Credits', to: '/billing', icon: 'coins', value: '$8.16' },
];
const row = (c: HTMLElement, id: string) => c.querySelector<HTMLElement>(`.lu-cs-item[data-nav-id="${id}"]`)!;

beforeEach(() => {
  installLocalStorage();
});

describe('ConsoleSidebar audience (react)', () => {
  it('marks an admin row and names the audience after the label', () => {
    const { container } = render(<ConsoleSidebar model={model} />);
    const org = row(container, 'org');
    expect(org.getAttribute('data-audience')).toBe('admin');
    expect([...org.children].map((c) => c.className)).toEqual(['lu-cs-item-icon', 'lu-cs-item-label', 'lu-cs-audience', 'lu-cs-item-chevron']);
    expect(org.querySelector('.lu-cs-audience')?.textContent).toBe('Admin');
    expect(row(container, 'status').querySelector('.lu-cs-audience')?.textContent).toBe('Admin');
    expect(row(container, 'home').hasAttribute('data-audience')).toBe(false);
    expect(row(container, 'home').querySelector('.lu-cs-audience')).toBeNull();
  });

  it('leaves the chip off a row whose label already names the audience', () => {
    const { container } = render(<ConsoleSidebar model={model} />);
    expect(row(container, 'admin').getAttribute('data-audience')).toBe('admin');
    expect(row(container, 'admin').querySelector('.lu-cs-audience')).toBeNull();
  });

  it('takes a localized audience label', () => {
    const { container } = render(<ConsoleSidebar model={model} audienceLabel="Verwaltung" />);
    expect(row(container, 'org').querySelector('.lu-cs-audience')?.textContent).toBe('Verwaltung');
    expect(row(container, 'admin').querySelector('.lu-cs-audience')?.textContent).toBe('Verwaltung');
  });

  it('drops the chip in the collapsed rail and names the audience in the tooltip', () => {
    const { container } = render(<ConsoleSidebar model={model} collapsed />);
    expect(container.querySelector('.lu-cs-audience')).toBeNull();
    expect(row(container, 'org').getAttribute('data-audience')).toBe('admin');
    expect(row(container, 'org').getAttribute('title')).toBe('Organization · Admin');
    expect(row(container, 'admin').getAttribute('title')).toBe('Admin');
  });
});

describe('ConsoleSidebar bottom groups (react)', () => {
  it('ends the nav with the bottom groups by default', () => {
    const { container } = render(<ConsoleSidebar model={model} footItems={footItems} />);
    expect(container.querySelector('.lu-cs-nav .lu-cs-group-pinned [data-nav-id="org"]')).not.toBeNull();
    expect(container.querySelector('.lu-cs-foot-nav')).toBeNull();
    expect(container.querySelector('.lu-cs-foot')!.className).toBe('lu-cs-foot');
  });

  it('sets the bottom groups in the foot with the foot rows, above the account control', () => {
    const { container } = render(<ConsoleSidebar model={model} footItems={footItems} bottomGroups="foot" foot={<div className="acct" />} />);
    expect(container.querySelector('.lu-cs-nav [data-nav-id="org"]')).toBeNull();
    expect(container.querySelector('.lu-cs-group-pinned')).toBeNull();
    const foot = container.querySelector('.lu-cs-foot')!;
    expect(foot.className).toBe('lu-cs-foot lu-cs-foot-has-nav');
    expect([...foot.children].map((c) => c.className)).toEqual(['lu-cs-foot-nav', 'acct']);
    const ids = [...foot.querySelectorAll('.lu-cs-foot-nav .lu-cs-item')].map((el) => el.getAttribute('data-nav-id'));
    expect(ids).toEqual(['org', 'org:members', 'admin', 'admin:fleet', 'status', 'docs', 'credits']);
  });

  it('opens a parent in the foot and moves through the foot rows with the arrow keys', () => {
    const { container } = render(<ConsoleSidebar model={model} footItems={footItems} bottomGroups="foot" openKey={null} />);
    const admin = row(container, 'admin');
    expect(admin.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(admin);
    expect(admin.getAttribute('aria-expanded')).toBe('true');
    admin.focus();
    fireEvent.keyDown(admin, { key: 'ArrowDown' });
    expect(document.activeElement?.getAttribute('data-nav-id')).toBe('admin:fleet');
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(document.activeElement?.getAttribute('data-nav-id')).toBe('credits');
  });

  it('keeps the foot as before when nothing is pinned to the bottom', () => {
    const { container } = render(<ConsoleSidebar model={{ groups: [model.groups[0]] }} footItems={[]} bottomGroups="foot" />);
    expect(container.querySelector('.lu-cs-foot')!.innerHTML).toBe('');
    expect(container.querySelector('.lu-cs-foot')!.className).toBe('lu-cs-foot');
  });

  it('stacks the foot groups as icons in the collapsed rail', () => {
    const { container } = render(<ConsoleSidebar model={model} footItems={footItems} bottomGroups="foot" collapsed />);
    expect(container.querySelector('.lu-cs-foot-nav .lu-cs-children')).toBeNull();
    expect(row(container, 'admin').getAttribute('href')).toBe('/admin');
    expect(row(container, 'org').querySelector('.lu-cs-item-icon svg[data-icon="org"]')).not.toBeNull();
  });
});
