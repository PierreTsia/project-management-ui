import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestApp } from '@/test/TestApp';
import EmailConfirmation from '../EmailConfirmation';

// Mock the useAuth hook
const mockConfirmEmail = vi.fn();
const mockUseConfirmEmail = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useConfirmEmail: () => mockUseConfirmEmail(),
}));

// Mock useTranslations hook
const mockT = vi.fn();
vi.mock('@/hooks/useTranslations', () => ({
  useTranslations: () => ({ t: mockT }),
}));

// Mock react-router-dom navigate only
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('EmailConfirmation Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set default mock implementation
    mockUseConfirmEmail.mockReturnValue({
      mutate: mockConfirmEmail,
    });

    // Set up translation mock - make it stable
    mockT.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        'auth.confirmation.noTokenError': 'No confirmation token provided.',
        'auth.confirmation.confirming': 'Confirming...',
        'auth.confirmation.processing': 'Processing your confirmation...',
      };
      return translations[key] || key;
    });
  });

  describe('Token Validation Business Logic', () => {
    it('should redirect to error page when no token is provided', async () => {
      render(
        <TestApp initialEntries={['/confirm-email']}>
          <EmailConfirmation />
        </TestApp>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/confirm-email-error?message=No%20confirmation%20token%20provided.'
        );
      });
      expect(mockConfirmEmail).not.toHaveBeenCalled();
    });

    it('should call confirmEmail when valid token is provided', () => {
      const token = 'valid-token-123';

      render(
        <TestApp initialEntries={[`/confirm-email?token=${token}`]}>
          <EmailConfirmation />
        </TestApp>
      );

      expect(mockConfirmEmail).toHaveBeenCalledWith({ token });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should prevent multiple API calls for the same token', async () => {
      const token = 'same-token-123';

      // First render
      const { rerender } = render(
        <TestApp initialEntries={[`/confirm-email?token=${token}`]}>
          <EmailConfirmation />
        </TestApp>
      );

      expect(mockConfirmEmail).toHaveBeenCalledTimes(1);
      expect(mockConfirmEmail).toHaveBeenCalledWith({ token });

      // Re-render with same token (simulates component re-render)
      rerender(
        <TestApp initialEntries={[`/confirm-email?token=${token}`]}>
          <EmailConfirmation />
        </TestApp>
      );

      // Should not call confirmEmail again
      expect(mockConfirmEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('should display loading state while processing', () => {
      const token = 'processing-token';

      render(
        <TestApp initialEntries={[`/confirm-email?token=${token}`]}>
          <EmailConfirmation />
        </TestApp>
      );

      // Check loading content
      expect(screen.getByText('Confirming...')).toBeInTheDocument();
      expect(
        screen.getByText('Processing your confirmation...')
      ).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty token parameter', async () => {
      render(
        <TestApp initialEntries={['/confirm-email?token=']}>
          <EmailConfirmation />
        </TestApp>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/confirm-email-error?message=No%20confirmation%20token%20provided.'
        );
      });
    });

    it('should handle malformed URL parameters', async () => {
      render(
        <TestApp initialEntries={['/confirm-email?other-param=value']}>
          <EmailConfirmation />
        </TestApp>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/confirm-email-error?message=No%20confirmation%20token%20provided.'
        );
      });
    });
  });

  describe('Component Functionality', () => {
    it('should render without errors', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <TestApp initialEntries={['/confirm-email?token=test-token']}>
          <EmailConfirmation />
        </TestApp>
      );

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
