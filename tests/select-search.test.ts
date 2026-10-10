import { describe, expect, it } from 'vitest';
import {
  SELECT_MENU_VIEWPORT_GUTTER, SELECT_SEARCH_THRESHOLD, filterSelectOptions, initialVisibleOption,
  isSelectSearchable, isTypeToSearchKey, nextVisibleOption, selectLabelRuns,
} from '../src/glass/selectSearch';
import { SELECT_SEARCH_THRESHOLD as publicExport } from '../src/react/index';

const zones = [
  { value: 'Europe/Berlin', label: 'Europe/Berlin' },
  { value: 'Europe/London', label: 'Europe/London', disabled: true },
  { value: 'America/New_York', label: 'America/New York' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
];

describe('select search threshold', () => {
  it('searches above the exported threshold unless the prop decides', () => {
    expect(SELECT_SEARCH_THRESHOLD).toBe(8);
    expect(publicExport).toBe(SELECT_SEARCH_THRESHOLD);
    expect(isSelectSearchable(SELECT_SEARCH_THRESHOLD)).toBe(false);
    expect(isSelectSearchable(SELECT_SEARCH_THRESHOLD + 1)).toBe(true);
    expect(isSelectSearchable(2, true)).toBe(true);
    expect(isSelectSearchable(50, false)).toBe(false);
  });
});

describe('filterSelectOptions', () => {
  it('keeps every option for an empty or blank query', () => {
    expect(filterSelectOptions(zones, '')).toEqual([0, 1, 2, 3, 4]);
    expect(filterSelectOptions(zones, '   ')).toEqual([0, 1, 2, 3, 4]);
  });

  it('matches a case-insensitive substring of the label or the value', () => {
    expect(filterSelectOptions(zones, 'EUROPE')).toEqual([0, 1, 4]);
    expect(filterSelectOptions(zones, 'new york')).toEqual([2]);
    expect(filterSelectOptions(zones, 'new_york')).toEqual([2]);
    expect(filterSelectOptions(zones, ' tokyo ')).toEqual([3]);
    expect(filterSelectOptions(zones, 'mars')).toEqual([]);
  });
});

describe('selectLabelRuns', () => {
  it('marks every non-overlapping occurrence in the label as written', () => {
    expect(selectLabelRuns('Banana', 'AN')).toEqual([
      { text: 'B', match: false }, { text: 'an', match: true }, { text: 'an', match: true }, { text: 'a', match: false },
    ]);
    expect(selectLabelRuns('Europe/Berlin', 'europe')).toEqual([{ text: 'Europe', match: true }, { text: '/Berlin', match: false }]);
  });

  it('returns the label whole for no query, no match, or a label whose case folding changes length', () => {
    expect(selectLabelRuns('Asia/Tokyo', '')).toEqual([{ text: 'Asia/Tokyo', match: false }]);
    expect(selectLabelRuns('Asia/Tokyo', 'paris')).toEqual([{ text: 'Asia/Tokyo', match: false }]);
    expect(selectLabelRuns('İstanbul', 'stan')).toEqual([{ text: 'İstanbul', match: false }]);
  });
});

describe('navigation over the visible options', () => {
  const visible = filterSelectOptions(zones, 'europe');

  it('steps through visible enabled options and wraps once', () => {
    expect(nextVisibleOption(zones, visible, 0, 1)).toBe(4);
    expect(nextVisibleOption(zones, visible, 4, 1)).toBe(0);
    expect(nextVisibleOption(zones, visible, 0, -1)).toBe(4);
  });

  it('enters from outside the visible set at either end', () => {
    expect(nextVisibleOption(zones, visible, -1, 1)).toBe(0);
    expect(nextVisibleOption(zones, visible, 3, -1)).toBe(4);
  });

  it('has nothing to step to when no visible option is enabled', () => {
    expect(nextVisibleOption(zones, [], -1, 1)).toBe(-1);
    expect(nextVisibleOption(zones, [1], -1, 1)).toBe(-1);
  });

  it('starts on the chosen value when it is visible and enabled', () => {
    expect(initialVisibleOption(zones, visible, 'Europe/Paris')).toBe(4);
    expect(initialVisibleOption(zones, visible, 'Asia/Tokyo')).toBe(0);
    expect(initialVisibleOption(zones, visible, 'Europe/London')).toBe(0);
  });
});

describe('isTypeToSearchKey', () => {
  it('accepts one printed character without a command modifier', () => {
    expect(isTypeToSearchKey({ key: 'b' })).toBe(true);
    expect(isTypeToSearchKey({ key: 'É' })).toBe(true);
    expect(isTypeToSearchKey({ key: '7', altKey: false })).toBe(true);
  });

  it('rejects Space, named keys and modified keys', () => {
    for (const key of [' ', 'Enter', 'ArrowDown', 'Escape', 'Tab', 'Dead', 'Process']) expect(isTypeToSearchKey({ key }), key).toBe(false);
    expect(isTypeToSearchKey({ key: 'b', ctrlKey: true })).toBe(false);
    expect(isTypeToSearchKey({ key: 'b', metaKey: true })).toBe(false);
    expect(isTypeToSearchKey({ key: 'b', altKey: true })).toBe(false);
  });
});
