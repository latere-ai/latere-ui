import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { FullConfig } from '@playwright/test';
import { withPngDensity, readPngDensity } from './png-density';
import { figureDpi, referencePlatform } from './reference-settings';

export default function finishReferences(config: FullConfig) {
  const directory = resolve(import.meta.dirname, 'goldens', referencePlatform);
  const files = readdirSync(directory).filter(name => name.endsWith('.png'));
  if (!files.length) throw new Error(`No reference PNGs found in ${directory}`);
  const pixelsPerMetre = Math.round(figureDpi / 0.0254);
  for (const name of files) {
    const path = resolve(directory, name);
    let png: Buffer = readFileSync(path);
    // Only an explicit recording run may modify reference metadata.
    if (config.updateSnapshots !== 'none') {
      const next = withPngDensity(png, figureDpi);
      if (!next.equals(png)) writeFileSync(path, next);
      png = next;
    }
    const density = readPngDensity(png);
    if (density?.unit !== 1 || density.x !== pixelsPerMetre || density.y !== pixelsPerMetre) {
      throw new Error(`${path}: expected ${figureDpi} DPI metadata; regenerate with test:visual:update`);
    }
  }
}
