import { release } from 'node:os';

export const figureDpi = 300;
export const figureScale = figureDpi / 96;
// CoreText and backdrop compositing differ across macOS major releases.
export const referencePlatform = process.platform === 'darwin'
  ? `darwin-${release().split('.')[0]}` : process.platform;

/**
 * Chromium arguments for every browser that renders a compared image.
 *
 * `--disable-lcd-text` keeps glyph antialiasing grayscale, as the references
 * were recorded.
 *
 * The tile arguments rasterize each composited layer up to 4096 device pixels
 * wide or tall as one tile, and larger layers in 2048-pixel tiles. With the
 * default 256-pixel tiles, the hosted macOS 15 runner draws the edges of
 * stroke icons in a tiled layer, such as the command palette's row icons,
 * with one of two pixel patterns from one render to the next, while the
 * display list and the layer transform stay identical. Rendered as one tile,
 * the palette came out identical in all 80 renders tried.
 */
export const referenceBrowserArgs = [
  '--disable-lcd-text',
  '--default-tile-width=2048', '--default-tile-height=2048',
  '--max-untiled-layer-width=4096', '--max-untiled-layer-height=4096',
];
