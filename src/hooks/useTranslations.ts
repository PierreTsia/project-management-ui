import en from '../locales/en.json';
import { useTranslation } from 'react-i18next';
import { type SupportedLanguage } from '../i18n';

// Automatically infer translation keys from the English translation file
type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K]>}`
    : K;
}[keyof T & (string | number)];

export type TranslationKey = NestedKeyOf<typeof en>;

export function useTranslations() {
  const { t, i18n } = useTranslation();

  const translate = (
    key: TranslationKey,
    options?: Record<string, unknown>
  ) => {
    return t(key, options ?? {});
  };

  const changeLanguage = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng);
  };

  return {
    t: translate,
    i18n,
    changeLanguage,
    currentLanguage: i18n.language as SupportedLanguage,
  };
}
