import type { ButtonHTMLAttributes } from 'react';
import '../styles/components/glass-icon-button.css';
import { cx } from './internal';

export interface GlassIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'aria-label' | 'aria-pressed'> {
  /** Accessible name for the icon-only action. */
  label: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Makes the button a toggle: `false` is an unpressed toggle, unset a plain button. */
  pressed?: boolean;
}

export function GlassIconButton({ label, size = 'md', disabled = false, pressed,
  children, onClick, className, ...attributes }: GlassIconButtonProps) {
  return <button {...attributes} type="button"
    className={cx('lu-iconbtn', `lu-iconbtn-${size}`, pressed && 'is-pressed', className)}
    aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick}>
    {children}
  </button>;
}
