import { useInfiniteQuery } from '@tanstack/react-query';
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

export type UseKanbanTasksParams = Omit<GlobalSearchTasksParams, 'status'>;

const TWO_MINUTES_IN_MS = 1000 * 60 * 2;

export const useKanbanTasksInfinite = (filters: UseKanbanTasksParams = {}) => {
  const ITEMS_PER_PAGE = 20;

  // Remove pagination params from query key for infinite queries
  const { page: _, limit: __, ...infiniteFilters } = filters;

  // Query for TODO tasks with infinite loading
  const todoQueryKey = taskKeys.globalSearch({
    ...infiniteFilters,
    status: 'TODO',
  });

  const todoQuery = useInfiniteQuery({
    queryKey: todoQueryKey,
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
    staleTime: TWO_MINUTES_IN_MS,
  });

  // Query for IN_PROGRESS tasks with infinite loading
  const inProgressQuery = useInfiniteQuery({
    queryKey: taskKeys.globalSearch({
      ...infiniteFilters,
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
    queryKey: taskKeys.globalSearch({
      ...infiniteFilters,
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
