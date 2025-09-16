import { TASK_STATUSES, type TaskStatus } from '@/types/task';

const TASK_STATUS_SET: ReadonlySet<string> = new Set(TASK_STATUSES);

export const isTaskStatus = (value: unknown): value is TaskStatus => {
  if (typeof value !== 'string') return false;
  return TASK_STATUS_SET.has(value);
};

export default isTaskStatus;
