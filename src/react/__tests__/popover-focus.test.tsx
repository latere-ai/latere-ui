import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { mount } from '@vue/test-utils';
import VuePopover from '../../components/GlassPopover.vue';
import { GlassPopover } from '../GlassPopover';

afterEach(cleanup);

it('React popover restores its opener after Escape inside the panel, without stealing outside-click focus', () => {
  const view = render(<><GlassPopover trigger={<button>Open</button>}><button>Action</button></GlassPopover><button>Outside</button></>);
  const opener = view.getByText('Open');
  fireEvent.click(opener);
  view.getByText('Action').focus();
  fireEvent.keyDown(view.getByText('Action'), { key: 'Escape' });
  expect(view.queryByText('Action')).toBeNull();
  expect(document.activeElement).toBe(opener);
  fireEvent.click(opener);
  view.getByText('Action').focus();
  const restored = vi.spyOn(opener, 'focus');
  fireEvent.mouseDown(view.getByText('Outside'));
  expect(restored).not.toHaveBeenCalled();
  expect(view.queryByText('Action')).toBeNull();
  view.getByText('Outside').focus();
  expect(document.activeElement).toBe(view.getByText('Outside'));
});

it('Vue popover restores its opener after Escape inside the panel, without stealing outside-click focus', async () => {
  const view = mount(VuePopover, { attachTo: document.body, slots: { trigger: '<button>Open</button>', default: '<button>Action</button>' } });
  const outside = document.createElement('button'); document.body.append(outside);
  try {
    const opener = view.get('.lu-pop-trigger button');
    await opener.trigger('click');
    (view.get('.lu-pop-panel button').element as HTMLElement).focus();
    await view.get('.lu-pop-panel button').trigger('keydown', { key: 'Escape' });
    expect(view.find('.lu-pop-panel').exists()).toBe(false);
    expect(document.activeElement).toBe(opener.element);
    await opener.trigger('click');
    (view.get('.lu-pop-panel button').element as HTMLElement).focus();
    const restored = vi.spyOn(opener.element as HTMLElement, 'focus');
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(restored).not.toHaveBeenCalled();
    outside.focus();
    expect(document.activeElement).toBe(outside);
  } finally { view.unmount(); outside.remove(); }
});
