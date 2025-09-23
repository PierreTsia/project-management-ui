import type { TaskPriority, TaskStatus } from '@/types/task';

export const getStatusBadgeVariant = (
  status: TaskStatus
): 'default' | 'secondary' | 'outline' => {
  if (status === 'DONE') return 'default';
  if (status === 'IN_PROGRESS') return 'secondary';
  return 'outline';
};

export const isHighPriority = (priority: TaskPriority): boolean =>
  priority === 'HIGH';

export const mapLanguageToLocale = (languageCode?: string): string => {
  if (!languageCode) return 'en-US';
  const base = languageCode.split('-')[0];
  if (base === 'fr') return 'fr-FR';
  return 'en-US';
};

export const formatDueDate = (
  dateString?: string,
  localeCode?: string
): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const locale = localeCode ? mapLanguageToLocale(localeCode) : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
  }).format(date);
};

export const isOverdue = (dueDate?: string): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};
