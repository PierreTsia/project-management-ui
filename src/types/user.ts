export type User = {
  id: string;
  email: string;
  name: string;
  provider: 'google' | null;
  providerId: string | null;
  bio: string | null;
  dob: string | null;
  phone: string | null;
  avatarUrl?: string;
  isEmailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
};
