import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { GlassSelect } from '../GlassSelect';
import { GlassPopover } from '../GlassPopover';
import { GlassModal } from '../GlassModal';
import { GlassField } from '../GlassField';
import { GlassMenu } from '../GlassMenu';
import { anchorInView, scrollIntoList } from '../useAnchoredLayer';

// The layout the browser would compute, written per element: the select's
// and the popover's root (the control), the open panel and any clipping
// container. happy-dom has no layout of its own.
type Box = { top: number; left: number; width: number; height: number };
const boxes = new Map<string, Box>();
const rect = ({ top, left, width, height }: Box) => ({ top, left, width, height, bottom: top + height, right: left + width, x: left, y: top }) as DOMRect;
const zero = rect({ top: 0, left: 0, width: 0, height: 0 });

beforeEach(() => {
  boxes.clear();
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000);
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(800);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    for (const [selector, box] of boxes) if (this.matches(selector)) return rect(box);
    return zero;
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const roles = [{ value: 'member', label: 'Member' }, { value: 'admin', label: 'Admin' }];
const panelOf = (selector: string) => document.querySelector<HTMLElement>(selector)!;

describe('GlassSelect in the top layer', () => {
  it('raises the open menu into the top layer and places it under the select', () => {
    const shown: Element[] = [];
    Object.defineProperty(HTMLElement.prototype, 'showPopover', { configurable: true, value: function (this: HTMLElement) { shown.push(this); } });
    try {
      boxes.set('.lu-select', { top: 100, left: 40, width: 200, height: 32 });
      boxes.set('.lu-select-list', { top: 0, left: 0, width: 200, height: 82 });
      const w = render(<GlassSelect value="member" options={roles} ariaLabel="Role" />);
      fireEvent.click(w.getByRole('combobox'));
      const panel = panelOf('.lu-select-list');
      expect(shown).toEqual([panel]);
      expect(panel.getAttribute('popover')).toBe('manual');
      expect(panel.hasAttribute('data-lu-layer')).toBe(true);
      expect([panel.style.top, panel.style.left, panel.style.right, panel.style.bottom]).toEqual(['136px', '40px', 'auto', 'auto']);
      expect(panel.style.getPropertyValue('--lu-anchor-width')).toBe('200px');
      expect(panel.style.getPropertyValue('--lu-layer-max-height')).toBe(`${800 - 16 - 136}px`);
    } finally { delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover; }
  });

  it('draws the menu in place when the browser refuses to show it', () => {
    Object.defineProperty(HTMLElement.prototype, 'showPopover', { configurable: true, value: () => { throw new DOMException('refused', 'InvalidStateError'); } });
    try {
      boxes.set('.lu-select', { top: 100, left: 40, width: 200, height: 32 });
      const w = render(<GlassSelect value="member" options={roles} ariaLabel="Role" />);
      fireEvent.click(w.getByRole('combobox'));
      expect(panelOf('.lu-select-list').hasAttribute('popover')).toBe(false);
      expect(w.getByRole('listbox')).toBeTruthy();
    } finally { delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover; }
  });

  it('opens above a select near the bottom of the viewport', () => {
    // 136px under the select, 640 above it: the 200px menu flips up.
    boxes.set('.lu-select', { top: 660, left: 40, width: 200, height: 32 });
    boxes.set('.lu-select-list', { top: 0, left: 0, width: 200, height: 200 });
    const w = render(<GlassSelect value="member" options={roles} ariaLabel="Role" />);
    fireEvent.click(w.getByRole('combobox'));
    const panel = panelOf('.lu-select-list');
    expect(panel.style.top).toBe(`${660 - 4 - 200}px`);
    expect(panel.style.getPropertyValue('--lu-layer-max-height')).toBe(`${660 - 4 - 16}px`);
  });

  it('follows the select when a container scrolls, but not when the menu itself scrolls', () => {
    boxes.set('.lu-select', { top: 100, left: 40, width: 200, height: 32 });
    const w = render(<div className="scroller"><GlassSelect value="member" options={roles} ariaLabel="Role" /></div>);
    fireEvent.click(w.getByRole('combobox'));
    const panel = panelOf('.lu-select-list');
    expect(panel.style.top).toBe('136px');
    boxes.set('.lu-select', { top: 60, left: 40, width: 200, height: 32 });
    fireEvent.scroll(panel);
    expect(panel.style.top).toBe('136px');
    fireEvent.scroll(w.container.querySelector('.scroller')!);
    expect(panel.style.top).toBe('96px');
    fireEvent.scroll(document);
    expect(panel.style.top).toBe('96px');
    boxes.set('.lu-select', { top: 20, left: 40, width: 200, height: 32 });
    fireEvent(window, new Event('resize'));
    expect(panel.style.top).toBe('56px');
  });

  it('places the menu again on the next frame after the menu or the select changes size', () => {
    let observed: ResizeObserverCallback = () => undefined;
    const targets: Element[] = [];
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) { observed = callback; }
      observe(target: Element) { targets.push(target); }
      disconnect() { targets.length = 0; }
    });
    let frame: FrameRequestCallback | undefined;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frame = callback; return 7; });
    const cancel = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancel);
    try {
      boxes.set('.lu-select', { top: 100, left: 40, width: 200, height: 32 });
      const w = render(<GlassSelect value="member" options={roles} ariaLabel="Role" />);
      fireEvent.click(w.getByRole('combobox'));
      const panel = panelOf('.lu-select-list');
      expect(targets).toEqual([panel, w.container.querySelector('.lu-select')]);
      boxes.set('.lu-select', { top: 200, left: 40, width: 200, height: 32 });
      observed([], {} as ResizeObserver);
      const first = frame;
      observed([], {} as ResizeObserver);
      expect(frame).toBe(first);
      expect(panel.style.top).toBe('136px');
      act(() => frame!(0));
      expect(panel.style.top).toBe('236px');
      observed([], {} as ResizeObserver);
      w.unmount();
      expect(cancel).toHaveBeenCalledWith(7);
      expect(targets).toEqual([]);
    } finally { vi.unstubAllGlobals(); }
  });

  it('places the menu again when a transform around the select stops moving it', () => {
    boxes.set('.lu-select', { top: 100, left: 40, width: 200, height: 32 });
    const w = render(<div className="mover"><GlassSelect value="member" options={roles} ariaLabel="Role" /></div>);
    fireEvent.click(w.getByRole('combobox'));
    const panel = panelOf('.lu-select-list');
    boxes.set('.lu-select', { top: 108, left: 40, width: 200, height: 32 });
    const elsewhere = document.createElement('div');
    document.body.append(elsewhere);
    try {
      elsewhere.dispatchEvent(new Event('transitionend', { bubbles: true }));
      expect(panel.style.top).toBe('136px');
      w.container.querySelector('.mover')!.dispatchEvent(new Event('transitionend', { bubbles: true }));
      expect(panel.style.top).toBe('144px');
      boxes.set('.lu-select', { top: 100, left: 40, width: 200, height: 32 });
      w.container.querySelector('.mover')!.dispatchEvent(new Event('animationend', { bubbles: true }));
      expect(panel.style.top).toBe('136px');
    } finally { elsewhere.remove(); }
  });

  it('closes when its select scrolls out of the container that clips it', () => {
    boxes.set('.clip', { top: 200, left: 0, width: 600, height: 300 });
    boxes.set('.lu-select', { top: 400, left: 40, width: 200, height: 32 });
    const w = render(<div className="clip" style={{ overflowY: 'auto' }}><div><GlassSelect value="member" options={roles} ariaLabel="Role" /></div></div>);
    fireEvent.click(w.getByRole('combobox'));
    expect(w.queryByRole('listbox')).not.toBeNull();
    boxes.set('.lu-select', { top: 150, left: 40, width: 200, height: 32 });
    fireEvent.scroll(w.container.querySelector('.clip')!);
    expect(w.queryByRole('listbox')).toBeNull();
  });

  it('keeps the menu open and the dialog open when Escape comes from elsewhere in the dialog', () => {
    const onClose = vi.fn();
    function Dialog() {
      const [role, setRole] = useState('member');
      return <GlassModal open title="Create a service account" onClose={onClose}>
        <GlassField label="Name" value="" />
        <GlassSelect value={role} options={roles} ariaLabel="Role" onChange={setRole} />
      </GlassModal>;
    }
    const w = render(<Dialog />);
    // A pointer press opens the menu; Safari leaves the focus where it was.
    fireEvent.click(w.getByRole('combobox', { name: 'Role' }));
    const name = w.getByRole('textbox', { name: 'Name' });
    name.focus();
    act(() => { name.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); });
    expect(w.queryByRole('listbox')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    act(() => { name.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('GlassPopover in the top layer', () => {
  const items = [{ value: 'rename', label: 'Rename' }, { value: 'delete', label: 'Delete', danger: true }];

  it('flips a bottom panel above a trigger near the bottom and names the side it took', () => {
    boxes.set('.lu-pop', { top: 700, left: 100, width: 120, height: 32 });
    boxes.set('.lu-pop-panel', { top: 0, left: 0, width: 180, height: 120 });
    const w = render(<GlassPopover placement="bottom-end" trigger={<button type="button">Open</button>}><GlassMenu items={items} /></GlassPopover>);
    fireEvent.click(w.getByRole('button', { name: 'Open' }));
    const panel = panelOf('.lu-pop-panel');
    expect(panel.getAttribute('popover')).toBe('manual');
    expect(panel.classList.contains('lu-pop-panel--top-end')).toBe(true);
    expect(panel.style.top).toBe(`${700 - 6 - 120}px`);
    expect(panel.style.left).toBe(`${220 - 180}px`);
    expect(panel.hasAttribute('data-lu-scroll')).toBe(false);
  });

  it('scrolls a panel taller than the room on either side', () => {
    boxes.set('.lu-pop', { top: 300, left: 100, width: 120, height: 32 });
    boxes.set('.lu-pop-panel', { top: 0, left: 0, width: 180, height: 700 });
    const w = render(<GlassPopover matchWidth trigger={<button type="button">Open</button>}><GlassMenu items={items} /></GlassPopover>);
    fireEvent.click(w.getByRole('button', { name: 'Open' }));
    const panel = panelOf('.lu-pop-panel');
    expect(panel.classList.contains('lu-pop-panel--bottom-start')).toBe(true);
    expect(panel.hasAttribute('data-lu-scroll')).toBe(true);
    expect(panel.style.getPropertyValue('--lu-layer-max-height')).toBe(`${800 - 8 - 338}px`);
    expect(panel.style.getPropertyValue('--lu-anchor-width')).toBe('120px');
  });

  it('keeps the preferred side for a trigger without a box', () => {
    const w = render(<GlassPopover placement="top-start" trigger={<button type="button">Open</button>}><GlassMenu items={items} /></GlassPopover>);
    fireEvent.click(w.getByRole('button', { name: 'Open' }));
    const panel = panelOf('.lu-pop-panel');
    expect(panel.classList.contains('lu-pop-panel--top-start')).toBe(true);
    expect(panel.style.top).toBe('');
  });

  it('closes on Escape inside a dialog and leaves the dialog open', () => {
    const onClose = vi.fn();
    const w = render(<GlassModal open title="Members" onClose={onClose}>
      <GlassPopover trigger={<button type="button">Actions</button>}><GlassMenu items={items} autofocus /></GlassPopover>
    </GlassModal>);
    const trigger = w.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    const item = w.getByRole('menuitem', { name: 'Rename' });
    expect(document.activeElement).toBe(item);
    act(() => { item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); });
    expect(w.queryByRole('menu')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes when its trigger scrolls out of sight', () => {
    boxes.set('.lu-pop', { top: 300, left: 100, width: 120, height: 32 });
    const onClose = vi.fn();
    const w = render(<GlassPopover onClose={onClose} trigger={<button type="button">Open</button>}><GlassMenu items={items} /></GlassPopover>);
    fireEvent.click(w.getByRole('button', { name: 'Open' }));
    boxes.set('.lu-pop', { top: -60, left: 100, width: 120, height: 32 });
    fireEvent.scroll(document);
    expect(w.queryByRole('menu')).toBeNull();
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('anchorInView', () => {
  it('reads the viewport and every clipping ancestor', () => {
    const outer = document.createElement('div');
    outer.className = 'outer';
    outer.style.overflowX = 'hidden';
    outer.style.overflowY = 'hidden';
    const plain = document.createElement('div');
    const control = document.createElement('button');
    control.className = 'control';
    plain.append(control);
    outer.append(plain);
    document.body.append(outer);
    try {
      boxes.set('.outer', { top: 100, left: 100, width: 400, height: 200 });
      boxes.set('.control', { top: 150, left: 150, width: 80, height: 32 });
      expect(anchorInView(control)).toBe(true);
      boxes.set('.control', { top: 320, left: 150, width: 80, height: 32 });
      expect(anchorInView(control)).toBe(false);
      boxes.set('.control', { top: 150, left: 520, width: 80, height: 32 });
      expect(anchorInView(control)).toBe(false);
      outer.style.overflowX = 'visible';
      outer.style.overflowY = 'visible';
      expect(anchorInView(control)).toBe(true);
      boxes.set('.control', { top: 820, left: 150, width: 80, height: 32 });
      expect(anchorInView(control)).toBe(false);
      boxes.delete('.control');
      expect(anchorInView(control)).toBe(true);
    } finally { outer.remove(); }
  });
});

describe('scrollIntoList', () => {
  it('scrolls only as far as the row needs, and ignores a missing list or row', () => {
    const list = document.createElement('ul');
    list.className = 'list';
    const row = document.createElement('li');
    row.className = 'row';
    list.append(row);
    document.body.append(list);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(100);
    try {
      boxes.set('.list', { top: 0, left: 0, width: 100, height: 100 });
      boxes.set('.row', { top: 40, left: 0, width: 100, height: 20 });
      scrollIntoList(list, row);
      expect(list.scrollTop).toBe(0);
      boxes.set('.row', { top: 110, left: 0, width: 100, height: 20 });
      scrollIntoList(list, row);
      expect(list.scrollTop).toBe(30);
      boxes.set('.row', { top: -10, left: 0, width: 100, height: 20 });
      scrollIntoList(list, row);
      expect(list.scrollTop).toBe(20);
      scrollIntoList(null, row);
      scrollIntoList(list, null);
      expect(list.scrollTop).toBe(20);
    } finally { list.remove(); }
  });
});
