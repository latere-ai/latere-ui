// React adapter of GlassCheckbox.vue — a checkbox with a glass check box and a
// label. The native input stays in the DOM for accessibility and keyboard
// support. `value` + `onChange` replace v-model.
import { useId, type ChangeEvent } from 'react';
import '../styles/components/glass-checkbox.css';
import { cx } from './internal';

export interface GlassCheckboxProps {
  value: boolean;
  label?: string;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

export function GlassCheckbox({ value, label, disabled = false, onChange }: GlassCheckboxProps) {
  const id = useId();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange?.(e.target.checked);
  }

  return (
    <label className={cx('lu-check', disabled && 'is-disabled')} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="lu-check-native"
        checked={value}
        disabled={disabled}
        onChange={handleChange}
      />
      <span className="lu-check-box lu-glass-ultrathin" aria-hidden="true">
        <svg className="lu-check-tick" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.2l2.2 2.2 4.6-4.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label && <span className="lu-check-label">{label}</span>}
    </label>
  );
}
