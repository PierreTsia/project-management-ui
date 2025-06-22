import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryProvider } from '@/providers/QueryProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';

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
        <QueryProvider>
          <MemoryRouter initialEntries={entries} initialIndex={initialIndex}>
            {children}
          </MemoryRouter>
        </QueryProvider>
      </ErrorBoundary>
    );
  }

  // If URL is provided, render the full app with that route (page-level testing)
  if (url) {
    const pathname = url.startsWith('?') ? url.slice(1) : url;
    const entries = [`/${pathname}`];

    return (
      <ErrorBoundary>
        <QueryProvider>
          <MemoryRouter initialEntries={entries} initialIndex={0}>
            <Layout />
          </MemoryRouter>
        </QueryProvider>
      </ErrorBoundary>
    );
  }

  // Default: render the full app with dashboard
  return (
    <ErrorBoundary>
      <QueryProvider>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <Layout />
        </MemoryRouter>
      </QueryProvider>
    </ErrorBoundary>
  );
};
