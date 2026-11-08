import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import type { ConsoleNavModel, NavItem } from '../console/nav';
import { consoleIcon } from '../console/icons';
import { filterPalette, paletteEntries, type ConsolePaletteItem, type ConsolePaletteSearch } from '../console/palette';
import { ConsoleIcon } from './ConsoleIcon';
import { isComposingKey } from '../glass/composition';
import { useFocusTrap } from './internal';
import '../styles/components/console-palette.css';

export interface ConsolePaletteProps {
  open: boolean;
  model: ConsoleNavModel;
  placeholder?: string;
  emptyLabel?: string;
  onClose?: () => void;
  /** Called with the chosen row: a nav row, a host entry or a search result. */
  onNavigate?: (item: NavItem) => void;
  /** Host entries after the nav rows: actions and other destinations. */
  items?: ConsolePaletteItem[];
  /** Extra rows for a non-empty query, such as documentation pages. */
  search?: ConsolePaletteSearch;
}

export function ConsolePalette({ open, model, placeholder = 'Jump to…', emptyLabel = 'No matches', onClose, onNavigate, items: extra, search }: ConsolePaletteProps) {
  const [query, setQuery] = useState('');
  // The highlighted row is held by id, so a host that re-renders with an
  // equal list keeps the reader's row; a row that left the results, or a new
  // query, falls back to the first.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const items = useMemo(() => paletteEntries(model.groups, extra), [model.groups, extra]);
  const results = useMemo(() => filterPalette(items, query, search), [items, query, search]);
  const selected = Math.max(0, results.findIndex(item => item.id === selectedId));
  useFocusTrap(open, panel, onClose);
  useEffect(() => { if (open) { setQuery(''); setSelectedId(null); } }, [open]);
  useEffect(() => {
    if (open) panel.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, results, selected]);
  function choose(item: NavItem) { onNavigate?.(item); onClose?.(); }
  function onKeydown(event: KeyboardEvent<HTMLInputElement>) {
    if (isComposingKey(event.nativeEvent)) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault(); setSelectedId(results[Math.min(selected + 1, results.length - 1)]?.id ?? null);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault(); setSelectedId(results[Math.max(0, selected - 1)]?.id ?? null);
    } else if (event.key === 'Enter') {
      event.preventDefault(); if (results[selected]) choose(results[selected]);
    }
  }
  if (!open || typeof document === 'undefined') return null;
  return createPortal(<div className="lu-cp-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.(); }}>
    <div ref={panel} className="lu-cp" role="dialog" aria-modal="true" aria-label={placeholder}>
      <input className="lu-cp-input" type="text" role="combobox" aria-expanded="true" aria-label={placeholder} aria-controls={`${id}-list`} aria-activedescendant={results.length ? `${id}-option-${selected}` : undefined} placeholder={placeholder} value={query} onChange={event => { setQuery(event.target.value); setSelectedId(null); }} onKeyDown={onKeydown} />
      <ul id={`${id}-list`} className="lu-cp-list" role="listbox">
        {results.map((item, index) => <li key={item.id} id={`${id}-option-${index}`} className="lu-cp-item" data-active={index === selected ? 'true' : 'false'} role="option" aria-selected={index === selected} onMouseEnter={() => setSelectedId(item.id)} onClick={() => choose(item)}>
          {consoleIcon(item.icon) && <span className="lu-cp-item-icon"><ConsoleIcon name={item.icon!} /></span>}
          <span className="lu-cp-item-label">{item.label}</span>{item.group && <span className="lu-cp-item-group">{item.group}</span>}
        </li>)}
      </ul>
      {/* A listbox holds only options, so the empty line sits beside it in a
          status region that is always present and announces when it fills. */}
      <div role="status">{!results.length && <p className="lu-cp-empty">{emptyLabel}</p>}</div>
    </div>
  </div>, document.body);
}
