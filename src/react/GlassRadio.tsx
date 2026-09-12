import { useId } from 'react';
import '../styles/components/glass-radio.css';
import { cx } from './internal';

export interface GlassRadioProps {
  /** Selected group value (the Vue modelValue prop). */
  value: string;
  /** This option's identity (the Vue value prop). */
  optionValue: string;
  name: string;
  label?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export function GlassRadio({ value, optionValue, name, label, disabled = false, onChange }: GlassRadioProps) {
  const id = useId();
  return <label className={cx('lu-radio', disabled && 'is-disabled')} htmlFor={id}>
    <input id={id} type="radio" className="lu-radio-native" name={name} value={optionValue}
      checked={value === optionValue} disabled={disabled} onChange={() => onChange?.(optionValue)} />
    <span className="lu-radio-dot lu-glass-ultrathin" aria-hidden="true" />
    {label && <span className="lu-radio-label">{label}</span>}
  </label>;
}
