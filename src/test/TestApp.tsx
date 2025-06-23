import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { QueryProvider } from '@/providers/QueryProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';

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

interface TestAppProps {
  children?: React.ReactNode;
  url?: string;
  initialEntries?: string[];
  initialIndex?: number;
  locationState?: Record<string, unknown>;
}

export const TestApp: React.FC<TestAppProps> = ({
  children,
  url,
  initialEntries = ['/'],
  initialIndex = 0,
  locationState,
}) => {
  // If children are provided, render them with providers (component-level testing)
  if (children) {
    // Transform initialEntries to include location state if provided
    const entries = locationState
      ? initialEntries.map(entry => ({ pathname: entry, state: locationState }))
      : initialEntries;

    return (
      <ErrorBoundary>
        <I18nextProvider i18n={testI18n}>
          <QueryProvider>
            <MemoryRouter initialEntries={entries} initialIndex={initialIndex}>
              {children}
            </MemoryRouter>
          </QueryProvider>
        </I18nextProvider>
      </ErrorBoundary>
    );
  }

  // If URL is provided, render the full app with that route (page-level testing)
  if (url) {
    // Handle URL paths properly - don't double slash
    const pathname = url.startsWith('/') ? url : `/${url}`;
    const entries = [pathname];

    return (
      <ErrorBoundary>
        <I18nextProvider i18n={testI18n}>
          <QueryProvider>
            <MemoryRouter initialEntries={entries} initialIndex={0}>
              <Layout />
            </MemoryRouter>
          </QueryProvider>
        </I18nextProvider>
      </ErrorBoundary>
    );
  }

  // Default: render the full app with dashboard
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={testI18n}>
        <QueryProvider>
          <MemoryRouter initialEntries={['/']} initialIndex={0}>
            <Layout />
          </MemoryRouter>
        </QueryProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
};
