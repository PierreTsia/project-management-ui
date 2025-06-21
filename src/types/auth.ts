import type { User } from './user';

export type LoginRequest = {
  email: string;
  password?: string;
  provider?: 'google';
  idToken?: string;
};

export type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password?: string;
  provider?: 'google';
  idToken?: string;
};

export type RegisterResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
