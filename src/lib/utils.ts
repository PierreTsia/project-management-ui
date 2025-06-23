import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, locale?: string): string {
  const date = new Date(dateString);

  // Map i18n language codes to full locale codes
  const localeMap: Record<string, string> = {
    en: 'en-US',
    fr: 'fr-FR',
  };

  const fullLocale = locale ? localeMap[locale] || locale : 'en-US';

  return date.toLocaleDateString(fullLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Extract error message from API response
 * Handles axios errors and provides fallback messages
 */
export function getApiErrorMessage(error: unknown): string {
  // Check if it's an axios error with response data
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }

  // Check if it's a regular Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred';
}
