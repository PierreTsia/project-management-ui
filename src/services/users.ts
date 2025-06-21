import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/user';

export class UsersService {
  static async whoami(): Promise<User> {
    const response = await apiClient.get('/users/whoami');
    return response.data;
  }
}
