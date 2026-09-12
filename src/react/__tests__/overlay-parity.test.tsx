import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, cleanup } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import VueToaster from '../../components/GlassToaster.vue';
import VueConfirmHost from '../../components/GlassConfirmHost.vue';
import { message as vueMessage } from '../../glass/message';
import { confirm as vueConfirm } from '../../glass/confirm';
import { confirmStore } from '../../glass/confirmCore';
import { GlassPopover, GlassTooltip, GlassMenu, GlassDrawer, GlassToaster, GlassConfirmHost, message, confirm, resolveConfirm } from '../overlays';

afterEach(() => {
  cleanup();
  message.clear();
  while (confirmStore.getSnapshot().current) resolveConfirm(false);
});

describe('React anchored overlays', () => {
  it.each(['bottom-start', 'bottom-end', 'top-start', 'top-end'] as const)('renders %s placement, trigger scope and child close callback', placement => {
    const onSelect = vi.fn();
    const w = render(<GlassPopover placement={placement} matchWidth trigger={({ open }) => <button>{open ? 'Opened' : 'Open'}</button>}>
      {({ close }) => <GlassMenu items={[{ value: 'copy', label: 'Copy' }, { value: 'none', label: 'Unavailable', disabled: true }, { value: 'delete', label: 'Delete', danger: true }]} onSelect={value => { onSelect(value); close(); }} />}
    </GlassPopover>);
    expect(w.container.querySelector('.lu-pop-panel')).toBeNull();
    fireEvent.click(w.getByText('Open'));
    expect(w.getByText('Opened')).toBeTruthy();
    expect(w.container.querySelector('.lu-pop-panel')?.className).toBe(`lu-pop-panel lu-glass-thick lu-pop-panel--${placement} lu-pop-panel--match`);
    fireEvent.click(w.getByText('Unavailable'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(w.getByRole('menuitem', { name: 'Delete' }).className).toContain('is-danger');
    fireEvent.click(w.getByText('Copy'));
    expect(onSelect).toHaveBeenCalledWith('copy');
    expect(w.container.querySelector('.lu-pop-panel')).toBeNull();
  });

  it('closes on outside mouse and Escape, ignores inside mouse, and supports controlled visibility', () => {
    const changed = vi.fn(); const close = vi.fn();
    const w = render(<GlassPopover open onOpenChange={changed} onClose={close} trigger={<button>Open</button>}><button>Inside</button></GlassPopover>);
    fireEvent.mouseDown(w.getByText('Inside'));
    expect(close).not.toHaveBeenCalled();
    fireEvent.mouseDown(document.body);
    expect(changed).toHaveBeenLastCalledWith(false);
    expect(close).toHaveBeenCalledOnce();
    expect(w.getByText('Inside')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(2);
    w.rerender(<GlassPopover open={false} onClose={close} trigger={<button>Open</button>}>Inside</GlassPopover>);
    expect(w.container.querySelector('.lu-pop-panel')).toBeNull();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(2);
  });

  it('toggles an uncontrolled popover from its trigger', () => {
    const w = render(<GlassPopover trigger={<button>Toggle</button>}>Panel</GlassPopover>);
    fireEvent.click(w.getByText('Toggle'));
    expect(w.getByText('Panel')).toBeTruthy();
    fireEvent.click(w.getByText('Toggle'));
    expect(w.queryByText('Panel')).toBeNull();
  });

  it.each(['top', 'bottom'] as const)('keeps tooltip %s markup identical to Vue', placement => {
    const w = render(<GlassTooltip text="Description" placement={placement}><button>Trigger</button></GlassTooltip>);
    expect(w.getByRole('tooltip').className).toBe(`lu-tip lu-glass-smoke lu-tip--${placement}`);
    expect(w.getByRole('tooltip').textContent).toBe('Description');
    expect(w.container.firstElementChild?.className).toBe('lu-tip-wrap');
  });

  it('renders default tooltip and optional menu callback safely', () => {
    const w = render(<><GlassTooltip text="Tip">Trigger</GlassTooltip><GlassMenu items={[{ value: 'x', label: 'Action' }]} /></>);
    expect(w.getByRole('tooltip').className).toContain('lu-tip--top');
    fireEvent.click(w.getByText('Action'));
  });
});

describe('React drawer', () => {
  it.each(['left', 'right'] as const)('portals a labeled %s panel with custom width, closes on scrim/Escape and restores focus', side => {
    const opener = document.createElement('button'); document.body.append(opener); opener.focus();
    const close = vi.fn();
    const w = render(<GlassDrawer open title="Details" side={side} width="24rem" onClose={close}><button>Action</button></GlassDrawer>);
    const dialog = w.getByRole('dialog');
    expect(dialog.className).toBe(`lu-drawer lu-glass-thick lu-drawer--${side}`);
    expect(dialog.style.width).toBe('24rem');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toBe('Details');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    fireEvent.click(dialog);
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(dialog.parentElement!);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(2);
    w.rerender(<GlassDrawer open={false}>Closed</GlassDrawer>);
    expect(w.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('supports custom headers, default geometry and inert scrim', () => {
    const close = vi.fn();
    const w = render(<GlassDrawer open header={<b>Custom</b>} closeOnScrim={false} onClose={close}>Content</GlassDrawer>);
    const dialog = w.getByRole('dialog');
    expect(dialog.style.width).toBe('20rem');
    expect(dialog.className).toContain('lu-drawer--right');
    expect(dialog.hasAttribute('aria-labelledby')).toBe(false);
    expect(w.getByText('Custom').parentElement?.className).toBe('lu-drawer-head');
    fireEvent.click(dialog.parentElement!);
    expect(close).not.toHaveBeenCalled();
    w.rerender(<GlassDrawer open>Content</GlassDrawer>);
    expect(dialog.querySelector('.lu-drawer-head')).toBeNull();
    fireEvent.click(dialog.parentElement!);
  });

  it('renders no portal during server rendering', () => {
    vi.stubGlobal('document', undefined);
    try {
      expect(renderToString(<GlassDrawer open title="SSR">Body</GlassDrawer>)).toBe('');
      expect(renderToString(<GlassToaster />)).toBe('');
      expect(renderToString(<GlassConfirmHost />)).toBe('');
    } finally { vi.unstubAllGlobals(); }
  });
});

describe('shared imperative hosts', () => {
  it('React toaster responds to Vue service calls, roles, colors and click dismissal', () => {
    const w = render(<GlassToaster />);
    act(() => {
      vueMessage.info('Info', { duration: 0 });
      vueMessage.success('Success', { duration: 0 });
      vueMessage.warning('Warning', { duration: 0 });
      vueMessage.error('Error', { duration: 0 });
    });
    expect(w.getByRole('region').getAttribute('aria-live')).toBe('polite');
    expect(w.getAllByRole('status')).toHaveLength(3);
    expect(w.getByRole('alert').textContent).toBe('Error');
    expect(w.getByRole('alert').getAttribute('style')).toContain('--state-error');
    fireEvent.click(w.getByText('Info'));
    expect(w.queryByText('Info')).toBeNull();
    act(() => message.clear());
    expect(w.queryByRole('alert')).toBeNull();
  });

  it('React calls render in Vue toaster and Vue confirm host', async () => {
    const toaster = mount(VueToaster, { attachTo: document.body });
    message.success('Cross framework', { duration: 0 });
    await nextTick();
    expect(document.querySelector('.lu-toast-text')?.textContent).toBe('Cross framework');
    toaster.unmount();
    const host = mount(VueConfirmHost, { attachTo: document.body });
    const pending = confirm({ message: 'Vue request', confirmText: 'Proceed' });
    await nextTick();
    await nextTick();
    (Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Proceed')!).click();
    await expect(pending).resolves.toBe(true);
    host.unmount();
  });

  it('React confirm host consumes Vue queue, custom labels, danger, cancel and Escape', async () => {
    const w = render(<GlassConfirmHost />);
    let first!: Promise<boolean>; let second!: Promise<boolean>;
    act(() => {
      first = vueConfirm({ title: 'Delete?', message: 'First request', danger: true, confirmText: 'Delete', cancelText: 'Keep' });
      second = confirm({ message: 'Second request' });
    });
    expect(w.getByRole('dialog').parentElement?.className).toContain('lu-modal-scrim--confirm');
    expect(w.getByRole('dialog').style.maxWidth).toBe('26rem');
    expect(w.getByRole('button', { name: 'Delete' }).className).toContain('lu-btn-danger');
    fireEvent.click(w.getByRole('dialog').parentElement!);
    expect(w.getByText('First request')).toBeTruthy();
    fireEvent.click(w.getByText('Delete'));
    await expect(first).resolves.toBe(true);
    expect(w.getByText('Second request')).toBeTruthy();
    fireEvent.click(w.getByText('Cancel'));
    await expect(second).resolves.toBe(false);
    let third!: Promise<boolean>;
    act(() => { third = confirm({ message: 'Escape request' }); });
    fireEvent.keyDown(document, { key: 'Escape' });
    await expect(third).resolves.toBe(false);
    expect(w.queryByRole('dialog')).toBeNull();
  });
});
