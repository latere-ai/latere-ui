// React adapter of GlassSelect.vue — a custom dropdown select: a thin-glass
// trigger over a thick-glass listbox. Full listbox/option ARIA with arrow +
// Enter keyboard support. `value` + `onChange` replace v-model.
// Requires `import 'latere-ui/glass'`.
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { SelectOption } from '../glass/types';
import { initialOption, nextEnabledOption } from '../glass/selectNavigation';
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
  const [active, setActive] = useState(-1);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    if (!options[active] || options[active].disabled) {
      setActive(initialOption(options, value));
      return;
    }
    root.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
  }, [open, active, options, value]);

  const selected = options.find((o) => o.value === value);

  function toggle() {
    if (disabled) return;
    setOpen((was) => {
      if (!was) {
        setActive(initialOption(options, value));
      }
      return !was;
    });
  }
  function close() {
    setOpen(false);
  }
  useClickOutside(root, open, close);

  function choose(opt: SelectOption | undefined) {
    if (!opt || opt.disabled) return;
    onChange?.(opt.value);
    close();
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (!open && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ')) {
      e.preventDefault();
      toggle();
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => nextEnabledOption(options, a, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => nextEnabledOption(options, a < 0 ? 0 : a, -1));
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
        aria-controls={open ? `${id}-list` : undefined}
        aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
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
        <ul id={`${id}-list`} className="lu-select-list lu-glass-thick" role="listbox">
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={`${id}-option-${i}`}
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
              onMouseEnter={() => !opt.disabled && setActive(i)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
