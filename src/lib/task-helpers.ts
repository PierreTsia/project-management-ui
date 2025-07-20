import type { Task, TaskStatus } from '@/types/task';

/**
 * Get the appropriate badge variant for task priority
 */
export const getPriorityVariant = (priority: Task['priority']) => {
  switch (priority) {
    case 'HIGH':
      return 'destructive' as const;
    case 'MEDIUM':
      return 'default' as const;
    case 'LOW':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
};

/**
 * Format due date for display
 */
export const formatDueDate = (dueDate?: string) => {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) {
    return { formatted: 'Today', isToday: true };
  } else if (isTomorrow) {
    return { formatted: 'Tomorrow', isToday: false };
  } else {
    return { formatted: date.toLocaleDateString(), isToday: false };
  }
};

/**
 * Get available status transitions for a given current status
 */
export const getAvailableStatuses = (
  currentStatus: TaskStatus
): TaskStatus[] => {
  const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    TODO: ['TODO', 'IN_PROGRESS'],
    IN_PROGRESS: ['TODO', 'IN_PROGRESS', 'DONE'],
    DONE: ['IN_PROGRESS', 'DONE'],
  };

  return STATUS_TRANSITIONS[currentStatus] || [currentStatus];
};
