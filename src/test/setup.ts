import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

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
