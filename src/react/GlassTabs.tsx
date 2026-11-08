import { useRef, type KeyboardEvent } from 'react';
import type { TabItem } from '../glass/types';
import '../styles/components/glass-tabs.css';
import { cx } from './internal';

export interface GlassTabsProps {
  value: string;
  tabs: TabItem[];
  ariaLabel?: string;
  onChange?: (value: string) => void;
}

/** Tab navigation with automatic selection; the caller renders the active panel. */
export function GlassTabs({ value, tabs, ariaLabel, onChange }: GlassTabsProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  // One tab is the Tab stop: the selected one, or the first when `value`
  // matches none, so the strip stays reachable with the keyboard.
  const stop = Math.max(0, tabs.findIndex(tab => tab.value === value));

  function select(next: string) {
    if (next !== value) onChange?.(next);
  }
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else return;
    event.preventDefault();
    select(tabs[next].value);
    buttons.current[next]?.focus();
  }

  return <div className="lu-tabs" role="tablist" aria-label={ariaLabel}>
    {tabs.map((tab, index) => <button key={tab.value} ref={element => { buttons.current[index] = element; }}
      type="button" role="tab" className={cx('lu-tab', tab.value === value && 'is-active')}
      aria-selected={tab.value === value} tabIndex={index === stop ? 0 : -1}
      onClick={() => select(tab.value)} onKeyDown={event => onKey(event, index)}>
      {tab.label}
      {tab.value === value && <span className="lu-tab-ind lu-glass-thin" aria-hidden="true" />}
    </button>)}
  </div>;
}
