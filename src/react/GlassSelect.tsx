// React adapter of GlassSelect.vue: a custom dropdown select, a thin-glass
// trigger over a thick-glass menu that holds a listbox. With more than
// SELECT_SEARCH_THRESHOLD options, or with `searchable`, the menu opens with a
// search field at its top that filters the options as the reader types.
// `value` + `onChange` replace v-model. Requires `import 'latere-ui/glass'`.
import {
  useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type FocusEvent, type KeyboardEvent, type MouseEvent,
} from 'react';
import type { SelectOption } from '../glass/types';
import {
  filterSelectOptions, initialVisibleOption, isSelectSearchable, isTypeToSearchKey,
  nextVisibleOption, selectLabelRuns, selectMenuShift,
} from '../glass/selectSearch';
import '../styles/components/glass-select.css';
import { cx, useClickOutside } from './internal';

export interface GlassSelectProps {
  value: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  /** Show the search field; unset, it shows above SELECT_SEARCH_THRESHOLD options. */
  searchable?: boolean;
  /** Placeholder and accessible name of the search field. */
  searchPlaceholder?: string;
  /** The line shown when no option matches the search. */
  noMatchLabel?: string;
  onChange?: (value: string) => void;
}

export function GlassSelect({
  value,
  options,
  placeholder = 'Select…',
  disabled = false,
  ariaLabel,
  searchable,
  searchPlaceholder = 'Search',
  noMatchLabel = 'No matches',
  onChange,
}: GlassSelectProps) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [query, setQuery] = useState('');
  // The menu's widest measured width while open, so it does not narrow as a
  // search hides long labels, and how far it moves left to stay in the viewport.
  const [lockedWidth, setLockedWidth] = useState(0);
  const [shift, setShift] = useState(0);
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const search = isSelectSearchable(options.length, searchable);
  const visible = useMemo(() => filterSelectOptions(options, search ? query : ''), [options, search, query]);
  const selected = options.find((o) => o.value === value);
  const noMatch = search && query.trim() !== '' && visible.length === 0;
  const activeId = open && visible.includes(active) ? optionId(active) : undefined;

  useEffect(() => {
    if (!open) return;
    const option = options[active];
    if (!option || option.disabled || !visible.includes(active)) {
      setActive(initialVisibleOption(options, visible, value));
      return;
    }
    panel.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
  }, [open, active, options, visible, value]);

  // Measure the open menu: hold its widest width and keep it inside the viewport.
  useLayoutEffect(() => {
    const menu = panel.current;
    if (!open || !menu || !root.current) return;
    const width = menu.getBoundingClientRect().width;
    const held = search && width > lockedWidth ? width : lockedWidth;
    if (held !== lockedWidth) setLockedWidth(held);
    const viewport = document.documentElement.clientWidth || window.innerWidth;
    setShift(selectMenuShift(root.current.getBoundingClientRect().left, Math.max(width, held), viewport));
  }, [open, visible, search, lockedWidth]);

  useEffect(() => {
    if (!open || !search) return;
    const input = field.current;
    if (!input || document.activeElement === input) return;
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
  }, [open, search, query]);

  function show(typed = '') {
    if (disabled) return;
    const shown = filterSelectOptions(options, search ? typed : '');
    setOpen(true);
    setQuery(typed);
    setActive(typed ? nextVisibleOption(options, shown, -1, 1) : initialVisibleOption(options, shown, value));
  }
  function close(restoreFocus = false) {
    if (!open) return;
    setOpen(false);
    setQuery('');
    setLockedWidth(0);
    setShift(0);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }
  function toggle() {
    if (open) close();
    else show();
  }
  // A search makes its first match active, so Enter takes it; clearing the
  // search returns to the chosen value.
  function type(next: string) {
    const shown = filterSelectOptions(options, next);
    setQuery(next);
    setActive(next.trim() ? nextVisibleOption(options, shown, -1, 1) : initialVisibleOption(options, shown, value));
  }
  useClickOutside(root, open, () => close());

  function choose(opt: SelectOption | undefined, fromKeyboard: boolean) {
    if (!opt || opt.disabled) return;
    onChange?.(opt.value);
    close(fromKeyboard);
  }

  // Keep focus where it is while the pointer chooses in the menu; only the
  // search field takes a press, to place its caret.
  function keepFocus(e: MouseEvent<HTMLDivElement>) {
    if (e.target !== field.current) e.preventDefault();
  }
  // Tab, or anything else that moves focus out of the control, closes the menu.
  function onFocusOut(e: FocusEvent<HTMLDivElement>) {
    if (open && !root.current?.contains(e.relatedTarget as Node | null)) close();
  }

  // One handler for the trigger and the search field: either may hold focus
  // while the menu is open.
  function onKey(e: KeyboardEvent<HTMLElement>) {
    if (disabled) return;
    if (!open) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        show();
      } else if (search && isTypeToSearchKey(e)) {
        e.preventDefault();
        show(e.key);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => nextVisibleOption(options, visible, a, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => nextVisibleOption(options, visible, a, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(visible.includes(active) ? options[active] : undefined, true);
    } else if (e.key === 'Escape') {
      // The select owns Escape while open: a search clears first, then the
      // menu closes. Nothing behind it, such as a dialog, sees the key.
      e.preventDefault();
      e.stopPropagation();
      if (query) type('');
      else close(true);
    } else if (e.target !== field.current && search && isTypeToSearchKey(e)) {
      e.preventDefault();
      type(query + e.key);
    }
  }

  return (
    <div ref={root} className="lu-select" data-lu-owns-escape={open ? '' : undefined} onBlur={onFocusOut}>
      <button
        ref={trigger}
        type="button"
        className={cx('lu-select-trigger', 'lu-glass-ultrathin', open && 'is-open')}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={search ? undefined : activeId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={onKey}
      >
        <span className={cx('lu-select-value', !selected && 'is-placeholder')}>
          {selected?.label ?? placeholder}
        </span>
        <span className="lu-select-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div
          ref={panel}
          className={cx('lu-select-list', 'lu-glass-thick', search && 'is-searchable')}
          style={{ minWidth: lockedWidth ? `${lockedWidth}px` : undefined, left: shift ? `${-shift}px` : undefined }}
          onMouseDown={keepFocus}
        >
          {search && (
            <input
              ref={field}
              className="lu-select-search"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={activeId}
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              autoComplete="off"
              spellCheck={false}
              size={1}
              value={query}
              onChange={(e) => type(e.target.value)}
              onKeyDown={onKey}
            />
          )}
          {/* tabIndex -1 keeps the scrolling list out of the Tab order; the
              arrows reach its options through aria-activedescendant. */}
          <ul id={listId} className="lu-select-options" role="listbox" tabIndex={-1}>
            {visible.map((i) => {
              const opt = options[i];
              const runs = selectLabelRuns(opt.label, search ? query : '');
              return (
                <li
                  key={opt.value}
                  id={optionId(i)}
                  role="option"
                  className={cx(
                    'lu-select-option',
                    i === active && 'is-active',
                    opt.value === value && 'is-selected',
                    opt.disabled && 'is-disabled',
                  )}
                  title={opt.label}
                  aria-label={runs.length > 1 ? opt.label : undefined}
                  aria-selected={opt.value === value}
                  aria-disabled={opt.disabled || undefined}
                  onClick={() => choose(opt, false)}
                  onMouseEnter={() => !opt.disabled && setActive(i)}
                >
                  {runs.map((run, r) => (run.match ? <mark key={r} className="lu-select-match">{run.text}</mark> : run.text))}
                </li>
              );
            })}
          </ul>
          {noMatch && <div className="lu-select-empty" role="status">{noMatchLabel}</div>}
        </div>
      )}
    </div>
  );
}
