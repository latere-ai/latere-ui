// React adapter of GlassSelect.vue — a custom dropdown select: a thin-glass
// trigger over a thick-glass listbox. Full listbox/option ARIA with arrow +
// Enter keyboard support. `value` + `onChange` replace v-model.
// Requires `import 'latere-ui/glass'`.
import { useRef, useState, type KeyboardEvent } from 'react';
import type { SelectOption } from '../glass/types';
import '../styles/components/glass-select.css';
import { cx, useClickOutside } from './internal';

export interface GlassSelectProps {
  value: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  onChange?: (value: string) => void;
}

export function GlassSelect({
  value,
  options,
  placeholder = 'Select…',
  disabled = false,
  ariaLabel,
  onChange,
}: GlassSelectProps) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selected = options.find((o) => o.value === value);

  function toggle() {
    if (disabled) return;
    setOpen((was) => {
      if (!was) {
        const i = options.findIndex((o) => o.value === value);
        setActive(i >= 0 ? i : 0);
      }
      return !was;
    });
  }
  function close() {
    setOpen(false);
  }
  useClickOutside(root, open, close);

  function choose(opt: SelectOption) {
    if (opt.disabled) return;
    onChange?.(opt.value);
    close();
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    const n = options.length;
    if (!open && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ')) {
      e.preventDefault();
      toggle();
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % n);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + n) % n);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === 'Escape') {
      close();
    }
  }

  return (
    <div ref={root} className="lu-select">
      <button
        type="button"
        className={cx('lu-select-trigger', 'lu-glass-ultrathin', open && 'is-open')}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
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
        <ul className="lu-select-list lu-glass-thick" role="listbox">
          {options.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              className={cx(
                'lu-select-option',
                i === active && 'is-active',
                opt.value === value && 'is-selected',
                opt.disabled && 'is-disabled',
              )}
              aria-selected={opt.value === value}
              aria-disabled={opt.disabled || undefined}
              onClick={() => choose(opt)}
              onMouseEnter={() => setActive(i)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
