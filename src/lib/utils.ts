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
