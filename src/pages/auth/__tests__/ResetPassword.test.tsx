import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '@/test/TestAppWithRouting';
import type { ApiError } from '@/types/api';

// Override the useUser mock from TestAppWithRouting for auth pages
vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    data: null, // No authenticated user for auth pages
    isLoading: false,
  }),
}));

// Mock the useAuth hook
const mockResetPassword = vi.fn();
const mockUseResetPassword = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useResetPassword: () => mockUseResetPassword(),
  useForgotPassword: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

describe('ResetPassword Page', () => {
  const renderResetPassword = (token?: string) => {
    const url = token ? `/reset-password?token=${token}` : '/reset-password';
    return render(<TestAppWithRouting url={url} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default mock implementation
    mockUseResetPassword.mockReturnValue({
      mutateAsync: mockResetPassword,
      isPending: false,
      error: null as ApiError | null,
    });
  });

  describe('Token Validation', () => {
    it('should redirect to forgot password page when no token is provided', async () => {
      renderResetPassword();

      // With TestAppWithRouting, navigation actually works and shows forgot password page
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Forgot Password' })
        ).toBeInTheDocument();
      });
    });

    it('should render reset form when valid token is provided', () => {
      renderResetPassword('valid-token-123');

      expect(
        screen.getByRole('heading', { name: 'Reset Password' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('Enter your new password below.')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Reset Password' })
      ).toBeInTheDocument();
    });

    it('should not redirect when token exists', () => {
      renderResetPassword('some-token');

      // Should show the reset form, not the forgot password page
      expect(
        screen.getByRole('heading', { name: 'Reset Password' })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { name: 'Forgot Password' })
      ).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      renderResetPassword('valid-token');
    });

    it('should show validation errors when submitting with empty passwords', async () => {
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 8 characters.')
        ).toBeInTheDocument();
      });

      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('should show validation error for short password', async () => {
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 8 characters.')
        ).toBeInTheDocument();
      });

      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('should show validation error for weak password', async () => {
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      fireEvent.change(passwordInput, { target: { value: 'weakpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.'
          )
        ).toBeInTheDocument();
      });

      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('should show validation error when passwords do not match', async () => {
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password456!' },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
      });

      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('should not show validation errors with valid matching passwords', async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      const validPassword = 'MySecure123!';
      fireEvent.change(passwordInput, { target: { value: validPassword } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: validPassword },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith({
          token: 'valid-token',
          password: validPassword,
        });
      });

      expect(
        screen.queryByText('Passwords do not match.')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Password must be at least 8 characters.')
      ).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      renderResetPassword('reset-token-123');
    });

    it('should call resetPassword with correct data when form is submitted', async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      const newPassword = 'NewPassword123!';
      fireEvent.change(passwordInput, { target: { value: newPassword } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: newPassword },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith({
          token: 'reset-token-123',
          password: newPassword,
        });
      });
    });

    it('should show success state after successful password reset', async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'NewPassword123!' },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password Reset Successfully')
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'Your password has been reset. You can now log in with your new password.'
        )
      ).toBeInTheDocument();

      const backToLoginLink = screen.getByRole('link', {
        name: 'Back to Login',
      });
      expect(backToLoginLink).toBeInTheDocument();
      expect(backToLoginLink.getAttribute('href')).toBe('/login');
    });

    it('should handle API errors during password reset', async () => {
      const mockError: ApiError = {
        response: {
          data: { message: 'Invalid or expired token', status: 400 },
          status: 400,
        },
        message: 'Request failed',
      } as ApiError;

      mockUseResetPassword.mockReturnValue({
        mutateAsync: mockResetPassword,
        isPending: false,
        error: mockError,
      });

      render(<TestAppWithRouting url="/reset-password?token=invalid-token" />);

      expect(screen.getByText('Password Reset Failed')).toBeInTheDocument();
      expect(screen.getByText('Invalid or expired token')).toBeInTheDocument();

      const requestNewLink = screen.getByRole('link', {
        name: 'Request a new reset link',
      });
      expect(requestNewLink).toBeInTheDocument();
      expect(requestNewLink.getAttribute('href')).toBe('/forgot-password');
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      renderResetPassword('valid-token');
    });

    it('should show loading state when form is being submitted', () => {
      mockUseResetPassword.mockReturnValue({
        mutateAsync: mockResetPassword,
        isPending: true,
        error: null as ApiError | null,
      });

      render(<TestAppWithRouting url="/reset-password?token=valid-token" />);

      expect(
        screen.getByRole('button', { name: 'Loading...' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
    });

    it('should disable submit button during loading', () => {
      mockUseResetPassword.mockReturnValue({
        mutateAsync: mockResetPassword,
        isPending: true,
        error: null as ApiError | null,
      });

      render(<TestAppWithRouting url="/reset-password?token=valid-token" />);

      const submitButton = screen.getByRole('button', { name: 'Loading...' });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error alert for API failures', () => {
      const mockError: ApiError = {
        response: {
          data: { message: 'Token has expired', status: 400 },
          status: 400,
        },
        message: 'Request failed',
      } as ApiError;

      mockUseResetPassword.mockReturnValue({
        mutateAsync: mockResetPassword,
        isPending: false,
        error: mockError,
      });

      render(<TestAppWithRouting url="/reset-password?token=expired-token" />);

      expect(screen.getByText('Password Reset Failed')).toBeInTheDocument();
      expect(screen.getByText('Token has expired')).toBeInTheDocument();
    });

    it('should display generic error message when no API message is available', () => {
      const mockError: ApiError = {
        message: 'Network error',
      } as ApiError;

      mockUseResetPassword.mockReturnValue({
        mutateAsync: mockResetPassword,
        isPending: false,
        error: mockError,
      });

      render(<TestAppWithRouting url="/reset-password?token=some-token" />);

      expect(screen.getByText('Password Reset Failed')).toBeInTheDocument();
      expect(
        screen.getByText('Failed to reset password. Please try again.')
      ).toBeInTheDocument();
    });

    it('should provide recovery link in error alert', () => {
      const mockError: ApiError = {
        response: {
          data: { message: 'Invalid token', status: 400 },
          status: 400,
        },
        message: 'Request failed',
      } as ApiError;

      mockUseResetPassword.mockReturnValue({
        mutateAsync: mockResetPassword,
        isPending: false,
        error: mockError,
      });

      render(<TestAppWithRouting url="/reset-password?token=invalid-token" />);

      const recoveryLink = screen.getByRole('link', {
        name: 'Request a new reset link',
      });
      expect(recoveryLink).toBeInTheDocument();
      expect(recoveryLink.getAttribute('href')).toBe('/forgot-password');
    });
  });

  describe('Navigation', () => {
    it('should have correct link to login page in form state', () => {
      renderResetPassword('valid-token');

      const loginLink = screen.getByRole('link', { name: 'Login' });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.getAttribute('href')).toBe('/login');
    });

    it('should have correct link to login page in success state', async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);
      renderResetPassword('valid-token');

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'NewPassword123!' },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const backToLoginLink = screen.getByRole('link', {
          name: 'Back to Login',
        });
        expect(backToLoginLink.getAttribute('href')).toBe('/login');
      });
    });
  });

  describe('Password Security', () => {
    beforeEach(() => {
      renderResetPassword('valid-token');
    });

    it('should accept password with all required character types', async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      const securePassword = 'MySecure123!';
      fireEvent.change(passwordInput, { target: { value: securePassword } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: securePassword },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith({
          token: 'valid-token',
          password: securePassword,
        });
      });

      // Should not show password format error
      expect(
        screen.queryByText(
          'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.'
        )
      ).not.toBeInTheDocument();
    });

    it('should require minimum password length', async () => {
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });

      fireEvent.change(passwordInput, { target: { value: 'Abc1!' } }); // 5 chars
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 8 characters.')
        ).toBeInTheDocument();
      });

      expect(mockResetPassword).not.toHaveBeenCalled();
    });
  });

  describe('Component Functionality', () => {
    it('should render without console errors', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderResetPassword('valid-token');

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle missing token gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderResetPassword();

      // Should navigate to forgot password page
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Forgot Password' })
        ).toBeInTheDocument();
      });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should clear form and show success state after successful reset', async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);
      renderResetPassword('valid-token');

      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'NewPassword123!' },
      });

      expect(passwordInput).toHaveValue('NewPassword123!');
      expect(confirmPasswordInput).toHaveValue('NewPassword123!');

      const submitButton = screen.getByRole('button', {
        name: 'Reset Password',
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password Reset Successfully')
        ).toBeInTheDocument();
      });

      // Form should no longer be visible in success state
      expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Confirm Password')
      ).not.toBeInTheDocument();
    });
  });
});
