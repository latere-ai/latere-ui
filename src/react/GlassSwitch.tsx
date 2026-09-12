import '../styles/components/glass-switch.css';
import { cx } from './internal';

export interface GlassSwitchProps {
  value: boolean;
  label?: string;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

export function GlassSwitch({ value, label, disabled = false, onChange }: GlassSwitchProps) {
  return <button type="button" role="switch" className={cx('lu-switch', value && 'is-on')}
    aria-checked={value} aria-label={label} disabled={disabled} onClick={() => onChange?.(!value)}>
    <span className={cx('lu-switch-track', !value && 'lu-glass-ultrathin')}>
      <span className="lu-switch-thumb" />
    </span>
    {label && <span className="lu-switch-label">{label}</span>}
  </button>;
}
