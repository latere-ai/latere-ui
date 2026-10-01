import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import GlassSelect from '../src/components/GlassSelect.vue';
import GlassModal from '../src/components/GlassModal.vue';
import { SELECT_SEARCH_THRESHOLD } from '../src/glass/selectSearch';
import type { SelectOption } from '../src/glass/types';

const zones: SelectOption[] = [
  { value: 'Europe/Berlin', label: 'Europe/Berlin' },
  { value: 'Europe/London', label: 'Europe/London', disabled: true },
  { value: 'America/New_York', label: 'America/New York' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
  { value: 'America/Chicago', label: 'America/Chicago' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
];
const count = (n: number) => Array.from({ length: n }, (_, i) => ({ value: String(i), label: `Option ${i}` }));

let mounted: VueWrapper | undefined;
function render(props: Record<string, unknown>) {
  mounted = mount(GlassSelect, { props: { modelValue: '', options: zones, ...props }, attachTo: document.body });
  return mounted;
}
afterEach(() => { mounted?.unmount(); mounted = undefined; vi.restoreAllMocks(); });

const field = () => document.querySelector<HTMLInputElement>('.lu-select-search');
const labels = () => [...document.querySelectorAll('.lu-select-option')].map((li) => li.textContent);
const activeLabel = () => document.querySelector('.lu-select-option.is-active')?.textContent;
async function typeInto(text: string) {
  const input = field()!;
  input.value = text;
  input.dispatchEvent(new Event('input'));
  await nextTick();
}
async function press(target: Element, key: string, init: KeyboardEventInit = {}) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
  await nextTick();
  await nextTick();
}

describe('GlassSelect search (vue)', () => {
  it('shows the field above the threshold, and the prop overrides the count', async () => {
    const w = render({ options: count(SELECT_SEARCH_THRESHOLD) });
    await w.get('button').trigger('click');
    expect(field()).toBeNull();
    await w.get('button').trigger('click');
    await w.setProps({ options: count(SELECT_SEARCH_THRESHOLD + 1) });
    await w.get('button').trigger('click');
    expect(field()).not.toBeNull();
    await w.get('button').trigger('click');
    await w.setProps({ searchable: false });
    await w.get('button').trigger('click');
    expect(field()).toBeNull();
    await w.get('button').trigger('click');
    await w.setProps({ options: count(2), searchable: true });
    await w.get('button').trigger('click');
    expect(field()).not.toBeNull();
  });

  it('focuses a combobox field that controls the listbox and names the active option', async () => {
    const w = render({ modelValue: 'Asia/Tokyo', searchPlaceholder: 'Find a time zone' });
    const trigger = w.get('button').element;
    await w.get('button').trigger('click');
    await nextTick();
    const input = field()!;
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-label')).toBe('Find a time zone');
    expect(input.placeholder).toBe('Find a time zone');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    const list = document.getElementById(input.getAttribute('aria-controls')!)!;
    expect(list.getAttribute('role')).toBe('listbox');
    expect(document.getElementById(input.getAttribute('aria-activedescendant')!)!.textContent).toBe('Asia/Tokyo');
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
    expect(trigger.getAttribute('aria-controls')).toBe(list.id);
  });

  it('filters by label or value, ignoring case, and marks the matched text', async () => {
    const w = render({});
    await w.get('button').trigger('click');
    await typeInto('EUROPE');
    expect(labels()).toEqual(['Europe/Berlin', 'Europe/London', 'Europe/Paris']);
    expect([...document.querySelectorAll('.lu-select-match')].map((m) => m.textContent)).toEqual(['Europe', 'Europe', 'Europe']);
    // A highlighted row keeps its whole label as its accessible name.
    expect(document.querySelector('.lu-select-option')!.getAttribute('aria-label')).toBe('Europe/Berlin');
    await typeInto('new_york');
    expect(labels()).toEqual(['America/New York']);
    expect(document.querySelector('.lu-select-match')).toBeNull();
    expect(document.querySelector('.lu-select-option')!.hasAttribute('aria-label')).toBe(false);
    await typeInto('');
    expect(labels()).toHaveLength(zones.length);
  });

  it('moves through the filtered list with the arrows and chooses with Enter', async () => {
    const w = render({ modelValue: 'Asia/Tokyo' });
    const trigger = w.get('button').element;
    await w.get('button').trigger('click');
    await nextTick();
    expect(activeLabel()).toBe('Asia/Tokyo');
    await typeInto('europe');
    expect(activeLabel()).toBe('Europe/Berlin');
    await press(field()!, 'ArrowDown');
    expect(activeLabel()).toBe('Europe/Paris');
    await press(field()!, 'ArrowDown');
    expect(activeLabel()).toBe('Europe/Berlin');
    await press(field()!, 'ArrowUp');
    expect(activeLabel()).toBe('Europe/Paris');
    expect(document.getElementById(field()!.getAttribute('aria-activedescendant')!)!.textContent).toBe('Europe/Paris');
    await press(field()!, 'Enter');
    expect(w.emitted('update:modelValue')).toEqual([['Europe/Paris']]);
    expect(field()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('clears the search on the first Escape and closes on the second', async () => {
    const w = render({});
    const trigger = w.get('button').element;
    await w.get('button').trigger('click');
    await nextTick();
    await typeInto('asia');
    await press(field()!, 'Escape');
    expect(field()!.value).toBe('');
    expect(labels()).toHaveLength(zones.length);
    await press(field()!, 'Escape');
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  it('opens with the typed character from a focused, closed trigger', async () => {
    const w = render({});
    const trigger = w.get('button').element;
    trigger.focus();
    await press(trigger, 'k');
    await nextTick();
    expect(field()!.value).toBe('k');
    expect(document.activeElement).toBe(field());
    expect(labels()).toEqual(['America/New York', 'Asia/Tokyo', 'Asia/Kolkata']);
    expect(activeLabel()).toBe('America/New York');
  });

  it('ignores modified keys, and typing on a select without a field', async () => {
    const w = render({});
    const trigger = w.get('button').element;
    await press(trigger, 'k', { ctrlKey: true });
    await press(trigger, 'k', { metaKey: true });
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    await w.setProps({ searchable: false });
    await press(trigger, 'k');
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    await press(trigger, ' ');
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
  });

  it('moves typing on the open trigger into the field', async () => {
    const w = render({});
    await w.get('button').trigger('click');
    await nextTick();
    const trigger = w.get('button').element;
    trigger.focus();
    await press(trigger, 't');
    await press(trigger, 'o');
    expect(field()!.value).toBe('to');
    expect(document.activeElement).toBe(field());
    expect(labels()).toEqual(['Asia/Tokyo']);
  });

  it('says so in one line when nothing matches, and Enter does nothing', async () => {
    const w = render({ noMatchLabel: 'No time zone matches' });
    await w.get('button').trigger('click');
    await nextTick();
    await typeInto('mars');
    expect(labels()).toEqual([]);
    expect(document.querySelector('.lu-select-empty')!.textContent).toBe('No time zone matches');
    expect(field()!.hasAttribute('aria-activedescendant')).toBe(false);
    await press(field()!, 'Enter');
    expect(w.emitted('update:modelValue')).toBeUndefined();
    await typeInto('   ');
    expect(document.querySelector('.lu-select-empty')).toBeNull();
  });

  it('chooses with the pointer without taking focus from the field, and titles each row', async () => {
    const w = render({});
    await w.get('button').trigger('click');
    await nextTick();
    const row = [...document.querySelectorAll<HTMLElement>('.lu-select-option')].find((li) => li.textContent === 'Africa/Cairo')!;
    expect(row.title).toBe('Africa/Cairo');
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    row.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    const inField = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    field()!.dispatchEvent(inField);
    expect(inField.defaultPrevented).toBe(false);
    row.click();
    await nextTick();
    expect(w.emitted('update:modelValue')).toEqual([['Africa/Cairo']]);
    expect(document.activeElement).toBe(w.get('button').element);
  });

  it('makes the hovered enabled row of a filtered list active', async () => {
    const w = render({});
    await w.get('button').trigger('click');
    await nextTick();
    await typeInto('europe');
    const rows = [...document.querySelectorAll<HTMLElement>('.lu-select-option')];
    rows[2].dispatchEvent(new MouseEvent('mouseenter'));
    await nextTick();
    expect(activeLabel()).toBe('Europe/Paris');
    rows[1].dispatchEvent(new MouseEvent('mouseenter'));
    await nextTick();
    expect(activeLabel()).toBe('Europe/Paris');
  });

  it('closes when focus leaves the control, and stays open when it moves inside', async () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    try {
      const w = render({});
      await w.get('button').trigger('click');
      await nextTick();
      field()!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: w.get('button').element }));
      await nextTick();
      expect(field()).not.toBeNull();
      field()!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }));
      await nextTick();
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    } finally { outside.remove(); }
  });

  it('holds its widest width and moves left to stay inside the viewport', async () => {
    const w = render({});
    const root = w.element as HTMLElement;
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000);
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({ left: 800 } as DOMRect);
    const width = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 300 } as DOMRect);
    await w.get('button').trigger('click');
    await nextTick();
    await nextTick();
    const panel = document.querySelector<HTMLElement>('.lu-select-list')!;
    expect(panel.classList.contains('is-searchable')).toBe(true);
    expect(panel.style.minWidth).toBe('300px');
    expect(panel.style.left).toBe('-116px');
    width.mockReturnValue({ width: 180 } as DOMRect);
    await typeInto('asia');
    await nextTick();
    expect(panel.style.minWidth).toBe('300px');
  });
});

describe('GlassSelect inside a modal (vue)', () => {
  it('takes Escape for its own menu and leaves the dialog open', async () => {
    const closed = vi.fn();
    const Host = defineComponent(() => {
      const value = ref('');
      return () => h(GlassModal, { open: true, title: 'Schedule', 'onUpdate:open': closed }, {
        default: () => h(GlassSelect, { modelValue: value.value, options: zones, ariaLabel: 'Time zone' }),
      });
    });
    const w = mount(Host, { attachTo: document.body });
    try {
      await nextTick();
      const trigger = document.querySelector<HTMLButtonElement>('.lu-select-trigger')!;
      trigger.click();
      await nextTick();
      await nextTick();
      await typeInto('asia');
      await press(field()!, 'Escape');
      expect(field()!.value).toBe('');
      await press(field()!, 'Escape');
      expect(document.querySelector('[role="listbox"]')).toBeNull();
      expect(closed).not.toHaveBeenCalled();
      await press(trigger, 'Escape');
      expect(closed).toHaveBeenCalledWith(false);
    } finally { w.unmount(); }
  });
});
