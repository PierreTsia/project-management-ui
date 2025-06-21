import { apiClient } from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
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
}
