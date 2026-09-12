import { release } from 'node:os';

export const figureDpi = 300;
export const figureScale = figureDpi / 96;
// CoreText and backdrop compositing differ across macOS major releases.
export const referencePlatform = process.platform === 'darwin'
  ? `darwin-${release().split('.')[0]}` : process.platform;
