import type { SVGProps } from 'react';
import { PLATFORM_MARK } from '../brand/platformMark';
import { LatereLogoMark } from './LatereLogoMark';
import { cx } from './internal';

/** Platform identity mark; inherits color and accepts native SVG attributes. */
export function PlatformLogoMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg className={cx('platform-logo-mark', className)} viewBox={PLATFORM_MARK.viewBox}
      fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
      <LatereLogoMark {...PLATFORM_MARK.logo} />
      <path d={PLATFORM_MARK.layers} stroke="currentColor" strokeWidth={PLATFORM_MARK.strokeWidth}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
