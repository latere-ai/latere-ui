import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { SiteFooter } from '../src/react/index';

afterEach(cleanup);

describe('React footer language', () => {
  it('marks the footer with the language its copy is in, as the Vue footer does', () => {
    const zh = render(<SiteFooter theme="auto" locale="zh" />);
    expect(zh.container.querySelector('footer')!.getAttribute('lang')).toBe('zh-Hans');
    cleanup();
    const compact = render(<SiteFooter theme="auto" locale="de" compact />);
    expect(compact.container.querySelector('footer')!.getAttribute('lang')).toBe('de');
    cleanup();
    const unknown = render(<SiteFooter theme="auto" locale="fr" />);
    expect(unknown.container.querySelector('footer')!.getAttribute('lang')).toBe('en');
  });
});
