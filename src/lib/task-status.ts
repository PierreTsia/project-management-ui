import type { TaskStatus } from '@/types/task';
import { useTranslations } from '@/hooks/useTranslations';

export const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['TODO', 'IN_PROGRESS'],
  IN_PROGRESS: ['TODO', 'IN_PROGRESS', 'DONE'],
  DONE: ['IN_PROGRESS', 'DONE'],
};

export const getAvailableStatuses = (
  currentStatus: TaskStatus
): TaskStatus[] => {
  return STATUS_TRANSITIONS[currentStatus] || [currentStatus];
};

export const getStatusLabel = (
  status: TaskStatus,
  t: ReturnType<typeof useTranslations>['t']
): string => {
  switch (status) {
    case 'TODO':
      return t('tasks.status.todo');
    case 'IN_PROGRESS':
      return t('tasks.status.in_progress');
    case 'DONE':
      return t('tasks.status.done');
    default:
      return status;
  }
};
