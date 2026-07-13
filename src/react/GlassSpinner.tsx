// React adapter of GlassSpinner.vue — an indeterminate loading spinner.
// Announces itself to assistive tech; slows (never stops) under reduced motion.
import '../styles/components/glass-spinner.css';

export interface GlassSpinnerProps {
  size?: number;
  label?: string;
}

export function GlassSpinner({ size = 20, label = 'Loading' }: GlassSpinnerProps) {
  return (
    <span
      className="lu-spinner"
      role="status"
      aria-label={label}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
