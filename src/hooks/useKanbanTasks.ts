import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { TasksService } from '@/services/tasks';
import { taskKeys } from './useTasks';
import type {
  Task,
  TaskStatus,
  GlobalSearchTasksParams,
  GlobalSearchTasksResponse,
} from '@/types/task';

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

export const TWO_MINUTES_IN_MS = 1000 * 60 * 2;

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
    staleTime: TWO_MINUTES_IN_MS, // 2 minutes
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

// Infinite loading implementation using page-based pagination
export const useKanbanTasksInfinite = (filters: UseKanbanTasksParams = {}) => {
  const ITEMS_PER_PAGE = 20;

  // Query for TODO tasks with infinite loading
  const todoQuery = useInfiniteQuery({
    queryKey: taskKeys.v2GlobalSearch({
      ...filters,
      status: 'TODO',
    }),
    queryFn: ({ pageParam = 1 }) =>
      TasksService.searchAllUserTasks({
        ...filters,
        status: 'TODO',
        page: pageParam as number,
        limit: ITEMS_PER_PAGE,
      }),
    getNextPageParam: (lastPage: GlobalSearchTasksResponse) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: TWO_MINUTES_IN_MS, // 2 minutes
  });

  // Query for IN_PROGRESS tasks with infinite loading
  const inProgressQuery = useInfiniteQuery({
    queryKey: taskKeys.v2GlobalSearch({
      ...filters,
      status: 'IN_PROGRESS',
    }),
    queryFn: ({ pageParam = 1 }) =>
      TasksService.searchAllUserTasks({
        ...filters,
        status: 'IN_PROGRESS',
        page: pageParam as number,
        limit: ITEMS_PER_PAGE,
      }),
    getNextPageParam: (lastPage: GlobalSearchTasksResponse) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: TWO_MINUTES_IN_MS,
  });

  // Query for DONE tasks with infinite loading
  const doneQuery = useInfiniteQuery({
    queryKey: taskKeys.v2GlobalSearch({
      ...filters,
      status: 'DONE',
    }),
    queryFn: ({ pageParam = 1 }) =>
      TasksService.searchAllUserTasks({
        ...filters,
        status: 'DONE',
        page: pageParam as number,
        limit: ITEMS_PER_PAGE,
      }),
    getNextPageParam: (lastPage: GlobalSearchTasksResponse) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: TWO_MINUTES_IN_MS,
  });

  const columns: KanbanColumnData[] = [
    {
      status: 'TODO',
      tasks:
        todoQuery.data?.pages.flatMap(
          (page: GlobalSearchTasksResponse) => page.tasks
        ) || [],
      total: todoQuery.data?.pages[0]?.total || 0,
      hasMore: todoQuery.hasNextPage || false,
      nextCursor: undefined,
      isLoading: todoQuery.isLoading,
      error: todoQuery.error as Error | undefined,
    },
    {
      status: 'IN_PROGRESS',
      tasks:
        inProgressQuery.data?.pages.flatMap(
          (page: GlobalSearchTasksResponse) => page.tasks
        ) || [],
      total: inProgressQuery.data?.pages[0]?.total || 0,
      hasMore: inProgressQuery.hasNextPage || false,
      nextCursor: undefined,
      isLoading: inProgressQuery.isLoading,
      error: inProgressQuery.error as Error | undefined,
    },
    {
      status: 'DONE',
      tasks:
        doneQuery.data?.pages.flatMap(
          (page: GlobalSearchTasksResponse) => page.tasks
        ) || [],
      total: doneQuery.data?.pages[0]?.total || 0,
      hasMore: doneQuery.hasNextPage || false,
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

  const loadMore = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return todoQuery.fetchNextPage();
      case 'IN_PROGRESS':
        return inProgressQuery.fetchNextPage();
      case 'DONE':
        return doneQuery.fetchNextPage();
    }
  };

  return {
    columns,
    isLoading,
    hasError,
    loadMore,
    refetch: () => {
      todoQuery.refetch();
      inProgressQuery.refetch();
      doneQuery.refetch();
    },
  };
};
