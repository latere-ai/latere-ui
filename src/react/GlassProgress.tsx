import '../styles/components/glass-progress.css';

export interface GlassProgressProps {
  value: number;
  max?: number;
  label?: string;
}

export function GlassProgress({ value, max = 100, label }: GlassProgressProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const percent = max === 0 ? 0 : (clamped / max) * 100;
  return <div className="lu-progress lu-glass-ultrathin" role="progressbar"
    aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
    <span className="lu-progress-fill" style={{ width: `${percent}%` }} />
  </div>;
}
