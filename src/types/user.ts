export type User = {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'local' | null;
  providerId?: string | null;
  bio: string | null;
  dob: string | null;
  phone: string | null;
  avatarUrl?: string;
  isEmailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  canChangePassword?: boolean;
};

export type UpdateProfileRequest = {
  name: string;
  bio?: string | null;
  phone?: string | null;
  dob?: string | null;
};

export type AvatarUploadResponse = {
  id: string;
  avatarUrl: string;
};

export type UpdatePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};
