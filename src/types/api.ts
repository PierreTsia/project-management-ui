import type { Prettify } from './helpers';

// Common API response types
export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

export type PaginatedResponse<T> = Prettify<
  ApiResponse<T[]> & {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
>;

export interface ApiErrorResponse {
  code?: string;
  message: string;
  status: number;
  meta?: {
    language?: string;
    errors?: string[];
  };
}

export interface ApiError extends Error {
  response?: {
    data: ApiErrorResponse;
    status: number;
  };
}
