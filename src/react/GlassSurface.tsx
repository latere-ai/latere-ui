// Base Liquid Glass primitive, React adapter of GlassSurface.vue.
// The tier map is duplicated from
// glass/useGlass.ts because that module imports `vue`, which a React host
// does not install.
//
// Requires the material CSS: `import 'latere-ui/glass'` once in the app.
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
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

export type GlassSurfaceProps<T extends ElementType = 'div'> = {
  /** HTML tag to render as. */
  as?: T;
  /** Material depth. thin = controls, regular = panels/chrome, thick = overlays. */
  tier?: GlassTier;
  /** Lift the specular highlight on hover — for clickable surfaces. */
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'tier' | 'interactive' | 'className' | 'children'>;

export function GlassSurface<T extends ElementType = 'div'>({
  as,
  tier = 'regular',
  interactive = false,
  className,
  children,
  ...attributes
}: GlassSurfaceProps<T>) {
  const Tag: ElementType = as ?? 'div';
  return (
    <Tag {...attributes} className={cx('lu-gs', glassClass(tier), interactive && 'lu-gs-interactive', className)}>
      {children}
    </Tag>
  );
}
