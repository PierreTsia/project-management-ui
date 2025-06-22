import { apiClient } from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
} from '@/types/auth';

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  }

  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  static async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  }

  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  static async confirmEmail(data: { token: string }): Promise<void> {
    await apiClient.post('/auth/confirm-email', data);
  }

  static async resendConfirmation(data: { email: string }): Promise<void> {
    await apiClient.post('/auth/resend-confirmation', data);
  }
}
