import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import GlassSurface from '../src/components/GlassSurface.vue';
import GlassPanel from '../src/components/GlassPanel.vue';
import GlassBar from '../src/components/GlassBar.vue';

describe('GlassSurface', () => {
  it('applies the utility class for the requested tier', () => {
    expect(mount(GlassSurface, { props: { tier: 'thin' } }).classes()).toContain('lu-glass-thin');
    expect(mount(GlassSurface, { props: { tier: 'regular' } }).classes()).toContain('lu-glass');
    expect(mount(GlassSurface, { props: { tier: 'thick' } }).classes()).toContain('lu-glass-thick');
  });

  it('defaults to the regular tier', () => {
    expect(mount(GlassSurface).classes()).toContain('lu-glass');
  });

  it('renders the tag given by `as`', () => {
    expect(mount(GlassSurface, { props: { as: 'section' } }).element.tagName).toBe('SECTION');
  });

  it('adds the interactive modifier only when requested', () => {
    expect(mount(GlassSurface, { props: { interactive: true } }).classes()).toContain('lu-gs-interactive');
    expect(mount(GlassSurface).classes()).not.toContain('lu-gs-interactive');
  });

  it('renders slot content', () => {
    expect(mount(GlassSurface, { slots: { default: 'hi' } }).text()).toBe('hi');
  });
});

describe('GlassPanel', () => {
  it('is a regular-tier surface by default and drops padding when flush', () => {
    const panel = mount(GlassPanel);
    expect(panel.classes()).toContain('lu-glass');
    expect(panel.classes()).toContain('lu-panel');
    expect(mount(GlassPanel, { props: { flush: true } }).classes()).toContain('lu-panel-flush');
  });
});

describe('GlassBar', () => {
  it('renders a div by default and a header when asked', () => {
    expect(mount(GlassBar).element.tagName).toBe('DIV');
    expect(mount(GlassBar, { props: { header: true } }).element.tagName).toBe('HEADER');
  });

  it('adds the sticky modifier when requested', () => {
    expect(mount(GlassBar, { props: { sticky: true } }).classes()).toContain('lu-bar-sticky');
  });
});
