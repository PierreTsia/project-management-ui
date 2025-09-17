import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Import translation files
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

// Create a test-specific i18n instance
const testI18n = i18n.createInstance();

testI18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: 'en', // Force English for tests
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  // Disable language detection in tests
  detection: {
    order: [],
    caches: [],
  },
});

interface TestWrapperProps {
  children: React.ReactNode;
}

/**
 * TestWrapper (formerly TestApp) - Component wrapper for isolated component testing
 *
 * Use this wrapper when testing individual components that need providers but don't
 * need full page routing. For page-level testing with real routing, use TestAppWithRouting.
 *
 * Provides:
 * - Error boundary for safe component testing
 * - Theme provider for theme context
 * - i18n provider with test-specific instance
 * - React Query provider for data fetching
 * - Memory router for components that use router hooks
 */
export const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nextProvider i18n={testI18n}>
          <QueryProvider>
            <MemoryRouter initialEntries={['/']} initialIndex={0}>
              {children}
            </MemoryRouter>
          </QueryProvider>
        </I18nextProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
