import { useQuery } from '@tanstack/react-query';
import { TasksService } from '@/services/tasks';
import { taskKeys } from './useTasks';
import type { Task, TaskStatus, GlobalSearchTasksParams } from '@/types/task';

export type KanbanColumnData = {
  status: TaskStatus;
  tasks: Task[];
  total: number;
  hasMore: boolean;
  nextCursor?: string | undefined;
  isLoading: boolean;
  error?: Error | undefined;
};

export type UseKanbanTasksParams = Omit<
  GlobalSearchTasksParams,
  'status' | 'page' | 'limit'
>;

export const useKanbanTasks = (filters: UseKanbanTasksParams = {}) => {
  const ITEMS_PER_PAGE = 20;

  // Query for TODO tasks
  const todoQuery = useQuery({
    queryKey: taskKeys.v2GlobalSearch({
      ...filters,
      status: 'TODO',
      limit: ITEMS_PER_PAGE,
    }),
    queryFn: () =>
      TasksService.searchAllUserTasks({
        ...filters,
        status: 'TODO',
        limit: ITEMS_PER_PAGE,
      }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Query for IN_PROGRESS tasks
  const inProgressQuery = useQuery({
    queryKey: taskKeys.v2GlobalSearch({
      ...filters,
      status: 'IN_PROGRESS',
      limit: ITEMS_PER_PAGE,
    }),
    queryFn: () =>
      TasksService.searchAllUserTasks({
        ...filters,
        status: 'IN_PROGRESS',
        limit: ITEMS_PER_PAGE,
      }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Query for DONE tasks
  const doneQuery = useQuery({
    queryKey: taskKeys.v2GlobalSearch({
      ...filters,
      status: 'DONE',
      limit: ITEMS_PER_PAGE,
    }),
    queryFn: () =>
      TasksService.searchAllUserTasks({
        ...filters,
        status: 'DONE',
        limit: ITEMS_PER_PAGE,
      }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const columns: KanbanColumnData[] = [
    {
      status: 'TODO',
      tasks: todoQuery.data?.tasks || [],
      total: todoQuery.data?.total || 0,
      hasMore: todoQuery.data?.hasNextPage || false,
      nextCursor: undefined,
      isLoading: todoQuery.isLoading,
      error: todoQuery.error as Error | undefined,
    },
    {
      status: 'IN_PROGRESS',
      tasks: inProgressQuery.data?.tasks || [],
      total: inProgressQuery.data?.total || 0,
      hasMore: inProgressQuery.data?.hasNextPage || false,
      nextCursor: undefined,
      isLoading: inProgressQuery.isLoading,
      error: inProgressQuery.error as Error | undefined,
    },
    {
      status: 'DONE',
      tasks: doneQuery.data?.tasks || [],
      total: doneQuery.data?.total || 0,
      hasMore: doneQuery.data?.hasNextPage || false,
      nextCursor: undefined,
      isLoading: doneQuery.isLoading,
      error: doneQuery.error as Error | undefined,
    },
  ];

  const isLoading =
    todoQuery.isLoading || inProgressQuery.isLoading || doneQuery.isLoading;
  const hasError = !!(
    todoQuery.error ||
    inProgressQuery.error ||
    doneQuery.error
  );

  return {
    columns,
    isLoading,
    hasError,
    refetch: () => {
      todoQuery.refetch();
      inProgressQuery.refetch();
      doneQuery.refetch();
    },
  };
};

// Future implementation for cursor-based pagination
// This will be implemented when the API supports cursor-based pagination
export const useKanbanTasksInfinite = (filters: UseKanbanTasksParams = {}) => {
  // For now, fall back to the regular hook
  return useKanbanTasks(filters);
};
