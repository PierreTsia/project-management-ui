import type { User } from './user';
import type { Prettify } from './helpers';

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectId: string;
  projectName: string;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
};

export type UpdateTaskRequest = {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
};

export type UpdateTaskStatusRequest = {
  status: TaskStatus;
};

export type AssignTaskRequest = {
  assigneeId: string;
};

export type SearchTasksParams = {
  query?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  page?: number;
  limit?: number;
};

// Frontend-only shared pagination shapes
export type BasicPagination = {
  total: number;
  page: number;
  limit: number;
};

export type ExtendedPagination = Prettify<
  BasicPagination & {
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
>;

export type SearchTasksResponse = Prettify<
  BasicPagination & {
    tasks: Task[];
  }
>;

// Global tasks types
export type GlobalSearchTasksParams = {
  query?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  projectId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'status' | 'title';
  sortOrder?: 'ASC' | 'DESC';
  assigneeFilter?: 'me' | 'unassigned' | 'any';
  isOverdue?: boolean;
  hasDueDate?: boolean;
  page?: number;
  limit?: number;
};

export type GlobalSearchTasksResponse = Prettify<
  ExtendedPagination & {
    tasks: Task[];
  }
>;

// Bulk operation types
export type BulkUpdateStatusRequest = {
  taskIds: string[];
  status: TaskStatus;
  reason?: string;
};

export type BulkAssignTasksRequest = {
  taskIds: string[];
  assigneeId: string;
  reason?: string;
};

export type BulkDeleteTasksRequest = {
  taskIds: string[];
  reason?: string;
};

export type BulkOperationResult = {
  successCount: number;
  failureCount: number;
  totalCount: number;
  successfulTaskIds: string[];
  errors: Array<{
    taskId: string;
    error: string;
  }>;
  message?: string;
};

export type BulkOperationResponse = {
  result: BulkOperationResult;
  success: boolean;
  timestamp: string;
};
