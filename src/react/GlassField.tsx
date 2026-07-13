// React adapter of GlassField.vue — a labeled input shell in thin glass.
// Wraps <input>/<textarea>; `value` + `onChange` replace v-model.
// Requires `import 'latere-ui/glass'`.
import { useId, type ChangeEvent } from 'react';
import '../styles/components/glass-field.css';
import { cx } from './internal';

export interface GlassFieldProps {
  value?: string;
  label?: string;
  /** Validation message; renders below and flags the field invalid. */
  error?: string;
  type?: string;
  placeholder?: string;
  /** Render a multi-line <textarea> instead of an <input>. */
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export function GlassField({
  value = '',
  label,
  error,
  type = 'text',
  placeholder,
  multiline = false,
  rows = 3,
  disabled = false,
  onChange,
}: GlassFieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-err` : undefined;

  function handleChange(ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    onChange?.(ev.target.value);
  }

  return (
    <div className={cx('lu-field', !!error && 'is-invalid')}>
      {label && (
        <label htmlFor={id} className="lu-field-label">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          id={id}
          className="lu-field-control lu-glass-ultrathin"
          value={value}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          onChange={handleChange}
        />
      ) : (
        <input
          id={id}
          className="lu-field-control lu-glass-ultrathin"
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          onChange={handleChange}
        />
      )}
      {error && (
        <p id={`${id}-err`} className="lu-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
