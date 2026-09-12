import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('the top-nav account menu scrolls long organization lists within a viewport height limit', () => {
  const style = document.createElement('style');
  style.textContent = readFileSync('src/styles/components/account-menu.css', 'utf8');
  document.head.append(style);
  const menu = document.createElement('div');
  menu.className = 'lu-am-dd lu-am-dd-right';
  document.body.append(menu);
  try {
    const css = getComputedStyle(menu);
    expect(css.overflowY).toBe('auto');
    expect(css.maxHeight).not.toBe('');
    expect(css.maxHeight).not.toBe('none');
  } finally { menu.remove(); style.remove(); }
});
