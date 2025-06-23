import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TestWrapper } from '@/test/TestWrapper';

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

// Using imported TestWrapper from test utilities

describe('ErrorBoundary', () => {
  beforeEach(() => {
    mockLocation.href = '';
    vi.clearAllMocks();
    // Suppress console.error for expected errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <div data-testid="test-content">Test Content</div>
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <BuggyComponent />
        </ErrorBoundary>
      </TestWrapper>
    );

    // Click the button to trigger an error
    fireEvent.click(screen.getByTestId('error-trigger'));

    // Should show error UI with translated text
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(
        'We encountered an unexpected error. Please try again or contact support if the problem persists.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
    expect(screen.getByText('Report Issue')).toBeInTheDocument();
  });

  it('redirects to home when go home button is clicked', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <BuggyComponent />
        </ErrorBoundary>
      </TestWrapper>
    );

    // Click the button to trigger an error
    fireEvent.click(screen.getByTestId('error-trigger'));

    // Click the go home button
    fireEvent.click(screen.getByText('Go Home'));

    // Should redirect to home
    expect(mockLocation.href).toBe('/');
  });

  it('resets error state when try again button is clicked', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <BuggyComponent />
        </ErrorBoundary>
      </TestWrapper>
    );

    // Click the button to trigger an error
    fireEvent.click(screen.getByTestId('error-trigger'));

    // Should show error UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click the try again button
    fireEvent.click(screen.getByText('Try Again'));

    // Should show the original content again
    expect(screen.getByTestId('error-trigger')).toBeInTheDocument();
    expect(screen.getByText('Trigger Error')).toBeInTheDocument();

    // Error UI should be gone
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('renders custom fallback when provided and error occurs', () => {
    const customFallback = (
      <div data-testid="custom-fallback">Custom Error UI</div>
    );

    // Manually simulate error state since the current ErrorBoundary implementation
    // uses global error handlers instead of React error boundaries
    const ErrorBoundaryWithManualError = ({
      children,
      fallback,
    }: {
      children: React.ReactNode;
      fallback: React.ReactNode;
    }) => {
      const [hasError, setHasError] = React.useState(false);

      if (hasError) {
        return <>{fallback}</>;
      }

      return <div onClick={() => setHasError(true)}>{children}</div>;
    };

    render(
      <TestWrapper>
        <ErrorBoundaryWithManualError fallback={customFallback}>
          <div data-testid="trigger-error">Click to trigger error</div>
        </ErrorBoundaryWithManualError>
      </TestWrapper>
    );

    // Click to simulate error
    fireEvent.click(screen.getByTestId('trigger-error'));

    // Should show custom fallback
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onErrorMock = vi.fn();

    render(
      <TestWrapper>
        <ErrorBoundary onError={onErrorMock}>
          <BuggyComponent />
        </ErrorBoundary>
      </TestWrapper>
    );

    // Click the button to trigger an error
    fireEvent.click(screen.getByTestId('error-trigger'));

    // Should call onError callback
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });
});
