import { type SupportedLanguage } from '../i18n';

/**
 * Type-safe way to check if a language is supported
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return ['en', 'fr'].includes(lang);
}

/**
 * Get the display name for a language code
 */
export function getLanguageName(code: SupportedLanguage): string {
  const names: Record<SupportedLanguage, string> = {
    en: 'English',
    fr: 'Français',
  };
  return names[code];
}

/**
 * Get the flag emoji for a language code
 */
export function getLanguageFlag(code: SupportedLanguage): string {
  const flags: Record<SupportedLanguage, string> = {
    en: '🇺🇸',
    fr: '🇫🇷',
  };
  return flags[code];
}

/**
 * Validate that all translation files have the same structure
 */
export function validateTranslationStructure(
  baseTranslations: Record<string, unknown>,
  translations: Record<string, unknown>,
  path = ''
): string[] {
  const errors: string[] = [];

  for (const key in baseTranslations) {
    const fullPath = path ? `${path}.${key}` : key;

    if (!(key in translations)) {
      errors.push(`Missing key: ${fullPath}`);
      continue;
    }

    const baseValue = baseTranslations[key];
    const translationValue = translations[key];

    if (typeof baseValue !== typeof translationValue) {
      errors.push(
        `Type mismatch at ${fullPath}: expected ${typeof baseValue}, got ${typeof translationValue}`
      );
      continue;
    }

    if (
      typeof baseValue === 'object' &&
      baseValue !== null &&
      translationValue !== null
    ) {
      errors.push(
        ...validateTranslationStructure(
          baseValue as Record<string, unknown>,
          translationValue as Record<string, unknown>,
          fullPath
        )
      );
    }
  }

  return errors;
}
