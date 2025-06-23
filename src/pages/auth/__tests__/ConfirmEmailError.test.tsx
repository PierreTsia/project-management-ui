import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '../../../test/TestAppWithRouting';
import type { ApiError } from '@/types/api';

// Mock useUser to return null for auth pages
vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    data: null, // No authenticated user for auth pages
    isLoading: false,
  }),
}));

// Mock the useAuth hooks
const mockResendConfirmation = vi.fn();
const mockUseResendConfirmation = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useResendConfirmation: () => mockUseResendConfirmation(),
}));

describe('ConfirmEmailError Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock implementation
    mockUseResendConfirmation.mockReturnValue({
      mutateAsync: mockResendConfirmation,
      isPending: false,
      error: null as ApiError | null,
    });
  });

  describe('Error Display', () => {
    it('should render error page with default message when no error message provided', () => {
      render(<TestAppWithRouting url="/confirm-email-error" />);

      expect(screen.getByText('Confirmation Failed')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Failed to confirm email. Please check your token and try again.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });

    it('should display custom error message from URL params', () => {
      render(
        <TestAppWithRouting url="/confirm-email-error?message=Token%20has%20expired" />
      );

      expect(screen.getByText('Confirmation Failed')).toBeInTheDocument();
      expect(screen.getByText('Token has expired')).toBeInTheDocument();
    });

    it('should decode URL-encoded error messages', () => {
      render(
        <TestAppWithRouting url="/confirm-email-error?message=Invalid%20confirmation%20token%20provided" />
      );

      expect(
        screen.getByText('Invalid confirmation token provided')
      ).toBeInTheDocument();
    });
  });

  describe('Resend Email Form', () => {
    it('should render resend email form with proper elements', () => {
      render(<TestAppWithRouting url="/confirm-email-error" />);

      expect(
        screen.getByText(
          "Enter your email address below and we'll send you a new confirmation link."
        )
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter your email')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Resend Confirmation Email' })
      ).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      render(<TestAppWithRouting url="/confirm-email-error" />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', {
        name: 'Resend Confirmation Email',
      });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
      });
    });

    it('should not submit with empty email', async () => {
      render(<TestAppWithRouting url="/confirm-email-error" />);

      const submitButton = screen.getByRole('button', {
        name: 'Resend Confirmation Email',
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
      });

      expect(mockResendConfirmation).not.toHaveBeenCalled();
    });

    it('should submit form with valid email', async () => {
      mockResendConfirmation.mockResolvedValueOnce({});
      render(<TestAppWithRouting url="/confirm-email-error" />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', {
        name: 'Resend Confirmation Email',
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResendConfirmation).toHaveBeenCalledWith({
          email: 'test@example.com',
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state when resending email', () => {
      // Mock the hook to return loading state
      mockUseResendConfirmation.mockReturnValue({
        mutateAsync: mockResendConfirmation,
        isPending: true,
        error: null as ApiError | null,
      });

      render(<TestAppWithRouting url="/confirm-email-error" />);

      expect(
        screen.getByRole('button', { name: 'Sending...' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when resend fails', () => {
      const errorMessage = 'Email not found';

      // Mock the hook to return error state
      mockUseResendConfirmation.mockReturnValue({
        mutateAsync: mockResendConfirmation,
        isPending: false,
        error: {
          response: {
            data: {
              message: errorMessage,
              status: 404,
            },
            status: 404,
          },
        } as ApiError,
      });

      render(<TestAppWithRouting url="/confirm-email-error" />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display fallback error message when error has no message', () => {
      // Mock the hook to return error state without message
      mockUseResendConfirmation.mockReturnValue({
        mutateAsync: mockResendConfirmation,
        isPending: false,
        error: {
          name: 'Error',
          message: 'Network Error',
        } as ApiError,
      });

      render(<TestAppWithRouting url="/confirm-email-error" />);

      expect(
        screen.getByText(
          'Failed to resend confirmation email. Please try again.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should show success message after successful resend', async () => {
      mockResendConfirmation.mockResolvedValueOnce({});
      render(<TestAppWithRouting url="/confirm-email-error" />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', {
        name: 'Resend Confirmation Email',
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email Sent!')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          "We've sent you a new confirmation email. Please check your inbox."
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });

    it('should render success icon in success state', async () => {
      mockResendConfirmation.mockResolvedValueOnce({});
      render(<TestAppWithRouting url="/confirm-email-error" />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', {
        name: 'Resend Confirmation Email',
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const successIcon = document.querySelector('.text-green-600');
        expect(successIcon).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should have correct link to login page in error state', () => {
      render(<TestAppWithRouting url="/confirm-email-error" />);

      const loginLinks = screen.getAllByRole('link', { name: 'Back to Login' });
      expect(loginLinks).toHaveLength(1);
      expect(loginLinks[0].getAttribute('href')).toBe('/login');
    });

    it('should have correct link to login page in success state', async () => {
      mockResendConfirmation.mockResolvedValueOnce({});
      render(<TestAppWithRouting url="/confirm-email-error" />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const submitButton = screen.getByRole('button', {
        name: 'Resend Confirmation Email',
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const loginLink = screen.getByRole('link', { name: 'Back to Login' });
        expect(loginLink.getAttribute('href')).toBe('/login');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button states', () => {
      render(<TestAppWithRouting url="/confirm-email-error" />);

      const submitButton = screen.getByRole('button', {
        name: 'Resend Confirmation Email',
      });
      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(submitButton).not.toBeDisabled();
    });

    it('should have proper heading structure', () => {
      render(<TestAppWithRouting url="/confirm-email-error" />);

      // The title should be rendered as a heading
      const heading = screen.getByText('Confirmation Failed');
      expect(heading).toBeInTheDocument();
    });
  });
});
