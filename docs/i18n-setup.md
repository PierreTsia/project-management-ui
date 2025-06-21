# Internationalization (i18n) Setup

This project uses [react-i18next](https://react.i18next.com/) for internationalization, which is based on the powerful i18next framework.

## Features

- ✅ **Automatic language detection** from browser, localStorage, and URL
- ✅ **Type-safe translations** with automatic TypeScript inference
- ✅ **Easy language switching** with a dropdown component
- ✅ **Persistent language preference** stored in localStorage
- ✅ **Fallback language** (English) for missing translations
- ✅ **Development debugging** with translation keys in development mode
- ✅ **Maintainable structure** with centralized configuration
- ✅ **Automatic type generation** from translation files

## File Structure

```
src/
├── i18n.ts                    # i18n configuration with supported languages
├── locales/
│   ├── en.json               # English translations (base file)
│   └── fr.json               # French translations
├── components/
│   └── LanguageSwitcher.tsx  # Language switcher component
├── hooks/
│   └── useTranslations.ts    # Custom hook with automatic type inference
├── utils/
│   └── i18n-helpers.ts       # Utility functions for i18n management
└── types/
    └── json.d.ts             # TypeScript declarations for JSON imports
```

## Usage

### Basic Translation

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t('dashboard.title')}</h1>;
}
```

### Using the Custom Hook (Recommended)

```tsx
import { useTranslations } from '@/hooks/useTranslations';

function MyComponent() {
  const { t } = useTranslations();

  return <h1>{t('dashboard.title')}</h1>;
}
```

### Language Switching

```tsx
import { useTranslations } from '@/hooks/useTranslations';

function MyComponent() {
  const { changeLanguage, currentLanguage } = useTranslations();

  return <button onClick={() => changeLanguage('fr')}>Switch to French</button>;
}
```

### Using the LanguageSwitcher Component

```tsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <LanguageSwitcher />
    </header>
  );
}
```

## Adding New Languages

1. **Create translation file**: Add a new file in `src/locales/` (e.g., `de.json`)
2. **Update i18n config**: Add the language to `supportedLanguages` in `src/i18n.ts`
3. **Update utilities**: Add the language to the helper functions in `src/utils/i18n-helpers.ts`
4. **Validate structure**: Use the validation utility to ensure consistency

Example adding German:

```tsx
// src/i18n.ts
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }, // Add this
] as const;

// Add to resources
const resources = {
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de }, // Add this
};
```

## Adding New Translation Keys

1. **Add to base file**: Add the key to `src/locales/en.json`
2. **Add to other languages**: Add the same key to all other language files
3. **TypeScript auto-updates**: The `TranslationKey` type automatically updates!

No need to manually update TypeScript types - they're automatically inferred from the English translation file.

## Configuration Options

The i18n configuration in `src/i18n.ts` includes:

- **Language Detection**: Automatically detects user's preferred language
- **Persistence**: Saves language preference in localStorage
- **Fallback**: Uses English as fallback for missing translations
- **Debug Mode**: Shows translation keys in development
- **Interpolation**: Supports variable interpolation in translations
- **Centralized Config**: All supported languages defined in one place

## Best Practices

1. **Use the custom hook** (`useTranslations`) for type safety
2. **Organize translations** by feature/component
3. **Use semantic keys** instead of hardcoded text
4. **Test translations** in all supported languages
5. **Keep translations consistent** across the application
6. **Use the English file as the base** for all other languages
7. **Validate translation structure** using the provided utilities

## Validation

Use the validation utility to ensure all translation files have the same structure:

```tsx
import { validateTranslationStructure } from '@/utils/i18n-helpers';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

const errors = validateTranslationStructure(en, fr);
if (errors.length > 0) {
  console.error('Translation structure errors:', errors);
}
```

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Translation Management Tools](https://locize.com/)
