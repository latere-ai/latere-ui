// The ink ladder of ink.css, held to WCAG 2.2 contrast in both themes:
// every text tone reaches 4.5:1 on every surface text sits on, status tones
// too, control edges and the focus ring reach 3:1 (1.4.11), the primary
// action's glyph reaches 4.5:1 on its fill, and every syntax color reaches
// 4.5:1 on the code block it is set in. The ratios are computed from the
// stylesheet itself, so a later token edit that loses contrast fails here.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/styles/ink.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The declarations of the one rule whose selector is exactly `selector`. */
function block(selector: string): Map<string, string> {
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (match[1].trim() !== selector) continue;
    const out = new Map<string, string>();
    for (const part of match[2].split(';')) {
      const at = part.indexOf(':');
      if (at > 0) out.set(part.slice(0, at).trim(), part.slice(at + 1).trim());
    }
    return out;
  }
  throw new Error(`ink.css has no rule ${selector}`);
}

const LIGHT = ':root[data-design="ink"]';
const DARK = ':root[data-design="ink"][data-theme="dark"]';
const DARK_BLOCK = block(DARK);
const themes = { light: block(LIGHT), dark: new Map([...block(LIGHT), ...DARK_BLOCK]) };

type RGBA = [number, number, number, number];

function parse(value: string, tokens: Map<string, string>, depth = 0): RGBA {
  if (depth > 8) throw new Error(`token cycle at ${value}`);
  const v = value.trim();
  const ref = /^var\((--[\w-]+)\)$/.exec(v);
  if (ref) {
    const next = tokens.get(ref[1]);
    if (next === undefined) throw new Error(`${ref[1]} is not defined in ink.css`);
    return parse(next, tokens, depth + 1);
  }
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map(c => c + c).join('') : hex[1];
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)).concat(1) as RGBA;
  }
  const rgba = /^rgba?\(([^)]+)\)$/.exec(v);
  if (rgba) {
    const [r, g, b, a = '1'] = rgba[1].split(/[\s,/]+/).filter(Boolean);
    return [Number(r), Number(g), Number(b), Number(a)];
  }
  const mix = /^color-mix\(in srgb,\s*(.+?)\s+(\d+(?:\.\d+)?)%\s*,\s*transparent\)$/.exec(v);
  if (mix) {
    const [r, g, b, a] = parse(mix[1], tokens, depth + 1);
    return [r, g, b, a * Number(mix[2]) / 100];
  }
  throw new Error(`cannot read ${value}`);
}

/** A translucent color composited over an opaque one. */
function over(top: RGBA, under: RGBA): RGBA {
  const a = top[3];
  return [0, 1, 2].map(i => top[i] * a + under[i] * (1 - a)).concat(1) as RGBA;
}

