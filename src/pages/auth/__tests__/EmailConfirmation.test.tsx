import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '../../../test/TestAppWithRouting';

// Mock useUser to return null for auth pages
vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    data: null, // No authenticated user for auth pages
    isLoading: false,
  }),
}));

// Mock the useAuth hook
const mockConfirmEmail = vi.fn();
const mockUseConfirmEmail = vi.fn();
const mockUseResendConfirmation = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useConfirmEmail: () => mockUseConfirmEmail(),
  useResendConfirmation: () => mockUseResendConfirmation(),
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

    // Mock useResendConfirmation as well (used by ConfirmEmailError component)
    mockUseResendConfirmation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
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
      render(<TestAppWithRouting url="/confirm-email" />);

      // With TestAppWithRouting, the navigate actually works and shows the error page
      // Check that we end up on the error page instead of checking mockNavigate
      await waitFor(() => {
        expect(
          screen.getByText('No confirmation token provided.')
        ).toBeInTheDocument();
      });
      expect(mockConfirmEmail).not.toHaveBeenCalled();
    });

    it('should call confirmEmail when valid token is provided', () => {
      const token = 'valid-token-123';

      render(<TestAppWithRouting url={`/confirm-email?token=${token}`} />);

      expect(mockConfirmEmail).toHaveBeenCalledWith({ token });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should prevent multiple API calls for the same token', async () => {
      const token = 'same-token-123';

      // First render
      const { rerender } = render(
        <TestAppWithRouting url={`/confirm-email?token=${token}`} />
      );

      expect(mockConfirmEmail).toHaveBeenCalledTimes(1);
      expect(mockConfirmEmail).toHaveBeenCalledWith({ token });

      // Re-render with same token (simulates component re-render)
      rerender(<TestAppWithRouting url={`/confirm-email?token=${token}`} />);

      // Should not call confirmEmail again
      expect(mockConfirmEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('should display loading state while processing', () => {
      const token = 'processing-token';

      render(<TestAppWithRouting url={`/confirm-email?token=${token}`} />);

      // Check loading content
      expect(screen.getByText('Confirming...')).toBeInTheDocument();
      expect(
        screen.getByText('Processing your confirmation...')
      ).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty token parameter', async () => {
      render(<TestAppWithRouting url="/confirm-email?token=" />);

      await waitFor(() => {
        expect(
          screen.getByText('No confirmation token provided.')
        ).toBeInTheDocument();
      });
    });

    it('should handle malformed URL parameters', async () => {
      render(<TestAppWithRouting url="/confirm-email?other-param=value" />);

      await waitFor(() => {
        expect(
          screen.getByText('No confirmation token provided.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Component Functionality', () => {
    it('should render without errors', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<TestAppWithRouting url="/confirm-email?token=test-token" />);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
