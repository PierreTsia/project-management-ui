import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';

const localeMap: Record<string, Locale> = {
  en: enUS,
  fr: fr,
};
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

/**
 * Returns true if the date is within the last N days.
 * @param dateInput Date or string
 * @param days Number of days (default 7)
 */
export function inUnderDays(dateInput: Date | string, days = 7): boolean {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays < days;
}

/**
 * Formats a date as relative time if within N days, otherwise as short date/time.
 * @param dateInput Date or string
 * @param locale date-fns Locale
 * @param days Number of days for relative threshold (default 7)
 */
export function showAbsoluteForRecentDate(
  dateInput: Date | string,
  language: 'en' | 'fr',
  days = 7
): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const locale = localeMap[language] || enUS;
  if (inUnderDays(date, days)) {
    return formatDistanceToNow(date, { addSuffix: true, locale });
  } else {
    return format(date, 'PP p', { locale });
  }
}
