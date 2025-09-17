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

    it('should not add Authorization header when no token exists', async () => {
      localStorage.clear();
      mock.onGet('/test').reply(200);

      await apiClient.get('/test');

      expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
    });

    it('should add Accept-Language header based on user language preference', async () => {
      localStorage.setItem('i18nextLng', 'fr');
      mock.onGet('/test').reply(200);

      await apiClient.get('/test');

      expect(mock.history.get[0].headers?.['Accept-Language']).toBe('fr');
    });

    it('should default Accept-Language to en when no language preference exists', async () => {
      localStorage.clear();
      mock.onGet('/test').reply(200);

      await apiClient.get('/test');

      expect(mock.history.get[0].headers?.['Accept-Language']).toBe('en');
    });

    it('should handle different language preferences', async () => {
      const languages = ['en', 'fr', 'es', 'de'];

      for (const lang of languages) {
        localStorage.setItem('i18nextLng', lang);
        mock.onGet(`/test-${lang}`).reply(200);

        await apiClient.get(`/test-${lang}`);

        const lastRequest = mock.history.get[mock.history.get.length - 1];
        expect(lastRequest.headers?.['Accept-Language']).toBe(lang);
      }
    });

    it('should handle request interceptor errors', async () => {
      // Mock localStorage.getItem to throw an error
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('Request interceptor error');
      });

      await expect(apiClient.get('/test')).rejects.toThrow(
        'Request interceptor error'
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

    it('should handle queued request failures when refresh fails', async () => {
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

      mock.onGet('/one').replyOnce(401);
      mock.onGet('/two').replyOnce(401);

      vi.mocked(AuthService.refreshToken).mockRejectedValue(
        new Error('Refresh failed')
      );

      // Start both requests simultaneously to trigger queuing
      const promise1 = apiClient.get('/one');
      const promise2 = apiClient.get('/two');

      await expect(Promise.all([promise1, promise2])).rejects.toThrow();

      expect(mockLocation.href).toBe('/login');

      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });
  });

  describe('Response Interceptor (Non-401 Errors)', () => {
    it('should pass through non-401 errors without attempting refresh', async () => {
      mock
        .onGet('/server-error')
        .reply(500, { message: 'Internal Server Error' });

      await expect(apiClient.get('/server-error')).rejects.toMatchObject({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      });

      expect(AuthService.refreshToken).not.toHaveBeenCalled();
    });

    it('should pass through network errors without attempting refresh', async () => {
      mock.onGet('/network-error').networkError();

      await expect(apiClient.get('/network-error')).rejects.toThrow();

      expect(AuthService.refreshToken).not.toHaveBeenCalled();
    });
  });
});
