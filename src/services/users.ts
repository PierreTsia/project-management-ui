import { apiClient } from '@/lib/api-client';
import type {
  User,
  UpdateProfileRequest,
  AvatarUploadResponse,
} from '@/types/user';

export class UsersService {
  static async whoami(): Promise<User> {
    const response = await apiClient.get('/users/whoami');
    return response.data;
  }

  static async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.patch('/users/profile', data);
    return response.data;
  }

  static async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as AvatarUploadResponse;
  }
}
