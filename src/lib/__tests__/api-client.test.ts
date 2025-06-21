import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../api-client';
import { AuthService } from '@/services/auth';

// Mock AuthService to prevent actual API calls
vi.mock('@/services/auth');

describe('apiClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'removeItem');
    vi.spyOn(AuthService, 'refreshToken');
  });

  afterEach(() => {
    mock.reset();
    vi.restoreAllMocks();
  });

  describe('Request Interceptor', () => {
    it('should add access token to Authorization header', async () => {
      localStorage.setItem('token', 'access-token');
      mock.onGet('/test').reply(200);

      await apiClient.get('/test');

      expect(mock.history.get[0].headers?.Authorization).toBe(
        'Bearer access-token'
      );
    });

    it('should add refresh token for /auth/refresh', async () => {
      localStorage.setItem('refreshToken', 'refresh-token');
      mock.onPost('/auth/refresh').reply(200);

      await apiClient.post('/auth/refresh');

      expect(mock.history.post[0].headers?.Authorization).toBe(
        'Bearer refresh-token'
      );
    });
  });

  describe('Response Interceptor (401 Error)', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'expired-access-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');
    });

    it('should retry request with new token on successful refresh', async () => {
      mock.onGet('/protected').replyOnce(401); // First call fails
      mock.onGet('/protected').replyOnce(200); // Second call succeeds

      vi.mocked(AuthService.refreshToken).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      await expect(apiClient.get('/protected')).resolves.toBeDefined();

      expect(AuthService.refreshToken).toHaveBeenCalledTimes(1);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'token',
        'new-access-token'
      );
      expect(mock.history.get.length).toBe(2);
      expect(mock.history.get[1].headers?.Authorization).toBe(
        'Bearer new-access-token'
      );
    });

    it('should redirect to /login on refresh token failure', async () => {
      // Mock window.location.href assignment
      const originalLocation = window.location;
      const mockLocation = {
        ...originalLocation,
        href: '',
      };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      mock.onGet('/protected').reply(401);
      vi.mocked(AuthService.refreshToken).mockRejectedValue(
        new Error('Refresh failed')
      );

      await expect(apiClient.get('/protected')).rejects.toThrow();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockLocation.href).toBe('/login');

      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });

    it('should only call refreshToken once for multiple concurrent requests', async () => {
      mock.onGet('/one').replyOnce(401);
      mock.onGet('/two').replyOnce(401);
      mock.onGet('/one').replyOnce(200);
      mock.onGet('/two').replyOnce(200);

      vi.mocked(AuthService.refreshToken).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      await Promise.all([apiClient.get('/one'), apiClient.get('/two')]);

      expect(AuthService.refreshToken).toHaveBeenCalledTimes(1);
      expect(mock.history.get[2].headers?.Authorization).toBe(
        'Bearer new-access-token'
      );
      expect(mock.history.get[3].headers?.Authorization).toBe(
        'Bearer new-access-token'
      );
    });
  });
});
