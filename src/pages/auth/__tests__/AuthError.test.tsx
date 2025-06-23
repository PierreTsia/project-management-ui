import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TestAppWithRouting } from '@/test/TestAppWithRouting';

// Override the useUser mock from TestAppWithRouting for auth pages
vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    data: null, // No authenticated user for auth error page
    isLoading: false,
  }),
}));

describe('AuthError Page', () => {
  const renderWithProviders = (searchParams = '') => {
    return render(<TestAppWithRouting url={`/auth/error${searchParams}`} />);
  };

  it('should render error page with default message when no error message provided', () => {
    renderWithProviders();

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(
      screen.getByText('There was a problem with your authentication.')
    ).toBeInTheDocument();
    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText('Unknown error occurred')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to Login' })
    ).toBeInTheDocument();
  });

  it('should display custom error message from URL params', () => {
    renderWithProviders('?message=Google%20login%20failed');

    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(
      screen.getByText('There was a problem with your authentication.')
    ).toBeInTheDocument();
    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText('Google login failed')).toBeInTheDocument();
  });

  it('should decode URL-encoded error messages', () => {
    renderWithProviders('?message=Token%20generation%20failed');

    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText('Token generation failed')).toBeInTheDocument();
  });

  it('should have correct link to login page', () => {
    renderWithProviders('?message=Some%20error');

    const loginLink = screen.getByRole('link', { name: 'Back to Login' });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.getAttribute('href')).toBe('/login');
  });

  it('should render error icon', () => {
    renderWithProviders();

    // Check for the AlertCircle icon by looking for the SVG with the correct class
    const errorIcon = document.querySelector('.text-destructive');
    expect(errorIcon).toBeInTheDocument();
  });

  it('should handle complex error messages with special characters', () => {
    const complexMessage =
      'Authentication failed: Invalid credentials & session expired';
    const encodedMessage = encodeURIComponent(complexMessage);

    renderWithProviders(`?message=${encodedMessage}`);

    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText(complexMessage)).toBeInTheDocument();
  });
});
