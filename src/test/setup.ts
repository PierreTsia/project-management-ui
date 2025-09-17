import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';
import type { User } from '@/types/user';

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  root = null;
  rootMargin = '';
  thresholds = [];
  takeRecords() {
    return [];
  }
}

// Mock ResizeObserver
class MockResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.ResizeObserver = MockResizeObserver as any;

// Mock pointer capture methods for Radix UI components
// These are needed because JSDOM doesn't implement these DOM APIs
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  value: vi.fn(() => false),
  writable: true,
});

Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  value: vi.fn(),
  writable: true,
});

// Mock scrollIntoView for Radix UI Select components
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

// Mock window.scrollTo to avoid JSDOM not implemented errors (used by framer-motion)
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock URL.createObjectURL and revokeObjectURL used by file previews
if (!('createObjectURL' in URL)) {
  Object.defineProperty(URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:mock'),
    writable: true,
  });
}
if (!('revokeObjectURL' in URL)) {
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: vi.fn(),
    writable: true,
  });
}

// Mock Recharts ResponsiveContainer globally to avoid width/height warnings in JSDOM
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return Object.assign({}, actual, {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        'div',
        { style: { width: 800, height: 400 } },
        children
      );
    },
  });
});

// Global configurable mock for useUser; tests can override by
// mockUseUser.mockReturnValue({...}) within their suites
// This keeps existing tests green with a sensible default
// and avoids per-file hard mocks that are hard to override.

const mockUseUser = vi.fn();
// Provide a default authenticated user shape
const defaultUser: Partial<User> = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  provider: 'local',
  canChangePassword: true,
  isEmailConfirmed: true,
};
mockUseUser.mockReturnValue({ data: defaultUser, isLoading: false });

vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUseUser(),
}));

// Expose helper for tests that don't re-mock but want to tweak defaults
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__mockUseUser = mockUseUser;
