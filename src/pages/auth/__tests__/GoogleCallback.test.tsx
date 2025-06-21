import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestApp } from '@/test/TestApp';
import GoogleCallback from '../GoogleCallback';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(window.location.search)],
  };
});

// Mock query client
const mockInvalidateQueries = vi.fn();
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

describe('GoogleCallback Page', () => {
  const renderWithProviders = (searchParams = '') => {
    // Mock window.location.search
    Object.defineProperty(window, 'location', {
      value: { search: searchParams },
      writable: true,
    });

    return render(
      <TestApp initialEntries={[`/auth/callback${searchParams}`]}>
        <GoogleCallback />
      </TestApp>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'removeItem');
  });

  it('should show loading state initially', () => {
    renderWithProviders(
      '?access_token=token123&refresh_token=refresh123&provider=google'
    );

    expect(
      screen.getByText('Completing authentication...')
    ).toBeInTheDocument();
    // Check for the loading spinner by looking for the SVG element with animate-spin class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should handle successful Google OAuth callback', async () => {
    renderWithProviders(
      '?access_token=token123&refresh_token=refresh123&provider=google'
    );

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'token123');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'refresh123'
      );
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['user'],
      });
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('should redirect to error page when access token is missing', async () => {
    renderWithProviders('?refresh_token=refresh123&provider=google');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/auth/error?message=Invalid callback parameters'
      );
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  it('should redirect to error page when refresh token is missing', async () => {
    renderWithProviders('?access_token=token123&provider=google');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/auth/error?message=Invalid callback parameters'
      );
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  it('should redirect to error page when provider is not google', async () => {
    renderWithProviders(
      '?access_token=token123&refresh_token=refresh123&provider=facebook'
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/auth/error?message=Invalid callback parameters'
      );
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  it('should redirect to error page when provider is missing', async () => {
    renderWithProviders('?access_token=token123&refresh_token=refresh123');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/auth/error?message=Invalid callback parameters'
      );
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  it('should redirect to error page when no query parameters are provided', async () => {
    renderWithProviders('');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/auth/error?message=Invalid callback parameters'
      );
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  it('should handle localStorage errors gracefully', async () => {
    // Mock localStorage.setItem to throw an error
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    // Mock console.error to avoid noise in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
      '?access_token=token123&refresh_token=refresh123&provider=google'
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error handling Google OAuth callback:',
        expect.any(Error)
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        '/auth/error?message=Failed to complete authentication'
      );
    });

    consoleSpy.mockRestore();
  });
});
