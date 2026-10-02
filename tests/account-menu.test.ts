import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

// Style contracts of the account menu's shared stylesheet. The rendered
// behavior is covered in src/react/__tests__/account-menu.test.tsx.
const css = readFileSync(resolve(process.cwd(), 'src/styles/components/account-menu.css'), 'utf8');

describe('AccountMenu styles', () => {
  it('org/team initials tiles keep ink-on-accent contrast in both themes', () => {
    // Dark themes flip --accent to a light tone; hardcoded white initials
    // washed out on the light tile. Ink must be var(--bg).
    const rule = css.slice(css.indexOf('.lu-am-org-team {'), css.indexOf('.lu-am-org-text'));
    expect(rule).toMatch(/color:\s*var\(--bg/);
    expect(rule).not.toMatch(/color:\s*#fff/);
  });

  // Regression: the head's `border-bottom` plus the first section's `border-top`
  // rendered a doubled separator line, because the suppressing rule
  // `.lu-am-section:first-of-type { border-top: 0 }` is dead: `:first-of-type`
  // matches the first <div> sibling (the head), never a `.lu-am-section`. The
  // head carries no border-bottom, so the first section's border-top is the
  // single header separator.
  it('does not declare both a head border-bottom and a dead first-of-type guard', () => {
    const headRule = css.slice(css.indexOf('.lu-am-head {'), css.indexOf('}', css.indexOf('.lu-am-head {')));
    expect(headRule).not.toContain('border-bottom');
    expect(css).not.toContain('.lu-am-section:first-of-type');
  });

  // Regression: the dropdown filled with a single translucent `--glass-bg-thick`
  // tint and relied on `backdrop-filter` to occlude. Inside a glass nav or
  // sidebar, the ancestor's backdrop-filter neutralizes this panel's blur, so
  // sharp page text bled through the 0.90 fill. The tint is composited over a
  // solid `--bg-surface` base so occlusion does not depend on the blur.
  it('composites the dropdown tint over a solid surface (occludes without blur)', () => {
    const ddRule = css.slice(css.indexOf('.lu-am-dd {'), css.indexOf('}', css.indexOf('.lu-am-dd {')));
    expect(ddRule).toContain('--bg-surface');
    expect(ddRule).toMatch(/background:[\s\S]*--bg-surface/);
  });
});
