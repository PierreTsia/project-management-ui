import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { QueryProvider } from '@/providers/QueryProvider';
import App from '@/App';
import { vi } from 'vitest';

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
  lng: 'en',
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: [],
    caches: [],
  },
});

// Mock BrowserRouter to use MemoryRouter instead
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock the useUser hook since it makes API calls (required for ProtectedRoute)
vi.mock('../hooks/useUser', () => ({
  useUser: () => ({
    data: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
      provider: null,
      providerId: null,
      bio: null,
      dob: null,
      phone: null,
      isEmailConfirmed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    isLoading: false,
  }),
}));

// TestApp that uses the actual App component with MemoryRouter
interface TestAppWithRoutingProps {
  url: string;
  locationState?: Record<string, unknown>;
}

export const TestAppWithRouting: React.FC<TestAppWithRoutingProps> = ({
  url,
  locationState,
}) => {
  // Create initial entries with state if provided
  const initialEntries = locationState
    ? [{ pathname: url, state: locationState }]
    : [url];

  return (
    <I18nextProvider i18n={testI18n}>
      <QueryProvider>
        <MemoryRouter initialEntries={initialEntries} initialIndex={0}>
          <App />
        </MemoryRouter>
      </QueryProvider>
    </I18nextProvider>
  );
};
