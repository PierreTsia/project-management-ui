import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestApp } from '@/test/TestApp';
import { ForgotPassword } from '../ForgotPassword';
import type { ApiError } from '@/types/api';

// Mock the useAuth hook
const mockForgotPassword = vi.fn();
const mockUseForgotPassword = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useForgotPassword: () => mockUseForgotPassword(),
}));

describe('ForgotPassword Page', () => {
  const renderWithProviders = () => {
    return render(
      <TestApp initialEntries={['/forgot-password']}>
        <ForgotPassword />
      </TestApp>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default mock implementation
    mockUseForgotPassword.mockReturnValue({
      mutateAsync: mockForgotPassword,
      isPending: false,
      error: null as ApiError | null,
    });
  });

  describe('Initial Render', () => {
    it('should render the forgot password page with all required elements', () => {
      renderWithProviders();

      expect(
        screen.getByRole('heading', { name: 'Forgot Password' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Enter your email address and we'll send you a link to reset your password."
        )
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('m@example.com')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Send Reset Link' })
      ).toBeInTheDocument();

      const backToLoginText = screen.getByText('Remember your password?');
      expect(backToLoginText).toBeInTheDocument();

      const loginLink = screen.getByRole('link', { name: 'Login' });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.getAttribute('href')).toBe('/login');
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when submitting with empty email', async () => {
      renderWithProviders();

      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
      });

      expect(mockForgotPassword).not.toHaveBeenCalled();
    });

    it('should show validation error when submitting with invalid email', async () => {
      renderWithProviders();

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
      });

      expect(mockForgotPassword).not.toHaveBeenCalled();
    });

    it('should not show validation errors with valid email', async () => {
      mockForgotPassword.mockResolvedValueOnce(undefined);
      renderWithProviders();

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
        });
      });

      expect(
        screen.queryByText('Invalid email address.')
      ).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call forgotPassword with correct email when form is submitted', async () => {
      mockForgotPassword.mockResolvedValueOnce(undefined);
      renderWithProviders();

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith({
          email: 'user@example.com',
        });
      });
    });

    it('should show success state after successful submission', async () => {
      mockForgotPassword.mockResolvedValueOnce(undefined);
      renderWithProviders();

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'If the email address exists in our system, you will receive a password reset link shortly.'
        )
      ).toBeInTheDocument();

      const backToLoginLink = screen.getByRole('link', {
        name: 'Back to Login',
      });
      expect(backToLoginLink).toBeInTheDocument();
      expect(backToLoginLink.getAttribute('href')).toBe('/login');
    });

    it('should show success state even when API call fails (security)', async () => {
      mockForgotPassword.mockRejectedValueOnce(new Error('Email not found'));
      renderWithProviders();

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });

      fireEvent.change(emailInput, {
        target: { value: 'nonexistent@example.com' },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Check Your Email' })
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'If the email address exists in our system, you will receive a password reset link shortly.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state when form is being submitted', () => {
      // Mock the hook to return pending state
      mockUseForgotPassword.mockReturnValue({
        mutateAsync: mockForgotPassword,
        isPending: true,
        error: null as ApiError | null,
      });

      renderWithProviders();

      expect(
        screen.getByRole('button', { name: 'Loading...' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
    });

    it('should disable submit button during loading', () => {
      mockUseForgotPassword.mockReturnValue({
        mutateAsync: mockForgotPassword,
        isPending: true,
        error: null as ApiError | null,
      });

      renderWithProviders();

      const submitButton = screen.getByRole('button', { name: 'Loading...' });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('should have correct link to login page in initial state', () => {
      renderWithProviders();

      const loginLink = screen.getByRole('link', { name: 'Login' });
      expect(loginLink.getAttribute('href')).toBe('/login');
    });

    it('should have correct link to login page in success state', async () => {
      mockForgotPassword.mockResolvedValueOnce(undefined);
      renderWithProviders();

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const backToLoginLink = screen.getByRole('link', {
          name: 'Back to Login',
        });
        expect(backToLoginLink.getAttribute('href')).toBe('/login');
      });
    });
  });

  describe('Security Behavior', () => {
    it('should not reveal whether email exists through different responses', async () => {
      // Test that both success and failure show the same message
      mockForgotPassword.mockRejectedValueOnce(new Error('Email not found'));
      renderWithProviders();

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });

      fireEvent.change(emailInput, {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Check Your Email' })
        ).toBeInTheDocument();
      });

      // Should show generic success message regardless of API success/failure
      expect(
        screen.getByText(
          'If the email address exists in our system, you will receive a password reset link shortly.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form elements and labels', () => {
      renderWithProviders();

      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('placeholder', 'm@example.com');

      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have proper heading structure', () => {
      renderWithProviders();

      const heading = screen.getByRole('heading', { name: 'Forgot Password' });
      expect(heading).toBeInTheDocument();
    });

    it('should have proper heading structure in success state', async () => {
      mockForgotPassword.mockResolvedValueOnce(undefined);
      renderWithProviders();

      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const successHeading = screen.getByRole('heading', {
          name: 'Check Your Email',
        });
        expect(successHeading).toBeInTheDocument();
      });
    });
  });

  describe('Component Functionality', () => {
    it('should render without console errors', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderWithProviders();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle form reset after successful submission', async () => {
      mockForgotPassword.mockResolvedValueOnce(undefined);
      renderWithProviders();

      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');

      const submitButton = screen.getByRole('button', {
        name: 'Send Reset Link',
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });

      // Form should no longer be visible in success state
      expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    });
  });
});
