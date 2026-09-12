import '../styles/components/glass-skeleton.css';

export interface GlassSkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  /** Circle placeholder; overrides radius. Set equal width and height for an avatar. */
  circle?: boolean;
}

export function GlassSkeleton({ width = '100%', height = '1em', radius = 'var(--radius-sm, 6px)',
  circle = false }: GlassSkeletonProps) {
  return <span className="lu-skeleton" aria-hidden="true"
    style={{ width, height, borderRadius: circle ? '50%' : radius }} />;
}
