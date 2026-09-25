// React adapter of GlassMenu.vue: the same markup, roving focus and
// choice-menu semantics. See the SFC for the interaction contract.
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { MenuItem } from '../glass/types';
import { initialOption, nextEnabledOption } from '../glass/selectNavigation';
import { CHECK_ICON } from '../components/preferenceMenus';
import { cx } from './internal';
import '../styles/components/glass-menu.css';

export interface GlassMenuProps {
  items: MenuItem[];
  /** Accessible name of the menu, e.g. "Theme". */
  label?: string;
  /** Move focus to the checked (or first enabled) item on mount, as a menu opened from a button does. */
  autofocus?: boolean;
  onSelect?: (value: string) => void;
}

export function GlassMenu({ items, label, autofocus = false, onSelect }: GlassMenuProps) {
  const checkable = items.some(item => item.checked !== undefined);
  const checkedValue = items.find(item => item.checked)?.value ?? '';
  const [active, setActive] = useState(() => initialOption(items, checkedValue));
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = items[active] && !items[active].disabled ? active : initialOption(items, checkedValue);

  function focusItem(index: number) {
    if (index < 0) return;
    setActive(index);
    buttons.current[index]?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (autofocus) focusItem(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the menu takes focus once, when it opens.
  }, []);

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    const n = items.length;
    if (!n) return;
    let next = -1;
    if (event.key === 'ArrowDown') next = nextEnabledOption(items, current, 1);
    else if (event.key === 'ArrowUp') next = nextEnabledOption(items, current, -1);
    else if (event.key === 'Home') next = nextEnabledOption(items, -1, 1);
    else if (event.key === 'End') next = nextEnabledOption(items, n, -1);
    else return;
    event.preventDefault();
    focusItem(next);
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (event.pointerType === 'touch' || items[index].disabled || current === index && document.activeElement === buttons.current[index]) return;
    focusItem(index);
  }

  return (
    <div className={cx('lu-menu', checkable && 'lu-menu--checkable')} role="menu" aria-label={label} onKeyDown={onKey}>
      {items.map((item, index) => (
        <button
          key={item.value}
          ref={element => { buttons.current[index] = element; }}
          type="button"
          role={checkable ? 'menuitemradio' : 'menuitem'}
          aria-checked={checkable ? !!item.checked : undefined}
          tabIndex={index === current ? 0 : -1}
          className={cx('lu-menu-item', item.danger && 'is-danger', item.checked && 'is-checked')}
          disabled={item.disabled}
          onClick={() => { if (!item.disabled) onSelect?.(item.value); }}
          onPointerMove={event => onPointerMove(event, index)}
        >
          {checkable && <span className="lu-menu-check" aria-hidden="true" dangerouslySetInnerHTML={{ __html: item.checked ? CHECK_ICON : '' }} />}
          {item.label}
        </button>
      ))}
    </div>
  );
}
