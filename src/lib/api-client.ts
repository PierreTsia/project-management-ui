import axios from 'axios';
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { AuthService } from '@/services/auth';

// Extend Axios request config to include our custom _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token and language preference
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isRefreshOrLogout =
      config.url === '/auth/refresh' || config.url === '/auth/logout';
    const token = isRefreshOrLogout
      ? localStorage.getItem('refreshToken')
      : localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Accept-Language header based on user's language preference
    const userLanguage = localStorage.getItem('i18nextLng') || 'en';
    config.headers['Accept-Language'] = userLanguage;

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async error => {
    const originalRequest: CustomAxiosRequestConfig = error.config;

    // Don't attempt token refresh for auth endpoints
    const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err: unknown) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken, refreshToken } = await AuthService.refreshToken();
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        apiClient.defaults.headers.common['Authorization'] =
          'Bearer ' + accessToken;
        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError as Error, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