function luminance([r, g, b]: RGBA): number {
  const lin = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(fg: RGBA, bg: RGBA): number {
  const [x, y] = [luminance(fg), luminance(bg)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** The opaque surfaces text is set on, and the selected-row tint over the
 * two that carry lists. */
function surfaces(tokens: Map<string, string>): [string, RGBA][] {
  const color = (name: string) => parse(`var(${name})`, tokens);
  const base: [string, RGBA][] = ['--bg', '--bg-surface', '--bg-raised', '--bg-hover'].map(name => [name, color(name)]);
  return [
    ...base,
    ['--accent-subtle over --bg', over(color('--accent-subtle'), color('--bg'))],
    ['--accent-subtle over --bg-surface', over(color('--accent-subtle'), color('--bg-surface'))],
  ];
}

const TEXT = ['--fg-1', '--fg-2', '--fg-3'];
// Every syntax color the light block defines, read from the file, so a color
// added later is held to the same checks without being listed here.
const CODE = [...themes.light.keys()].filter(name => name.startsWith('--code-'));
// The surfaces code is set on: a guide's fence and the API reference's
// sample panels.
const CODE_SURFACES = ['--bg-code', '--bg-raised'];
const STATUS = ['--state-running', '--state-creating', '--state-idle', '--state-error', '--state-neutral', '--state-stopped', '--method-write', '--method-update', '--method-delete', '--audience-admin'];

for (const [theme, tokens] of Object.entries(themes)) {
  describe(`the ${theme} ink ladder`, () => {
    const color = (name: string) => parse(`var(${name})`, tokens);
    const opaque = (name: string, under: RGBA) => over(color(name), under);

    it('keeps every text tone at 4.5:1 on every surface', () => {
      const failing: string[] = [];
      for (const text of TEXT) for (const [name, surface] of surfaces(tokens)) {
        const r = ratio(opaque(text, surface), surface);
        if (r < 4.5) failing.push(`${text} on ${name}: ${r.toFixed(2)}`);
      }
      expect(failing).toEqual([]);
    });

    it('keeps every status tone at 4.5:1 where status text is set', () => {
      const failing: string[] = [];
      for (const tone of STATUS) for (const [name, surface] of surfaces(tokens).filter(([n]) => n !== '--bg-hover')) {
        const r = ratio(opaque(tone, surface), surface);
        if (r < 4.5) failing.push(`${tone} on ${name}: ${r.toFixed(2)}`);
      }
      expect(failing).toEqual([]);
    });

    it('keeps a method or status label at 4.5:1 on its own tint over every surface', () => {
      // The API reference's method labels, the console's status chips and the
      // admin chip set a tone on a 12% wash of itself, which lowers the
      // contrast it has on the bare surface.
      const failing: string[] = [];
      for (const tone of STATUS.filter(name => name.startsWith('--method') || name === '--state-running' || name === '--audience-admin')) for (const [name, surface] of surfaces(tokens)) {
        const fill = color(tone);
        const wash = over([fill[0], fill[1], fill[2], 0.12], surface);
        const r = ratio(opaque(tone, wash), wash);
        if (r < 4.5) failing.push(`${tone} on its tint over ${name}: ${r.toFixed(2)}`);
      }
      expect(failing).toEqual([]);
    });

    it('keeps control edges and the focus ring at 3:1', () => {
      const failing: string[] = [];
      for (const edge of ['--border-control', '--accent']) for (const [name, surface] of surfaces(tokens).slice(0, 3)) {
        const r = ratio(opaque(edge, surface), surface);
        if (r < 3) failing.push(`${edge} on ${name}: ${r.toFixed(2)}`);
      }
      expect(failing).toEqual([]);
    });

    it('sets the primary glyph at 4.5:1 on its fill and on its hover fill', () => {
      const glyph = color('--lu-preset-on-accent');
      expect(ratio(glyph, color('--accent'))).toBeGreaterThanOrEqual(4.5);
      expect(ratio(glyph, color('--accent-hover'))).toBeGreaterThanOrEqual(4.5);
    });

    it('keeps text on the terminal canvas at 4.5:1, since the canvas is dark in both themes', () => {
      const canvas = color('--bg-terminal');
      const failing = ['--fg-terminal', '--fg-terminal-muted']
        .map(text => [text, ratio(opaque(text, canvas), canvas)] as const)
        .filter(([, r]) => r < 4.5)
        .map(([text, r]) => `${text} on --bg-terminal: ${r.toFixed(2)}`);
      expect(failing).toEqual([]);
    });

    it('sets every syntax color at 4.5:1 on the code block', () => {
      // Code is body-size text (13px in a guide, 12px in a sample), so every
      // mark needs AA's 4.5:1, not the 3:1 large text is allowed.
      const failing: string[] = [];
      for (const tone of CODE) for (const surface of CODE_SURFACES) {
        const under = color(surface);
        const r = ratio(opaque(tone, under), under);
        if (r < 4.5) failing.push(`${tone} on ${surface}: ${r.toFixed(2)}`);
      }
      expect(failing).toEqual([]);
    });

    it('builds its grays with no hue', () => {
      const tinted = ['--bg-deep', '--bg', '--bg-surface', '--bg-raised', '--bg-hover', ...TEXT, '--border-control', '--accent', '--accent-hover']
        .filter(name => { const [r, g, b] = color(name); return r !== g || g !== b; });
      expect(tinted).toEqual([]);
    });
  });
}

describe('the syntax colors', () => {
  it('cover comments, keywords, strings, numbers, names and variables', () => {
    expect([...CODE].sort()).toEqual(['--code-comment', '--code-keyword', '--code-name', '--code-number', '--code-string', '--code-variable']);
  });

  it('are the ladder’s own tones, never a new color', () => {
    // Each is a reference to a text or status tone, so a code block adds no
    // hue the page does not already carry, and the tone's own contrast
    // checks above hold for it too.
    // `--ok` is the green --state-running reads, checked through it.
    const allowed = new Set([...TEXT, ...STATUS, '--ok']);
    const stray = CODE.filter(name => {
      const ref = /^var\((--[\w-]+)\)$/.exec(themes.light.get(name) ?? '');
      return !ref || !allowed.has(ref[1]) || DARK_BLOCK.has(name);
    });
    expect(stray).toEqual([]);
  });
});

describe('the status aliases', () => {
  it('name the method tones by meaning and follow them in both themes', () => {
    // --info, --warn and --danger are declared once, in the light block, as
    // references, so the dark block's method tones carry them too.
    const aliases = { '--info': '--method-write', '--warn': '--method-update', '--danger': '--method-delete' };
    for (const [alias, tone] of Object.entries(aliases)) {
      expect(themes.light.get(alias)).toBe(`var(${tone})`);
      expect(DARK_BLOCK.has(alias)).toBe(false);
      for (const tokens of Object.values(themes)) expect(parse(`var(${alias})`, tokens)).toEqual(parse(`var(${tone})`, tokens));
    }
  });
});

describe('the ink ladder', () => {
  it('inverts the primary action between the themes', () => {
    const fill = (tokens: Map<string, string>) => luminance(parse('var(--accent)', tokens));
    expect(fill(themes.light)).toBeLessThan(0.05);
    expect(fill(themes.dark)).toBeGreaterThan(0.7);
  });

  it('sets dark text in off-white, never pure white', () => {
    const [r, g, b] = parse('var(--fg-1)', themes.dark);
    expect([r, g, b]).not.toEqual([255, 255, 255]);
    expect(luminance(parse('var(--fg-1)', themes.dark))).toBeGreaterThan(0.75);
  });
});
