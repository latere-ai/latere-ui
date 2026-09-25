import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('brand wordmark styles', () => {
  const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');
  const tokens = (css: string) => Array.from(css.matchAll(/(--lu-brand-[a-z]+): ([^;]+);/g)).map(m => `${m[1]}: ${m[2]}`);

  // The footer is self-contained (no @import) so `latere-ui/styles` stays one
  // resolvable file for SSG consumers; console.css uses brand.css for the same
  // values. Guard the background-image rule in BOTH so neither regresses.
  for (const file of ['src/styles/footer.css', 'src/styles/brand.css']) {
    it(`${file} uses background-image so background-clip:text is not reset by the shorthand`, () => {
      const css = read(file);
      expect(css).not.toMatch(/-brand\s*\{\s*background:\s*linear-gradient/);
      expect(css).toMatch(/\.wallfacer-brand\s*\{\s*background-image:/);
      expect(css).toMatch(/\.platform-brand\s*\{\s*background-image: var\(--lu-brand-platform\)/);
    });
  }

  it('states the same product gradients in footer.css and brand.css', () => {
    const footer = tokens(read('src/styles/footer.css'));
    expect(footer).toHaveLength(16); // eight products, light and dark
    expect(tokens(read('src/styles/brand.css'))).toEqual(footer);
  });

  it('draws the platform in ink: neutral stops only, dark to graphite, light to silver', () => {
    const [light, dark] = tokens(read('src/styles/brand.css')).filter(t => t.startsWith('--lu-brand-platform'));
    for (const token of [light, dark]) {
      for (const hex of token.match(/#[0-9a-f]{6}/g)!) {
        const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
        expect(r === g && g === b, `${hex} is a gray`).toBe(true);
      }
    }
    expect(light).toContain('#0a0a0a');
    expect(dark).toContain('#fafafa');
  });

  it('footer.css has no @import rule (keeps a single resolvable stylesheet)', () => {
    expect(read('src/styles/footer.css')).not.toMatch(/@import\s+['"]/);
  });
});
