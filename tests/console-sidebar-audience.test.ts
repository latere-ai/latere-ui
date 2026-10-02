// Style contracts for rows only admins are shown and for the bottom groups
// set in the foot. The rendered behavior is covered in
// src/react/__tests__/console-sidebar-audience.test.tsx.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('audience and foot group styles', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles/console.css'), 'utf8');
  it('tints an admin row icon and its chip from one token', () => {
    expect(css).toMatch(/\.lu-cs-item\[data-audience="admin"\] \.lu-cs-item-icon \{\s*color: var\(--lu-audience-admin, currentColor\);/);
    const chip = css.slice(css.indexOf('.lu-cs-audience {'), css.indexOf('}', css.indexOf('.lu-cs-audience {')));
    expect(chip).toMatch(/color: var\(--lu-audience-admin/);
    expect(chip).toMatch(/background: color-mix\(in srgb, var\(--lu-audience-admin/);
  });
  it('lets the nav give up its height before the foot groups scroll', () => {
    expect(css).toMatch(/\.lu-cs:has\(> \.lu-cs-foot-has-nav\) > \.lu-cs-nav \{\s*flex-shrink: 1000;\s*min-height: calc\(3 \* var\(--lu-cs-row-size, 36px\)\);/);
  });
  it('lets the foot group area scroll while the account control keeps its height', () => {
    const nav = css.slice(css.indexOf('.lu-cs-foot-nav {'), css.indexOf('}', css.indexOf('.lu-cs-foot-nav {')));
    expect(nav).toMatch(/min-height: 0;/);
    expect(nav).toMatch(/overflow-y: auto;/);
    expect(nav).toMatch(/overscroll-behavior: contain;/);
  });
});
