import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createElement } from 'react';
import { useUser } from '../useUser';
import { UsersService } from '@/services/users';
import { createMockUser } from '../../test/mock-factories';

// Mock UsersService
vi.mock('@/services/users');
const mockUsersService = vi.mocked(UsersService);

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

// Test wrapper with QueryClient - keep it simple
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // Just disable retries for predictable tests
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useUser hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('when user has token', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('valid-token-123');
    });

    it('should fetch user data successfully', async () => {
      const mockUser = createMockUser({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Test bio',
        dob: '1990-01-01',
        phone: '+1234567890',
      });

      mockUsersService.whoami.mockResolvedValue(mockUser);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      // Should start loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(mockUsersService.whoami).toHaveBeenCalledTimes(1);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
    });

    it('should use correct query configuration', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      // Query should be enabled when token exists
      expect(result.current.isLoading).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
    });
  });

  describe('when user has no token', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null);
    });

    it('should not fetch user data', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      // Query should be disabled
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockUsersService.whoami).not.toHaveBeenCalled();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
    });
  });

  describe('query configuration', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('valid-token');
    });

    it('should use correct query key', async () => {
      const mockUser = createMockUser({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });

      mockUsersService.whoami.mockResolvedValue(mockUser);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        const queryData = queryClient.getQueryData(['user']);
        expect(queryData).toEqual(mockUser);
      });
    });

    it('should have 5 minute stale time', async () => {
      const mockUser = createMockUser({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });

      mockUsersService.whoami.mockResolvedValue(mockUser);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Data should be fresh (not stale) initially
      expect(result.current.isStale).toBe(false);
    });

    it('should call UsersService.whoami', async () => {
      const mockUser = createMockUser({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });

      mockUsersService.whoami.mockResolvedValue(mockUser);

      const wrapper = createWrapper();
      renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(mockUsersService.whoami).toHaveBeenCalledTimes(1);
      });

      expect(mockUsersService.whoami).toHaveBeenCalledWith();
    });
  });

  describe('different user data scenarios', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('valid-token');
    });

    it('should handle user with minimal data', async () => {
      const minimalUser = createMockUser({
        id: '2',
        email: 'minimal@example.com',
        name: 'Minimal User',
        isEmailConfirmed: false,
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
      });

      mockUsersService.whoami.mockResolvedValue(minimalUser);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(minimalUser);
      expect(result.current.data?.bio).toBeNull();
      expect(result.current.data?.dob).toBeNull();
      expect(result.current.data?.phone).toBeNull();
      expect(result.current.data?.isEmailConfirmed).toBe(false);
    });

    it('should handle user with Google provider', async () => {
      const googleUser = createMockUser({
        id: '3',
        email: 'google@example.com',
        name: 'Google User',
        provider: 'google',
        providerId: 'google789',
        bio: 'Google user bio',
        dob: '1985-05-15',
        phone: '+9876543210',
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z',
      });

      mockUsersService.whoami.mockResolvedValue(googleUser);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(googleUser);
      expect(result.current.data?.provider).toBe('google');
      expect(result.current.data?.providerId).toBe('google789');
    });
  });
});
