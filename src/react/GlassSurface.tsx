// Base Liquid Glass primitive, React adapter of GlassSurface.vue. Internal to
// src/react/ — the ported components compose it; it is not exported from the
// entrypoint (mirroring the v1.27 ported set). The tier map is duplicated from
// glass/useGlass.ts because that module imports `vue`, which a React host
// does not install.
//
// Requires the material CSS: `import 'latere-ui/glass'` once in the app.
import type { ElementType, ReactNode } from 'react';
import '../styles/components/glass-surface.css';
import { cx } from './internal';

/** Material depth ladder — see glass/useGlass.ts, the Vue-side source. */
export type GlassTier = 'ultrathin' | 'thin' | 'regular' | 'thick' | 'smoke';

const TIER_CLASS: Record<GlassTier, string> = {
  ultrathin: 'lu-glass-ultrathin',
  thin: 'lu-glass-thin',
  regular: 'lu-glass',
  thick: 'lu-glass-thick',
  smoke: 'lu-glass-smoke',
};

/** The utility class that paints a given tier. */
export function glassClass(tier: GlassTier = 'regular'): string {
  return TIER_CLASS[tier];
}

export interface GlassSurfaceProps {
  /** HTML tag to render as. */
  as?: ElementType;
  /** Material depth. thin = controls, regular = panels/chrome, thick = overlays. */
  tier?: GlassTier;
  /** Lift the specular highlight on hover — for clickable surfaces. */
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
}

export function GlassSurface({
  as: Tag = 'div',
  tier = 'regular',
  interactive = false,
  className,
  children,
}: GlassSurfaceProps) {
  return (
    <Tag className={cx('lu-gs', glassClass(tier), interactive && 'lu-gs-interactive', className)}>
      {children}
    </Tag>
  );
}
