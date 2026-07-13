// React adapter of GlassSegmented.vue — a segmented control: pick one of a few
// options. Thin-glass track with a highlighted active segment; radiogroup
// semantics with arrow-key roving focus. `value` + `onChange` replace v-model.
// Requires `import 'latere-ui/glass'`.
import { useRef, type KeyboardEvent } from 'react';
import type { SegmentOption } from '../glass/types';
import '../styles/components/glass-segmented.css';
import { cx } from './internal';

export interface GlassSegmentedProps {
  value: string;
  options: SegmentOption[];
  ariaLabel?: string;
  onChange?: (value: string) => void;
}

export function GlassSegmented({ value, options, ariaLabel, onChange }: GlassSegmentedProps) {
  const btns = useRef<(HTMLButtonElement | null)[]>([]);

  function select(v: string) {
    if (v !== value) onChange?.(v);
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = options.length;
    let next = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n;
    else return;
    e.preventDefault();
    select(options[next].value);
    btns.current[next]?.focus();
  }

  return (
    <div className="lu-seg lu-glass-thin" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt, i) => (
        <button
          key={opt.value}
          ref={(el) => {
            btns.current[i] = el;
          }}
          type="button"
          role="radio"
          className={cx('lu-seg-item', opt.value === value && 'is-active')}
          aria-checked={opt.value === value}
          tabIndex={opt.value === value ? 0 : -1}
          onClick={() => select(opt.value)}
          onKeyDown={(e) => onKey(e, i)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
