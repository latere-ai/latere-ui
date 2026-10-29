// AccountMenu's avatar, in the trigger and in the open menu's header: the
// picture at `avatar_url` when it loads, the initials when there is no
// address or the image fails to load, and a fresh try for a new address.
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Principal } from '../../session/types';
import { AccountMenu } from '../AccountMenu';

const PICTURE = 'https://pictures.test/ada.png';

const base: Principal = {
  principal_id: 'p1',
  email: 'a@b.c',
  display_name: 'Ada Lovelace',
  initials: 'AL',
  avatar_url: PICTURE,
  org_id: '',
  orgs: [],
};

function triggerAvatar(container: HTMLElement) {
  return container.querySelector('.lu-am-avatar')!;
}

function headAvatar(container: HTMLElement) {
  return container.querySelector('.lu-am-head-avatar')!;
}

function openMenu(container: HTMLElement) {
  fireEvent.click(container.querySelector('.lu-am-trigger')!);
}

describe('AccountMenu avatar', () => {
  it('draws the picture in the trigger and the menu header when the principal has one', () => {
    const { container } = render(<AccountMenu principal={base} />);
    const trigger = triggerAvatar(container).querySelector('img');
    expect(trigger?.getAttribute('src')).toBe(PICTURE);
    expect(trigger?.getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(triggerAvatar(container).textContent).toBe('');

    openMenu(container);
    const head = headAvatar(container).querySelector('img');
    expect(head?.getAttribute('src')).toBe(PICTURE);
    expect(head?.getAttribute('referrerpolicy')).toBe('no-referrer');
  });

  it('draws the initials in both places after the trigger picture fails to load', () => {
    const { container } = render(<AccountMenu principal={base} />);
    fireEvent.error(triggerAvatar(container).querySelector('img')!);

    expect(triggerAvatar(container).querySelector('img')).toBeNull();
    expect(triggerAvatar(container).textContent).toBe('AL');

    openMenu(container);
    expect(headAvatar(container).querySelector('img')).toBeNull();
    expect(headAvatar(container).textContent).toBe('AL');
  });

  it('draws the initials in both places after the menu header picture fails to load', () => {
    const { container } = render(<AccountMenu principal={base} />);
    openMenu(container);
    fireEvent.error(headAvatar(container).querySelector('img')!);

    expect(headAvatar(container).querySelector('img')).toBeNull();
    expect(headAvatar(container).textContent).toBe('AL');
    expect(triggerAvatar(container).querySelector('img')).toBeNull();
    expect(triggerAvatar(container).textContent).toBe('AL');
  });

  it('tries a new picture address after an earlier one failed', () => {
    const { container, rerender } = render(<AccountMenu principal={base} />);
    fireEvent.error(triggerAvatar(container).querySelector('img')!);
    expect(triggerAvatar(container).textContent).toBe('AL');

    const next = 'https://pictures.test/ada-v2.png';
    rerender(<AccountMenu principal={{ ...base, avatar_url: next }} />);
    expect(triggerAvatar(container).querySelector('img')?.getAttribute('src')).toBe(next);
  });

  it('draws the initials in both places when the principal has no picture', () => {
    const { container } = render(<AccountMenu principal={{ ...base, avatar_url: '' }} />);
    expect(triggerAvatar(container).querySelector('img')).toBeNull();
    expect(triggerAvatar(container).textContent).toBe('AL');

    openMenu(container);
    expect(headAvatar(container).querySelector('img')).toBeNull();
    expect(headAvatar(container).textContent).toBe('AL');
  });
});
