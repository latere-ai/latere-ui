import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import GlassSpinner from '../src/components/GlassSpinner.vue';
import GlassProgress from '../src/components/GlassProgress.vue';
import GlassSkeleton from '../src/components/GlassSkeleton.vue';
import GlassTooltip from '../src/components/GlassTooltip.vue';

describe('GlassSpinner', () => {
  it('announces itself with role=status and a label', () => {
    const w = mount(GlassSpinner, { props: { label: 'Fetching' } });
    expect(w.attributes('role')).toBe('status');
    expect(w.attributes('aria-label')).toBe('Fetching');
  });
});

describe('GlassProgress', () => {
  it('exposes progressbar ARIA values and clamps the fill width', () => {
    const w = mount(GlassProgress, { props: { value: 150, max: 100 } });
    expect(w.attributes('role')).toBe('progressbar');
    expect(w.attributes('aria-valuenow')).toBe('150');
    expect(w.attributes('aria-valuemax')).toBe('100');
    // clamped to 100%
    expect((w.get('.lu-progress-fill').element as HTMLElement).style.width).toBe('100%');
  });

  it('handles max=0 without dividing by zero', () => {
    const w = mount(GlassProgress, { props: { value: 5, max: 0 } });
    expect((w.get('.lu-progress-fill').element as HTMLElement).style.width).toBe('0%');
  });
});

describe('GlassSkeleton', () => {
  it('applies dimensions and a circle shape when asked', () => {
    const box = mount(GlassSkeleton, { props: { width: '40px', height: '12px' } });
    expect((box.element as HTMLElement).style.width).toBe('40px');
    const circle = mount(GlassSkeleton, { props: { circle: true } });
    expect((circle.element as HTMLElement).style.borderRadius).toBe('50%');
  });
});

describe('GlassTooltip', () => {
  it('renders the trigger slot and a role=tooltip with the text', () => {
    const w = mount(GlassTooltip, { props: { text: 'Copy' }, slots: { default: '<button>c</button>' } });
    expect(w.find('button').exists()).toBe(true);
    const tip = w.get('[role="tooltip"]');
    expect(tip.text()).toBe('Copy');
    expect(tip.classes()).toContain('lu-glass-thick');
  });
});
