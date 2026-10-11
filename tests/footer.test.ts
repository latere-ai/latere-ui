import { describe, expect, it } from 'vitest';
import { en, zh, de } from '../src/i18n/footer';

// The bundled footer dictionaries. The rendered footer is covered in
// src/react/__tests__/site-footer.test.tsx.
describe('footer dictionaries', () => {
  it.each(Object.entries({ zh, de }))('%s has the same keys as English', (_locale, dict) => {
    expect(Object.keys(dict).sort()).toEqual(Object.keys(en).sort());
  });

  // The lineup lists the chat as Latere Chat, a proper name in every locale,
  // so it reads apart from the company's name beside it.
  it.each(Object.entries({ en, zh, de }))('%s names the chat Latere Chat', (_locale, dict) => {
    expect(dict['footer.products.chat']).toBe('Latere Chat');
  });

  it('names the product catalog in each language', () => {
    expect([en, zh, de].map(d => d['footer.products'])).toEqual(['Products', '产品', 'Produkte']);
  });

  // Wallfacer left the lineup, so no footer copy names it.
  it.each(Object.entries({ en, zh, de }))('%s carries no Wallfacer label', (_locale, dict) => {
    expect(Object.keys(dict)).not.toContain('footer.products.wallfacer');
    expect(Object.values(dict)).not.toContain('Wallfacer');
  });

  it.each(Object.entries({ en, zh, de }))('%s names no retired Lectio service', (_locale, dict) => {
    expect(Object.keys(dict)).not.toContain('footer.products.lectio');
    expect(Object.values(dict)).not.toContain('Lectio');
  });

  it.each(Object.entries({ en, zh, de }))('%s has no blank translations', (locale, dict) => {
    for (const [key, value] of Object.entries(dict)) {
      expect(value.trim(), `${locale}: ${key}`).not.toBe('');
    }
  });
});
