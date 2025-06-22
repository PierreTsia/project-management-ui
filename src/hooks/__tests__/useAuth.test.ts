import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React, { createElement } from 'react';
import {
  useLogin,
  useRegister,
  useConfirmEmail,
  useResendConfirmation,
  useLogout,
  useForgotPassword,
  useResetPassword,
} from '../useAuth';
import { AuthService } from '@/services/auth';
import type { LoginResponse, RegisterResponse } from '@/types/auth';
import type { ApiError } from '@/types/api';

// Mock AuthService
vi.mock('@/services/auth');
const mockAuthService = vi.mocked(AuthService);

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock console.error to avoid noise in tests
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => {});

// Test wrapper with QueryClient and Router
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, null, children)
    );
};

describe('useAuth hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useLogin', () => {
    it('should handle successful login', async () => {
      const mockLoginResponse: LoginResponse = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          provider: null,
          providerId: null,
          bio: 'Test bio',
          dob: '1990-01-01',
          phone: '1234567890',
        },
      };

      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      result.current.mutate(loginData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'token',
        'access-token-123'
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token-123'
      );

      // Check navigation to dashboard
      expect(mockNavigate).toHaveBeenCalledWith('/');

      // Check AuthService was called correctly
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
    });

    it('should handle login error', async () => {
      const mockError: ApiError = {
        response: {
          data: { message: 'Invalid credentials', status: 401 },
          status: 401,
        },
        message: 'Request failed',
      } as ApiError;

      mockAuthService.login.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      result.current.mutate({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check error was logged
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Login failed:',
        'Invalid credentials'
      );

      // Check localStorage was not updated
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

      // Check navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle login error without response data', async () => {
      const mockError = new Error('Network error');
      mockAuthService.login.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      result.current.mutate({
        email: 'test@example.com',
        password: 'password123',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check error was logged with fallback message
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Login failed:',
        'Network error'
      );
    });
  });

  describe('useRegister', () => {
    it('should handle successful registration', async () => {
      const mockRegisterResponse: RegisterResponse = {
        message: 'Registration successful',
      };

      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRegister(), { wrapper });

      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      result.current.mutate(registerData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check navigation to check email page with state
      expect(mockNavigate).toHaveBeenCalledWith('/auth/check-email', {
        state: { email: 'test@example.com' },
      });

      // Check AuthService was called correctly
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
    });

    it('should handle registration error', async () => {
      const mockError: ApiError = {
        response: {
          data: { message: 'Email already exists', status: 409 },
          status: 409,
        },
        message: 'Request failed',
      } as ApiError;

      mockAuthService.register.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRegister(), { wrapper });

      result.current.mutate({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check error is accessible
      expect(result.current.error).toBe(mockError);

      // Check navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('useConfirmEmail', () => {
    it('should handle successful email confirmation', async () => {
      mockAuthService.confirmEmail.mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useConfirmEmail(), { wrapper });

      const confirmData = { token: 'confirmation-token-123' };

      result.current.mutate(confirmData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check navigation to success page
      expect(mockNavigate).toHaveBeenCalledWith('/confirm-email-success');

      // Check AuthService was called correctly
      expect(mockAuthService.confirmEmail).toHaveBeenCalledWith(confirmData);
    });

    it('should handle email confirmation error with API response', async () => {
      const mockError: ApiError = {
        response: {
          data: { message: 'Invalid or expired token', status: 400 },
          status: 400,
        },
        message: 'Request failed',
      } as ApiError;

      mockAuthService.confirmEmail.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useConfirmEmail(), { wrapper });

      result.current.mutate({ token: 'invalid-token' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check navigation to error page with message
      expect(mockNavigate).toHaveBeenCalledWith(
        '/confirm-email-error?message=Invalid%20or%20expired%20token'
      );
    });

    it('should handle email confirmation error without API response', async () => {
      const mockError = new Error('Network error');
      mockAuthService.confirmEmail.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useConfirmEmail(), { wrapper });

      result.current.mutate({ token: 'some-token' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check navigation to error page with fallback message
      expect(mockNavigate).toHaveBeenCalledWith(
        '/confirm-email-error?message=Failed%20to%20confirm%20email.%20Please%20try%20again.'
      );
    });
  });

  describe('useResendConfirmation', () => {
    it('should handle successful resend confirmation', async () => {
      mockAuthService.resendConfirmation.mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResendConfirmation(), { wrapper });

      const resendData = { email: 'test@example.com' };

      result.current.mutate(resendData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check AuthService was called correctly
      expect(mockAuthService.resendConfirmation).toHaveBeenCalledWith(
        resendData
      );

      // Check no navigation occurs (handled by component)
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle resend confirmation error with API response', async () => {
      const mockError: ApiError = {
        response: {
          data: { message: 'Email not found', status: 404 },
          status: 404,
        },
        message: 'Request failed',
      } as ApiError;

      mockAuthService.resendConfirmation.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResendConfirmation(), { wrapper });

      result.current.mutate({ email: 'notfound@example.com' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check error was logged
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to resend confirmation email:',
        'Email not found'
      );

      // Check error is accessible to component
      expect(result.current.error).toBe(mockError);
    });

    it('should handle resend confirmation error without API response', async () => {
      const mockError = new Error('Network timeout');
      mockAuthService.resendConfirmation.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResendConfirmation(), { wrapper });

      result.current.mutate({ email: 'test@example.com' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check error was logged with fallback message
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to resend confirmation email:',
        'Network timeout'
      );
    });
  });

  describe('useLogout', () => {
    it('should handle successful logout', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogout(), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check localStorage was cleared
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');

      // Check navigation to login page
      expect(mockNavigate).toHaveBeenCalledWith('/login');

      // Check AuthService was called
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should handle logout error', async () => {
      const mockError: ApiError = {
        response: {
          data: { message: 'Already logged out', status: 401 },
          status: 401,
        },
        message: 'Request failed',
      } as ApiError;

      mockAuthService.logout.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogout(), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // On error, localStorage should NOT be cleared (tokens might still be valid)
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should clear user data from query cache on successful logout', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      // Set some user data in the cache
      queryClient.setQueryData(['user'], {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(MemoryRouter, null, children)
        );

      const { result } = renderHook(() => useLogout(), { wrapper });

      // Verify user data exists before logout
      expect(queryClient.getQueryData(['user'])).toBeDefined();

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify user data was removed from cache
      expect(queryClient.getQueryData(['user'])).toBeUndefined();
    });
  });

  describe('useForgotPassword', () => {
    it('should handle successful forgot password request', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useForgotPassword(), { wrapper });

      const forgotPasswordData = { email: 'test@example.com' };

      result.current.mutate(forgotPasswordData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check AuthService was called correctly
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordData
      );

      // Check no navigation occurs (handled by component)
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle forgot password error with API response', async () => {
      const mockError: ApiError = {
        response: {
          data: { message: 'Email not found', status: 404 },
          status: 404,
        },
        message: 'Request failed',
      } as ApiError;

      mockAuthService.forgotPassword.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useForgotPassword(), { wrapper });

      result.current.mutate({ email: 'notfound@example.com' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check error was logged
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to send password reset email:',
        'Email not found'
      );

      // Check error is accessible to component
      expect(result.current.error).toBe(mockError);
    });

    it('should handle forgot password error without API response', async () => {
      const mockError = new Error('Network timeout');
      mockAuthService.forgotPassword.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useForgotPassword(), { wrapper });

      result.current.mutate({ email: 'test@example.com' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check error was logged with fallback message
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to send password reset email:',
        'Network timeout'
      );
    });
  });

  describe('useResetPassword', () => {
    it('should handle successful password reset', async () => {
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResetPassword(), { wrapper });

      const resetPasswordData = {
        token: 'reset-token-123',
        password: 'newPassword123',
      };

      result.current.mutate(resetPasswordData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check AuthService was called correctly
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetPasswordData
      );
    });

    it('should handle reset password error with API response', async () => {
      const mockError: ApiError = {
        response: {
          data: { message: 'Invalid or expired token', status: 400 },
          status: 400,
        },
        message: 'Request failed',
      } as ApiError;

      mockAuthService.resetPassword.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResetPassword(), { wrapper });

      result.current.mutate({
        token: 'invalid-token',
        password: 'newPassword123',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check error was logged
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to reset password:',
        'Invalid or expired token'
      );

      // Check error is accessible to component
      expect(result.current.error).toBe(mockError);
    });

    it('should handle reset password error without API response', async () => {
      const mockError = new Error('Network timeout');
      mockAuthService.resetPassword.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResetPassword(), { wrapper });

      result.current.mutate({
        token: 'some-token',
        password: 'newPassword123',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Check error was logged with fallback message
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to reset password:',
        'Network timeout'
      );
    });
  });

  describe('Hook loading and error states', () => {
    it('should have correct initial state for all hooks', () => {
      const wrapper = createWrapper();

      const { result: loginResult } = renderHook(() => useLogin(), { wrapper });
      const { result: registerResult } = renderHook(() => useRegister(), {
        wrapper,
      });
      const { result: confirmResult } = renderHook(() => useConfirmEmail(), {
        wrapper,
      });
      const { result: resendResult } = renderHook(
        () => useResendConfirmation(),
        {
          wrapper,
        }
      );
      const { result: logoutResult } = renderHook(() => useLogout(), {
        wrapper,
      });
      const { result: forgotPasswordResult } = renderHook(
        () => useForgotPassword(),
        {
          wrapper,
        }
      );

      // All hooks should start in idle state
      expect(loginResult.current.isPending).toBe(false);
      expect(loginResult.current.isError).toBe(false);
      expect(loginResult.current.isSuccess).toBe(false);

      expect(registerResult.current.isPending).toBe(false);
      expect(registerResult.current.isError).toBe(false);
      expect(registerResult.current.isSuccess).toBe(false);

      expect(confirmResult.current.isPending).toBe(false);
      expect(confirmResult.current.isError).toBe(false);
      expect(confirmResult.current.isSuccess).toBe(false);

      expect(resendResult.current.isPending).toBe(false);
      expect(resendResult.current.isError).toBe(false);
      expect(resendResult.current.isSuccess).toBe(false);

      expect(logoutResult.current.isPending).toBe(false);
      expect(logoutResult.current.isError).toBe(false);
      expect(logoutResult.current.isSuccess).toBe(false);

      expect(forgotPasswordResult.current.isPending).toBe(false);
      expect(forgotPasswordResult.current.isError).toBe(false);
      expect(forgotPasswordResult.current.isSuccess).toBe(false);
    });

    it('should allow mutations to be called', () => {
      const wrapper = createWrapper();

      const { result: loginResult } = renderHook(() => useLogin(), { wrapper });
      const { result: registerResult } = renderHook(() => useRegister(), {
        wrapper,
      });
      const { result: confirmResult } = renderHook(() => useConfirmEmail(), {
        wrapper,
      });
      const { result: resendResult } = renderHook(
        () => useResendConfirmation(),
        {
          wrapper,
        }
      );
      const { result: logoutResult } = renderHook(() => useLogout(), {
        wrapper,
      });
      const { result: forgotPasswordResult } = renderHook(
        () => useForgotPassword(),
        {
          wrapper,
        }
      );

      // All mutations should have a mutate function
      expect(typeof loginResult.current.mutate).toBe('function');
      expect(typeof registerResult.current.mutate).toBe('function');
      expect(typeof confirmResult.current.mutate).toBe('function');
      expect(typeof resendResult.current.mutate).toBe('function');
      expect(typeof logoutResult.current.mutate).toBe('function');
      expect(typeof forgotPasswordResult.current.mutate).toBe('function');
    });
  });
});
