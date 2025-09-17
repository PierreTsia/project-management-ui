import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth';
import { apiClient } from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
} from '@/types/auth';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call API client with correct endpoint and data', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockLoginResponse: LoginResponse = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          provider: null,
          providerId: null,
          bio: null,
          dob: null,
          phone: null,
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      mockPost.mockResolvedValue({ data: mockLoginResponse });

      const result = await AuthService.login(loginRequest);

      expect(mockPost).toHaveBeenCalledWith('/auth/login', loginRequest);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw error when API call fails', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockError = new Error('Invalid credentials');
      mockPost.mockRejectedValue(mockError);

      await expect(AuthService.login(loginRequest)).rejects.toThrow(
        'Invalid credentials'
      );
      expect(mockPost).toHaveBeenCalledWith('/auth/login', loginRequest);
    });
  });

  describe('register', () => {
    it('should call API client with correct endpoint and data', async () => {
      const registerRequest: RegisterRequest = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockRegisterResponse: RegisterResponse = {
        message: 'Registration successful',
      };

      mockPost.mockResolvedValue({ data: mockRegisterResponse });

      const result = await AuthService.register(registerRequest);

      expect(mockPost).toHaveBeenCalledWith('/auth/register', registerRequest);
      expect(result).toEqual(mockRegisterResponse);
    });

    it('should throw error when API call fails', async () => {
      const registerRequest: RegisterRequest = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      const mockError = new Error('Email already exists');
      mockPost.mockRejectedValue(mockError);

      await expect(AuthService.register(registerRequest)).rejects.toThrow(
        'Email already exists'
      );
      expect(mockPost).toHaveBeenCalledWith('/auth/register', registerRequest);
    });
  });

  describe('refreshToken', () => {
    it('should call API client with correct endpoint', async () => {
      const mockRefreshResponse: RefreshTokenResponse = {
        accessToken: 'new-access-token-123',
        refreshToken: 'new-refresh-token-123',
      };

      mockPost.mockResolvedValue({ data: mockRefreshResponse });

      const result = await AuthService.refreshToken();

      expect(mockPost).toHaveBeenCalledWith('/auth/refresh');
      expect(result).toEqual(mockRefreshResponse);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Refresh token expired');
      mockPost.mockRejectedValue(mockError);

      await expect(AuthService.refreshToken()).rejects.toThrow(
        'Refresh token expired'
      );
      expect(mockPost).toHaveBeenCalledWith('/auth/refresh');
    });
  });

  describe('logout', () => {
    it('should call API client with correct endpoint', async () => {
      mockPost.mockResolvedValue({ data: undefined });

      await AuthService.logout();

      expect(mockPost).toHaveBeenCalledWith('/auth/logout');
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Logout failed');
      mockPost.mockRejectedValue(mockError);

      await expect(AuthService.logout()).rejects.toThrow('Logout failed');
      expect(mockPost).toHaveBeenCalledWith('/auth/logout');
    });

    it('should not return any value', async () => {
      mockPost.mockResolvedValue({ data: undefined });

      const result = await AuthService.logout();

      expect(result).toBeUndefined();
    });
  });

  describe('confirmEmail', () => {
    it('should call API client with correct endpoint and data', async () => {
      const confirmData = { token: 'confirmation-token-123' };
      mockPost.mockResolvedValue({ data: undefined });

      await AuthService.confirmEmail(confirmData);

      expect(mockPost).toHaveBeenCalledWith('/auth/confirm-email', confirmData);
    });

    it('should throw error when API call fails', async () => {
      const confirmData = { token: 'invalid-token' };
      const mockError = new Error('Invalid or expired token');
      mockPost.mockRejectedValue(mockError);

      await expect(AuthService.confirmEmail(confirmData)).rejects.toThrow(
        'Invalid or expired token'
      );
      expect(mockPost).toHaveBeenCalledWith('/auth/confirm-email', confirmData);
    });

    it('should not return any value', async () => {
      const confirmData = { token: 'valid-token' };
      mockPost.mockResolvedValue({ data: undefined });

      const result = await AuthService.confirmEmail(confirmData);

      expect(result).toBeUndefined();
    });
  });

  describe('resendConfirmation', () => {
    it('should call API client with correct endpoint and data', async () => {
      const resendData = { email: 'test@example.com' };
      mockPost.mockResolvedValue({ data: undefined });

      await AuthService.resendConfirmation(resendData);

      expect(mockPost).toHaveBeenCalledWith(
        '/auth/resend-confirmation',
        resendData
      );
    });

    it('should throw error when API call fails', async () => {
      const resendData = { email: 'notfound@example.com' };
      const mockError = new Error('Email not found');
      mockPost.mockRejectedValue(mockError);

      await expect(AuthService.resendConfirmation(resendData)).rejects.toThrow(
        'Email not found'
      );
      expect(mockPost).toHaveBeenCalledWith(
        '/auth/resend-confirmation',
        resendData
      );
    });

    it('should not return any value', async () => {
      const resendData = { email: 'test@example.com' };
      mockPost.mockResolvedValue({ data: undefined });

      const result = await AuthService.resendConfirmation(resendData);

      expect(result).toBeUndefined();
    });
  });

  describe('forgotPassword', () => {
    it('should call API client with correct endpoint and data', async () => {
      const forgotPasswordData = { email: 'test@example.com' };
      mockPost.mockResolvedValue({ data: undefined });

      await AuthService.forgotPassword(forgotPasswordData);

      expect(mockPost).toHaveBeenCalledWith(
        '/auth/forgot-password',
        forgotPasswordData
      );
    });

    it('should throw error when API call fails', async () => {
      const forgotPasswordData = { email: 'notfound@example.com' };
      const mockError = new Error('Email not found');
      mockPost.mockRejectedValue(mockError);

      await expect(
        AuthService.forgotPassword(forgotPasswordData)
      ).rejects.toThrow('Email not found');
      expect(mockPost).toHaveBeenCalledWith(
        '/auth/forgot-password',
        forgotPasswordData
      );
    });

    it('should not return any value', async () => {
      const forgotPasswordData = { email: 'test@example.com' };
      mockPost.mockResolvedValue({ data: undefined });

      const result = await AuthService.forgotPassword(forgotPasswordData);

      expect(result).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should call API client with correct endpoint and data', async () => {
      const resetPasswordData = {
        token: 'reset-token-123',
        password: 'newPassword123',
      };
      mockPost.mockResolvedValue({ data: undefined });

      await AuthService.resetPassword(resetPasswordData);

      expect(mockPost).toHaveBeenCalledWith(
        '/auth/reset-password',
        resetPasswordData
      );
    });

    it('should throw error when API call fails', async () => {
      const resetPasswordData = {
        token: 'invalid-token',
        password: 'newPassword123',
      };
      const mockError = new Error('Invalid or expired token');
      mockPost.mockRejectedValue(mockError);

      await expect(
        AuthService.resetPassword(resetPasswordData)
      ).rejects.toThrow('Invalid or expired token');
      expect(mockPost).toHaveBeenCalledWith(
        '/auth/reset-password',
        resetPasswordData
      );
    });

    it('should not return any value', async () => {
      const resetPasswordData = {
        token: 'valid-token',
        password: 'newPassword123',
      };
      mockPost.mockResolvedValue({ data: undefined });

      const result = await AuthService.resetPassword(resetPasswordData);

      expect(result).toBeUndefined();
    });
  });

  describe('Service behavior', () => {
    it('updatePassword should call PUT /auth/password and return data', async () => {
      mockPut.mockResolvedValue({ data: { message: 'Password updated' } });
      const result = await AuthService.updatePassword({
        currentPassword: 'OldPassw0rd!',
        newPassword: 'NewPassw0rd!',
      });
      expect(mockPut).toHaveBeenCalledWith('/auth/password', {
        currentPassword: 'OldPassw0rd!',
        newPassword: 'NewPassw0rd!',
      });
      expect(result).toEqual({ message: 'Password updated' });
    });

    it('updatePassword should propagate API errors', async () => {
      const err = new Error('Forbidden');
      mockPut.mockRejectedValue(err);
      await expect(
        AuthService.updatePassword({
          currentPassword: 'OldPassw0rd!',
          newPassword: 'NewPassw0rd!',
        })
      ).rejects.toThrow('Forbidden');
      expect(mockPut).toHaveBeenCalledWith('/auth/password', {
        currentPassword: 'OldPassw0rd!',
        newPassword: 'NewPassw0rd!',
      });
    });
    it('should handle network errors consistently', async () => {
      const networkError = new Error('Network Error');
      mockPost.mockRejectedValue(networkError);

      // Test that all methods properly propagate network errors
      await expect(
        AuthService.login({ email: 'test@test.com', password: 'pass' })
      ).rejects.toThrow('Network Error');

      await expect(
        AuthService.register({
          name: 'Test',
          email: 'test@test.com',
          password: 'pass',
        })
      ).rejects.toThrow('Network Error');

      await expect(AuthService.refreshToken()).rejects.toThrow('Network Error');

      await expect(AuthService.logout()).rejects.toThrow('Network Error');

      await expect(
        AuthService.confirmEmail({ token: 'token' })
      ).rejects.toThrow('Network Error');

      await expect(
        AuthService.resendConfirmation({ email: 'test@test.com' })
      ).rejects.toThrow('Network Error');

      await expect(
        AuthService.forgotPassword({ email: 'test@test.com' })
      ).rejects.toThrow('Network Error');

      await expect(
        AuthService.resetPassword({ token: 'token', password: 'password' })
      ).rejects.toThrow('Network Error');
    });

    it('should extract data from API response correctly', async () => {
      const mockData = { message: 'Success' };
      mockPost.mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await AuthService.register({
        name: 'Test',
        email: 'test@test.com',
        password: 'pass',
      });

      expect(result).toEqual(mockData);
    });
  });
});
