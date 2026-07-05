import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import GlassButton from '../src/components/GlassButton.vue';
import GlassField from '../src/components/GlassField.vue';
import GlassBadge from '../src/components/GlassBadge.vue';
import GlassAlert from '../src/components/GlassAlert.vue';

describe('GlassButton', () => {
  it('paints the default variant as thin glass, others own their fill', () => {
    expect(mount(GlassButton).classes()).toContain('lu-glass-thin');
    expect(mount(GlassButton, { props: { variant: 'primary' } }).classes()).not.toContain('lu-glass-thin');
    expect(mount(GlassButton, { props: { variant: 'primary' } }).classes()).toContain('lu-btn-primary');
  });

  it('defaults to type=button so it never submits by accident', () => {
    expect(mount(GlassButton).attributes('type')).toBe('button');
  });

  it('emits click when enabled', async () => {
    const w = mount(GlassButton);
    await w.trigger('click');
    expect(w.emitted('click')).toHaveLength(1);
  });

  it('suppresses click and disables when loading or disabled', async () => {
    const loading = mount(GlassButton, { props: { loading: true } });
    await loading.trigger('click');
    expect(loading.emitted('click')).toBeUndefined();
    expect(loading.attributes('disabled')).toBeDefined();
    expect(loading.attributes('aria-busy')).toBe('true');

    const disabled = mount(GlassButton, { props: { disabled: true } });
    await disabled.trigger('click');
    expect(disabled.emitted('click')).toBeUndefined();
  });
});

describe('GlassField', () => {
  it('two-way binds via modelValue', async () => {
    const w = mount(GlassField, { props: { modelValue: '' } });
    await w.get('input').setValue('hello');
    expect(w.emitted('update:modelValue')![0]).toEqual(['hello']);
  });

  it('renders a textarea when multiline', () => {
    expect(mount(GlassField, { props: { multiline: true } }).find('textarea').exists()).toBe(true);
  });

  it('wires aria-invalid + aria-describedby to the error message', () => {
    const w = mount(GlassField, { props: { error: 'Required', label: 'Name' } });
    const input = w.get('input');
    expect(input.attributes('aria-invalid')).toBe('true');
    const errId = input.attributes('aria-describedby')!;
    expect(w.get(`#${errId}`).text()).toBe('Required');
    // label is associated with the control
    expect(w.get('label').attributes('for')).toBe(input.attributes('id'));
  });

  it('sits on ultrathin glass', () => {
    expect(mount(GlassField).get('input').classes()).toContain('lu-glass-ultrathin');
  });
});

describe('GlassBadge', () => {
  it('maps tone to a state token and glass by default', () => {
    const w = mount(GlassBadge, { props: { tone: 'error' }, slots: { default: 'Error' } });
    expect(w.classes()).toContain('lu-glass-ultrathin');
    expect(w.attributes('style')).toContain('--state-error');
    expect(w.text()).toBe('Error');
  });

  it('renders a solid fill and optional dot', () => {
    const w = mount(GlassBadge, { props: { solid: true, dot: true } });
    expect(w.classes()).toContain('is-solid');
    expect(w.classes()).not.toContain('lu-glass-ultrathin');
    expect(w.find('.lu-badge-dot').exists()).toBe(true);
  });
});

describe('GlassAlert', () => {
  it('uses role=alert for errors and role=status otherwise', () => {
    expect(mount(GlassAlert, { props: { tone: 'error' } }).attributes('role')).toBe('alert');
    expect(mount(GlassAlert, { props: { tone: 'info' } }).attributes('role')).toBe('status');
  });

  it('emits dismiss from the close button only when dismissible', async () => {
    expect(mount(GlassAlert).find('.lu-alert-close').exists()).toBe(false);
    const w = mount(GlassAlert, { props: { dismissible: true } });
    await w.get('.lu-alert-close').trigger('click');
    expect(w.emitted('dismiss')).toHaveLength(1);
  });

  it('is a regular-glass surface', () => {
    expect(mount(GlassAlert).classes()).toContain('lu-glass');
  });
});
