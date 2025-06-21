import { test, expect } from 'vitest';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

function getAllKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      return getAllKeys(value, fullKey);
    }
    return [fullKey];
  });
}

test('All i18n keys in en exist in fr and vice versa', () => {
  const enKeys = getAllKeys(en);
  const frKeys = getAllKeys(fr);

  const missingInFr = enKeys.filter(key => !frKeys.includes(key));
  const missingInEn = frKeys.filter(key => !enKeys.includes(key));

  expect(missingInFr, `Missing in fr: ${missingInFr.join(', ')}`).toEqual([]);
  expect(missingInEn, `Missing in en: ${missingInEn.join(', ')}`).toEqual([]);
});
