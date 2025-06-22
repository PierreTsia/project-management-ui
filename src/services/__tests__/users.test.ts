import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UsersService } from '../users';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/user';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);

describe('UsersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('whoami', () => {
    it('should call API client with correct endpoint', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        provider: null,
        providerId: null,
        bio: 'Test bio',
        dob: '1990-01-01',
        phone: '+1234567890',
        isEmailConfirmed: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockGet.mockResolvedValue({ data: mockUser });

      const result = await UsersService.whoami();

      expect(mockGet).toHaveBeenCalledWith('/users/whoami');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Unauthorized');
      mockGet.mockRejectedValue(mockError);

      await expect(UsersService.whoami()).rejects.toThrow('Unauthorized');
      expect(mockGet).toHaveBeenCalledWith('/users/whoami');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockGet.mockRejectedValue(networkError);

      await expect(UsersService.whoami()).rejects.toThrow('Network Error');
      expect(mockGet).toHaveBeenCalledWith('/users/whoami');
    });

    it('should extract data from API response correctly', async () => {
      const mockUser: User = {
        id: '2',
        email: 'user@test.com',
        name: 'Another User',
        provider: 'google',
        providerId: 'google123',
        bio: null,
        dob: null,
        phone: null,
        isEmailConfirmed: true,
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
      };

      mockGet.mockResolvedValue({
        data: mockUser,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      const result = await UsersService.whoami();

      expect(result).toEqual(mockUser);
      expect(result.id).toBe('2');
      expect(result.email).toBe('user@test.com');
      expect(result.provider).toBe('google');
    });

    it('should handle user with minimal data', async () => {
      const minimalUser: User = {
        id: '3',
        email: 'minimal@test.com',
        name: 'Minimal User',
        provider: null,
        providerId: null,
        bio: null,
        dob: null,
        phone: null,
        isEmailConfirmed: false,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z',
      };

      mockGet.mockResolvedValue({ data: minimalUser });

      const result = await UsersService.whoami();

      expect(result).toEqual(minimalUser);
      expect(result.bio).toBeNull();
      expect(result.dob).toBeNull();
      expect(result.phone).toBeNull();
      expect(result.isEmailConfirmed).toBe(false);
    });

    it('should handle authentication errors specifically', async () => {
      const authError = new Error('Token expired');
      mockGet.mockRejectedValue(authError);

      await expect(UsersService.whoami()).rejects.toThrow('Token expired');
      expect(mockGet).toHaveBeenCalledWith('/users/whoami');
    });
  });

  describe('Service behavior', () => {
    it('should use GET method instead of POST', async () => {
      const mockUser: User = {
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
      };

      mockGet.mockResolvedValue({ data: mockUser });

      await UsersService.whoami();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/users/whoami');
    });

    it('should return User type with all required fields', async () => {
      const completeUser: User = {
        id: '1',
        email: 'complete@example.com',
        name: 'Complete User',
        provider: 'google',
        providerId: 'google456',
        bio: 'Full bio here',
        dob: '1985-12-25',
        phone: '+9876543210',
        isEmailConfirmed: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockGet.mockResolvedValue({ data: completeUser });

      const result = await UsersService.whoami();

      // Verify all User fields are present
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('providerId');
      expect(result).toHaveProperty('bio');
      expect(result).toHaveProperty('dob');
      expect(result).toHaveProperty('phone');
      expect(result).toHaveProperty('isEmailConfirmed');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });
});
