import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import fr from './locales/fr.json';

// Define supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]['code'];

// Create resources object dynamically
const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Enable pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag'],

      // Keys or params to lookup language from
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,

      // Cache user language on
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'], // Languages to not persist

      // Optional htmlTag with lang attribute
      htmlTag: document.documentElement,

      // Optional set cookie options
      cookieOptions: { path: '/', sameSite: 'strict' },
    },
  });

export default i18n;
