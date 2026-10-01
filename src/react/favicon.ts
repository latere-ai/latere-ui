// The browser tab's icon (`latere-ui/favicon`): the platform mark as the
// navigation draws it, set in ink. A tab icon sits outside the page's palette,
// so its colors live here: ink in a light tab, light ink in a dark one.
//
// This module renders with react-dom/server, so it is a separate entry and the
// main entry never imports it: a build script or a server writes the icon, and
// no client bundle carries the server renderer.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlatformLogoMark } from './PlatformLogoMark';

/** The mark's color in a light tab, the ink of `data-design="ink"`. */
export const FAVICON_INK = '#0d0d0d';
/** The mark's color in a dark tab. */
export const FAVICON_INK_DARK = '#ececec';

const style = `<style>.platform-logo-mark{color:${FAVICON_INK}}@media (prefers-color-scheme: dark){.platform-logo-mark{color:${FAVICON_INK_DARK}}}</style>`;

/**
 * The favicon document for the mark's rendered markup: the style goes first
 * inside the outer svg, so the mark's currentColor resolves to the ink. Throws
 * when the markup is not an svg element.
 */
export function favicon(markup: string): string {
  const open = markup.indexOf('>');
  if (!markup.startsWith('<svg') || open < 0) throw new Error('the platform mark did not render as an svg');
  return `${markup.slice(0, open + 1)}${style}${markup.slice(open + 1)}\n`;
}

/** The platform favicon: `PlatformLogoMark` rendered to static markup, through `favicon`. */
export function platformFaviconSvg(): string {
  return favicon(renderToStaticMarkup(createElement(PlatformLogoMark)));
}
