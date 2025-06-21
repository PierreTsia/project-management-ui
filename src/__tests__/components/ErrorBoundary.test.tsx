import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Simple component that throws an error when clicked
const BuggyComponent = () => {
  const handleClick = () => {
    throw new Error('Test error for ErrorBoundary');
  };

  return (
    <button onClick={handleClick} data-testid="error-trigger">
      Trigger Error
    </button>
  );
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    mockLocation.href = '';
    vi.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="test-content">Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    // Click the button to trigger an error
    fireEvent.click(screen.getByTestId('error-trigger'));

    // Should show error UI with translation keys (since i18n isn't set up in test)
    expect(screen.getByText('errorBoundary.title')).toBeInTheDocument();
    expect(screen.getByText('errorBoundary.description')).toBeInTheDocument();
    expect(screen.getByText('errorBoundary.tryAgain')).toBeInTheDocument();
    expect(screen.getByText('errorBoundary.goHome')).toBeInTheDocument();
    expect(screen.getByText('errorBoundary.reportIssue')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('redirects to home when go home button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    // Click the button to trigger an error
    fireEvent.click(screen.getByTestId('error-trigger'));

    // Click the go home button
    fireEvent.click(screen.getByText('errorBoundary.goHome'));

    // Should redirect to home
    expect(mockLocation.href).toBe('/');

    consoleSpy.mockRestore();
  });

  it('resets error state when try again button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    // Click the button to trigger an error
    fireEvent.click(screen.getByTestId('error-trigger'));

    // Should show error UI
    expect(screen.getByText('errorBoundary.title')).toBeInTheDocument();

    // Click the try again button
    fireEvent.click(screen.getByText('errorBoundary.tryAgain'));

    // Should show the original content again
    expect(screen.getByTestId('error-trigger')).toBeInTheDocument();
    expect(screen.getByText('Trigger Error')).toBeInTheDocument();

    // Error UI should be gone
    expect(screen.queryByText('errorBoundary.title')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
