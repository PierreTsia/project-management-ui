import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TestApp } from '@/test/TestApp';
import AuthError from '../AuthError';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(window.location.search)],
  };
});

describe('AuthError Page', () => {
  const renderWithProviders = (searchParams = '') => {
    // Mock window.location.search
    Object.defineProperty(window, 'location', {
      value: { search: searchParams },
      writable: true,
    });

    return render(
      <TestApp initialEntries={[`/auth/error${searchParams}`]}>
        <AuthError />
      </TestApp>
    );
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
