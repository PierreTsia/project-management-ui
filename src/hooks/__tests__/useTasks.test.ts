import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createElement } from 'react';
import { act } from 'react';
import {
  useProjectTasks,
  useSearchProjectTasks,
  useTask,
  useCreateTask,
  taskKeys,
  useDeleteTask,
  useUpdateTaskStatus,
  useAssignTask,
  useUpdateTask,
  useTaskAttachments,
  useTaskAttachment,
  useUploadTaskAttachment,
  useDeleteTaskAttachment,
  useUnassignTask,
  useAllUserTasks,
  useSearchAllUserTasks,
  useBulkUpdateStatus,
  useBulkAssignTasks,
  useBulkDeleteTasks,
} from '../useTasks';
import { TasksService } from '@/services/tasks';
import {
  createMockTask,
  createMockUser,
  createMockTaskWithoutAssignee,
} from '../../test/mock-factories';
import type {
  Task,
  SearchTasksParams,
  SearchTasksResponse,
  GlobalSearchTasksParams,
  GlobalSearchTasksResponse,
  BulkUpdateStatusRequest,
  BulkAssignTasksRequest,
  BulkDeleteTasksRequest,
  BulkOperationResponse,
} from '@/types/task';
import type { Attachment } from '@/types/attachment';

// Mock TasksService
vi.mock('@/services/tasks');
const mockTasksService = vi.mocked(TasksService);

// Mock console.error to avoid noise in tests
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => {});

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useProjectTasks', () => {
    it('should fetch project tasks successfully', async () => {
      const projectId = 'project-123';
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Test Task 1',
          description: 'A test task',
          status: 'TODO',
          priority: 'MEDIUM',
          projectId: projectId,
          projectName: 'Project 123',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'task-2',
          title: 'Test Task 2',
          description: 'Another test task',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          projectId: projectId,
          projectName: 'Project 123',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ];

      mockTasksService.getProjectTasks.mockResolvedValue(mockTasks);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjectTasks(projectId), {
        wrapper,
      });

      // Should start loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTasks);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(mockTasksService.getProjectTasks).toHaveBeenCalledTimes(1);
      expect(mockTasksService.getProjectTasks).toHaveBeenCalledWith(projectId);
    });

    it('should handle project ID requirement', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjectTasks(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockTasksService.getProjectTasks).not.toHaveBeenCalled();
    });

    it('should use correct query key', async () => {
      const projectId = 'project-123';
      const mockTasks: Task[] = [];

      mockTasksService.getProjectTasks.mockResolvedValue(mockTasks);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      renderHook(() => useProjectTasks(projectId), { wrapper });

      await waitFor(() => {
        const queryData = queryClient.getQueryData([
          'tasks',
          'list',
          projectId,
          {},
        ]);
        expect(queryData).toEqual(mockTasks);
      });
    });

    it('should handle API errors gracefully', async () => {
      const projectId = 'project-123';
      const mockError = new Error('Failed to fetch tasks');
      mockTasksService.getProjectTasks.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjectTasks(projectId), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });

    it('should respect stale time configuration', async () => {
      const projectId = 'project-123';
      const mockTasks: Task[] = [];

      mockTasksService.getProjectTasks.mockResolvedValue(mockTasks);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjectTasks(projectId), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should not refetch immediately due to stale time
      expect(mockTasksService.getProjectTasks).toHaveBeenCalledTimes(1);
    });
  });

  describe('useSearchProjectTasks', () => {
    it('should search tasks with parameters', async () => {
      const projectId = 'project-123';
      const params: SearchTasksParams = {
        query: 'test',
        status: 'TODO',
        priority: 'HIGH',
        page: 1,
        limit: 10,
      };

      const mockResponse: SearchTasksResponse = {
        tasks: [
          {
            id: 'task-1',
            title: 'Test Task',
            description: 'A test task',
            status: 'TODO',
            priority: 'HIGH',
            projectId: projectId,
            projectName: 'Project 123',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockTasksService.searchProjectTasks.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useSearchProjectTasks(projectId, params),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockTasksService.searchProjectTasks).toHaveBeenCalledWith(
        projectId,
        params
      );
    });

    it('should handle empty search parameters', async () => {
      const projectId = 'project-123';
      const mockResponse: SearchTasksResponse = {
        tasks: [],
        total: 0,
        page: 1,
        limit: 6,
      };

      mockTasksService.searchProjectTasks.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSearchProjectTasks(projectId), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockTasksService.searchProjectTasks).toHaveBeenCalledWith(
        projectId,
        undefined
      );
    });

    it('should use correct query key with params', async () => {
      const projectId = 'project-123';
      const params: SearchTasksParams = { query: 'test' };
      const mockResponse: SearchTasksResponse = {
        tasks: [],
        total: 0,
        page: 1,
        limit: 6,
      };

      mockTasksService.searchProjectTasks.mockResolvedValue(mockResponse);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      renderHook(() => useSearchProjectTasks(projectId, params), { wrapper });

      await waitFor(() => {
        const queryData = queryClient.getQueryData([
          'tasks',
          'search',
          projectId,
          params,
        ]);
        expect(queryData).toEqual(mockResponse);
      });
    });

    it('should handle API errors gracefully', async () => {
      const projectId = 'project-123';
      const params: SearchTasksParams = { query: 'test' };
      const mockError = new Error('Failed to search tasks');
      mockTasksService.searchProjectTasks.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useSearchProjectTasks(projectId, params),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useTask', () => {
    it('should fetch single task successfully', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockTask = createMockTask({
        id: taskId,
        title: 'Test Task',
        description: 'A test task',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: projectId,
      });

      mockTasksService.getTask.mockResolvedValue(mockTask);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTask(projectId, taskId), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTask);
      expect(mockTasksService.getTask).toHaveBeenCalledWith(projectId, taskId);
    });

    it('should require both project and task IDs', () => {
      const wrapper = createWrapper();

      // Test with empty projectId
      const { result: result1 } = renderHook(() => useTask('', 'task-456'), {
        wrapper,
      });
      expect(result1.current.isLoading).toBe(false);
      expect(result1.current.data).toBeUndefined();
      expect(mockTasksService.getTask).not.toHaveBeenCalled();

      // Test with empty taskId
      const { result: result2 } = renderHook(() => useTask('project-123', ''), {
        wrapper,
      });
      expect(result2.current.isLoading).toBe(false);
      expect(result2.current.data).toBeUndefined();
      expect(mockTasksService.getTask).not.toHaveBeenCalled();
    });

    it('should use correct query key', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockTask = createMockTask({
        id: taskId,
        title: 'Test Task',
        description: 'A test task',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: projectId,
      });

      mockTasksService.getTask.mockResolvedValue(mockTask);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      renderHook(() => useTask(projectId, taskId), { wrapper });

      await waitFor(() => {
        const queryData = queryClient.getQueryData([
          'tasks',
          'detail',
          projectId,
          taskId,
        ]);
        expect(queryData).toEqual(mockTask);
      });
    });

    it('should handle API errors gracefully', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockError = new Error('Task not found');
      mockTasksService.getTask.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTask(projectId, taskId), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useCreateTask', () => {
    it('should create a task successfully', async () => {
      const mockTask = createMockTask({
        id: 'task-1',
        title: 'New Task',
        description: 'Task description',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: 'project-1',
        assignee: createMockUser({
          id: 'user-id',
          email: 'user@example.com',
          name: 'Test User',
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=user',
        }),
      });

      mockTasksService.createTask.mockResolvedValue(mockTask);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTask(), {
        wrapper,
      });

      const createData = {
        projectId: 'project-1',
        data: {
          title: 'New Task',
          description: 'Task description',
          priority: 'MEDIUM' as const,
        },
      };

      await act(async () => {
        await result.current.mutateAsync(createData);
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTask);
      expect(mockTasksService.createTask).toHaveBeenCalledWith(
        createData.projectId,
        createData.data
      );
    });

    it('should handle create task error', async () => {
      const mockError = new Error('Failed to create task');
      mockTasksService.createTask.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTask(), {
        wrapper,
      });

      const createData = {
        projectId: 'project-1',
        data: {
          title: 'New Task',
          description: 'Task description',
          priority: 'MEDIUM' as const,
        },
      };

      await act(async () => {
        try {
          await result.current.mutateAsync(createData);
        } catch {
          // expected error
        }
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(mockError);
      });
    });

    it('should invalidate project tasks queries on success', async () => {
      const mockTask = createMockTask({
        id: 'task-1',
        title: 'New Task',
        description: 'Task description',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: 'project-1',
        assignee: createMockUser({
          id: 'user-id',
          email: 'user@example.com',
          name: 'Test User',
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=user',
        }),
      });

      mockTasksService.createTask.mockResolvedValue(mockTask);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useCreateTask(), { wrapper });

      const createData = {
        projectId: 'project-1',
        data: {
          title: 'New Task',
          description: 'Task description',
          priority: 'MEDIUM' as const,
        },
      };

      await act(async () => {
        await result.current.mutateAsync(createData);
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: taskKeys.lists(),
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: taskKeys.list(createData.projectId, {}),
      });
    });
  });

  describe('useUpdateTask', () => {
    const projectId = 'project-1';
    const taskId = 'task-1';
    const updateData = {
      title: 'Updated Task',
      description: 'Updated desc',
      priority: 'HIGH' as const,
    };

    it('should update task successfully', async () => {
      const mockTask = createMockTask({
        id: taskId,
        title: 'Updated Task',
        description: 'Updated desc',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId,
        updatedAt: '2024-01-02T00:00:00Z',
      });
      mockTasksService.updateTask.mockResolvedValue(mockTask);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateTask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
          data: updateData,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTask);
      expect(mockTasksService.updateTask).toHaveBeenCalledWith(
        projectId,
        taskId,
        updateData
      );
    });

    it('should update cache and invalidate queries on success', async () => {
      const mockTask = createMockTask({
        id: taskId,
        title: 'Updated Task',
        description: 'Updated desc',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId,
        updatedAt: '2024-01-02T00:00:00Z',
      });
      mockTasksService.updateTask.mockResolvedValue(mockTask);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useUpdateTask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
          data: updateData,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(setQueryDataSpy).toHaveBeenCalledWith(
        taskKeys.detail(projectId, taskId),
        mockTask
      );
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: taskKeys.list(projectId, {}),
      });
    });

    it('should handle API error', async () => {
      const mockError = new Error('Failed to update task');
      mockTasksService.updateTask.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateTask(), { wrapper });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            projectId,
            taskId,
            data: updateData,
          });
        } catch {
          // expected error
        }
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(mockError);
      });
    });
  });

  describe('useDeleteTask', () => {
    const projectId = 'project-1';
    const taskId = 'task-1';

    it('should delete task successfully', async () => {
      mockTasksService.deleteTask.mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ projectId, taskId });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockTasksService.deleteTask).toHaveBeenCalledWith(
        projectId,
        taskId
      );
    });

    it('should remove task from cache and invalidate queries on success', async () => {
      mockTasksService.deleteTask.mockResolvedValue(undefined);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useDeleteTask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ projectId, taskId });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(removeQueriesSpy).toHaveBeenCalledWith({
        queryKey: taskKeys.detail(projectId, taskId),
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: taskKeys.list(projectId, {}),
      });
    });

    it('should handle delete error', async () => {
      const mockError = new Error('Failed to delete task');
      mockTasksService.deleteTask.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTask(), { wrapper });

      await act(async () => {
        try {
          await result.current.mutateAsync({ projectId, taskId });
        } catch {
          // expected error
        }
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(mockError);
      });
    });
  });

  describe('useUpdateTaskStatus', () => {
    const projectId = 'project-1';
    const taskId = 'task-1';
    const updateData = { status: 'IN_PROGRESS' as const };

    it('should update task status successfully', async () => {
      const mockTask = createMockTask({
        id: taskId,
        title: 'Task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId,
        updatedAt: '2024-01-02T00:00:00Z',
      });
      mockTasksService.updateTaskStatus.mockResolvedValue(mockTask);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateTaskStatus(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
          data: updateData,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTask);
      expect(mockTasksService.updateTaskStatus).toHaveBeenCalledWith(
        projectId,
        taskId,
        updateData
      );
    });

    it('should update cache and invalidate queries on success', async () => {
      const mockTask = createMockTask({
        id: taskId,
        title: 'Task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId,
        updatedAt: '2024-01-02T00:00:00Z',
      });
      mockTasksService.updateTaskStatus.mockResolvedValue(mockTask);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useUpdateTaskStatus(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
          data: updateData,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(setQueryDataSpy).toHaveBeenCalledWith(
        taskKeys.detail(projectId, taskId),
        mockTask
      );
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: taskKeys.list(projectId, {}),
      });
    });

    it('should handle API error and log', async () => {
      const mockError = new Error('Failed to update status');
      mockTasksService.updateTaskStatus.mockRejectedValue(mockError);
      const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateTaskStatus(), { wrapper });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            projectId,
            taskId,
            data: updateData,
          });
        } catch {
          // expected error
        }
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(mockError);
      });
      logSpy.mockRestore();
    });

    it('should rollback cache on error after optimistic update', async () => {
      const previousTask = createMockTask({
        id: taskId,
        status: 'TODO',
        projectId,
      });
      const listBefore = [previousTask];

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useUpdateTaskStatus(), { wrapper });

      // Seed caches after hook is created but before mutation
      queryClient.setQueryData(taskKeys.list(projectId, {}), listBefore);
      queryClient.setQueryData(
        taskKeys.detail(projectId, taskId),
        previousTask
      );

      // make service reject to trigger rollback
      mockTasksService.updateTaskStatus.mockRejectedValueOnce(
        new Error('boom')
      );

      await act(async () => {
        try {
          await result.current.mutateAsync({
            projectId,
            taskId,
            data: { status: 'IN_PROGRESS' },
          });
        } catch {
          // expected error
        }
      });

      // After error, caches should be rolled back to original state
      const listAfter = queryClient.getQueryData<Task[]>(
        taskKeys.list(projectId, {})
      );
      const detailAfter = queryClient.getQueryData<Task>(
        taskKeys.detail(projectId, taskId)
      );
      expect(listAfter?.find(t => t.id === taskId)?.status).toBe('TODO');
      expect(detailAfter?.status).toBe('TODO');
    });

    it('should keep optimistic status when mutation succeeds', async () => {
      const previousTask = createMockTask({
        id: taskId,
        status: 'TODO',
        projectId,
      });
      const nextTask = { ...previousTask, status: 'IN_PROGRESS' as const };

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      queryClient.setQueryData(taskKeys.list(projectId, {}), [previousTask]);
      queryClient.setQueryData(
        taskKeys.detail(projectId, taskId),
        previousTask
      );

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      // resolve with updated task
      mockTasksService.updateTaskStatus.mockResolvedValueOnce(nextTask);

      const { result } = renderHook(() => useUpdateTaskStatus(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
          data: { status: 'IN_PROGRESS' },
        });
      });

      const listAfter = queryClient.getQueryData<Task[]>(
        taskKeys.list(projectId, {})
      );
      const detailAfter = queryClient.getQueryData<Task>(
        taskKeys.detail(projectId, taskId)
      );
      expect(listAfter?.find(t => t.id === taskId)?.status).toBe('IN_PROGRESS');
      expect(detailAfter?.status).toBe('IN_PROGRESS');
    });
  });

  describe('useAssignTask', () => {
    const projectId = 'project-1';
    const taskId = 'task-1';
    const assignData = { assigneeId: 'user-123' };

    it('should assign task to user successfully', async () => {
      const mockTask = createMockTask({
        id: taskId,
        title: 'Task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId,
        assignee: createMockUser({
          id: 'user-123',
          email: 'user123@example.com',
          name: 'Test User 123',
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=user123',
        }),
        updatedAt: '2024-01-02T00:00:00Z',
      });
      mockTasksService.assignTask.mockResolvedValue(mockTask);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAssignTask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
          data: assignData,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTask);
      expect(mockTasksService.assignTask).toHaveBeenCalledWith(
        projectId,
        taskId,
        assignData
      );
    });

    it('should update cache and invalidate queries on success', async () => {
      const mockTask = createMockTask({
        id: taskId,
        title: 'Task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId,
        assignee: createMockUser({
          id: 'user-123',
          email: 'user123@example.com',
          name: 'Test User 123',
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=user123',
        }),
        updatedAt: '2024-01-02T00:00:00Z',
      });
      mockTasksService.assignTask.mockResolvedValue(mockTask);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useAssignTask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
          data: assignData,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(setQueryDataSpy).toHaveBeenCalledWith(
        taskKeys.detail(projectId, taskId),
        mockTask
      );
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: taskKeys.list(projectId, {}),
      });
    });

    it('should handle API error', async () => {
      const mockError = new Error('Failed to assign task');
      mockTasksService.assignTask.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAssignTask(), { wrapper });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            projectId,
            taskId,
            data: assignData,
          });
        } catch {
          // expected error
        }
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(mockError);
      });
    });
  });

  describe('useUnassignTask', () => {
    const projectId = 'project-1';
    const taskId = 'task-1';

    it('should unassign task successfully', async () => {
      const mockTask = createMockTask({
        id: taskId,
        title: 'Task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId,
        updatedAt: '2024-01-02T00:00:00Z',
      });
      mockTasksService.unassignTask.mockResolvedValue(mockTask);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnassignTask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTask);
      expect(mockTasksService.unassignTask).toHaveBeenCalledWith(
        projectId,
        taskId
      );
    });

    it('should update cache and invalidate queries on success', async () => {
      const mockTask = createMockTask({
        id: taskId,
        title: 'Task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId,
        updatedAt: '2024-01-02T00:00:00Z',
      });
      mockTasksService.unassignTask.mockResolvedValue(mockTask);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useUnassignTask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(setQueryDataSpy).toHaveBeenCalledWith(
        taskKeys.detail(projectId, taskId),
        mockTask
      );
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: taskKeys.list(projectId, {}),
      });
    });

    it('should handle API error', async () => {
      const mockError = new Error('Failed to unassign task');
      mockTasksService.unassignTask.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnassignTask(), { wrapper });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            projectId,
            taskId,
          });
        } catch {
          // expected error
        }
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(mockError);
      });
    });

    it('should handle unassigning already unassigned task', async () => {
      const mockTask = createMockTaskWithoutAssignee({
        id: taskId,
        title: 'Task',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId,
        updatedAt: '2024-01-02T00:00:00Z',
      });
      mockTasksService.unassignTask.mockResolvedValue(mockTask);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnassignTask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTask);
      expect(result.current.data?.assignee).toBeUndefined();
      expect(mockTasksService.unassignTask).toHaveBeenCalledWith(
        projectId,
        taskId
      );
    });

    it('should work with different project and task IDs', async () => {
      const differentProjectId = 'project-999';
      const differentTaskId = 'task-999';

      const mockTask = createMockTaskWithoutAssignee({
        id: differentTaskId,
        title: 'Different Task',
        status: 'TODO',
        priority: 'LOW',
        projectId: differentProjectId,
        updatedAt: '2024-01-02T00:00:00Z',
      });
      mockTasksService.unassignTask.mockResolvedValue(mockTask);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUnassignTask(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          projectId: differentProjectId,
          taskId: differentTaskId,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockTasksService.unassignTask).toHaveBeenCalledWith(
        differentProjectId,
        differentTaskId
      );
    });
  });

  describe('useTaskAttachments', () => {
    const projectId = 'project-123';
    const taskId = 'task-456';

    it('should fetch task attachments successfully', async () => {
      const mockAttachments: Attachment[] = [
        {
          id: 'attachment-1',
          filename: 'document.pdf',
          fileType: 'application/pdf',
          fileSize: 1024000,
          cloudinaryUrl: 'https://res.cloudinary.com/example/file.pdf',
          entityType: 'TASK',
          entityId: taskId,
          uploadedAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          uploadedBy: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
            provider: null,
            providerId: null,
            bio: null,
            dob: null,
            phone: null,
            avatarUrl: '',
            isEmailConfirmed: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
      ];

      mockTasksService.getTaskAttachments.mockResolvedValue(mockAttachments);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTaskAttachments(projectId, taskId),
        {
          wrapper,
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAttachments);
      expect(mockTasksService.getTaskAttachments).toHaveBeenCalledWith(
        projectId,
        taskId
      );
    });

    it('should handle missing IDs', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTaskAttachments('', taskId), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockTasksService.getTaskAttachments).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Failed to fetch attachments');
      mockTasksService.getTaskAttachments.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTaskAttachments(projectId, taskId),
        {
          wrapper,
        }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useTaskAttachment', () => {
    const projectId = 'project-123';
    const taskId = 'task-456';
    const attachmentId = 'attachment-1';

    it('should fetch single task attachment successfully', async () => {
      const mockAttachment: Attachment = {
        id: attachmentId,
        filename: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
        cloudinaryUrl: 'https://res.cloudinary.com/example/file.pdf',
        entityType: 'TASK',
        entityId: taskId,
        uploadedAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        uploadedBy: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          provider: null,
          providerId: null,
          bio: null,
          dob: null,
          phone: null,
          avatarUrl: '',
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      mockTasksService.getTaskAttachment.mockResolvedValue(mockAttachment);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTaskAttachment(projectId, taskId, attachmentId),
        {
          wrapper,
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAttachment);
      expect(mockTasksService.getTaskAttachment).toHaveBeenCalledWith(
        projectId,
        taskId,
        attachmentId
      );
    });

    it('should handle missing IDs', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTaskAttachment('', taskId, attachmentId),
        {
          wrapper,
        }
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockTasksService.getTaskAttachment).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Attachment not found');
      mockTasksService.getTaskAttachment.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTaskAttachment(projectId, taskId, attachmentId),
        {
          wrapper,
        }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useUploadTaskAttachment', () => {
    it('should upload task attachment successfully', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const uploadRequest = { file };

      const mockAttachment: Attachment = {
        id: 'attachment-1',
        filename: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        cloudinaryUrl: 'https://res.cloudinary.com/example/test.pdf',
        entityType: 'TASK',
        entityId: taskId,
        uploadedAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        uploadedBy: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          provider: null,
          providerId: null,
          bio: null,
          dob: null,
          phone: null,
          avatarUrl: '',
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      mockTasksService.uploadTaskAttachment.mockResolvedValue(mockAttachment);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUploadTaskAttachment(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
          data: uploadRequest,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockTasksService.uploadTaskAttachment).toHaveBeenCalledWith(
        projectId,
        taskId,
        uploadRequest
      );
    });

    it('should handle upload errors', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const uploadRequest = { file };

      const mockError = new Error('Upload failed');
      mockTasksService.uploadTaskAttachment.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUploadTaskAttachment(), {
        wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            projectId,
            taskId,
            data: uploadRequest,
          });
        } catch {
          // expected error
        }
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockTasksService.uploadTaskAttachment).toHaveBeenCalledWith(
        projectId,
        taskId,
        uploadRequest
      );
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useDeleteTaskAttachment', () => {
    it('should delete task attachment successfully', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const attachmentId = 'attachment-1';

      mockTasksService.deleteTaskAttachment.mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTaskAttachment(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          projectId,
          taskId,
          attachmentId,
        });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockTasksService.deleteTaskAttachment).toHaveBeenCalledWith(
        projectId,
        taskId,
        attachmentId
      );
    });

    it('should handle deletion errors', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const attachmentId = 'attachment-1';

      const mockError = new Error('Deletion failed');
      mockTasksService.deleteTaskAttachment.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTaskAttachment(), {
        wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            projectId,
            taskId,
            attachmentId,
          });
        } catch {
          // expected error
        }
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockTasksService.deleteTaskAttachment).toHaveBeenCalledWith(
        projectId,
        taskId,
        attachmentId
      );
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useAllUserTasks', () => {
    it('should fetch all user tasks successfully', async () => {
      const mockResponse: GlobalSearchTasksResponse = {
        tasks: [
          createMockTask({
            id: 'task-1',
            title: 'Global Task 1',
            projectId: 'project-1',
            projectName: 'Project 1',
          }),
          createMockTask({
            id: 'task-2',
            title: 'Global Task 2',
            projectId: 'project-2',
            projectName: 'Project 2',
          }),
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockTasksService.getAllUserTasks.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAllUserTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockTasksService.getAllUserTasks).toHaveBeenCalledWith(undefined);
    });

    it('should fetch all user tasks with parameters', async () => {
      const params: GlobalSearchTasksParams = {
        query: 'urgent',
        status: 'TODO',
        page: 1,
        limit: 10,
      };

      const mockResponse: GlobalSearchTasksResponse = {
        tasks: [
          createMockTask({
            id: 'urgent-task',
            title: 'Urgent Task',
            status: 'TODO',
            projectId: 'project-1',
            projectName: 'Project 1',
          }),
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockTasksService.getAllUserTasks.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAllUserTasks(params), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockTasksService.getAllUserTasks).toHaveBeenCalledWith(params);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Failed to fetch global tasks');
      mockTasksService.getAllUserTasks.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAllUserTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useSearchAllUserTasks', () => {
    it('should search all user tasks successfully', async () => {
      const params: GlobalSearchTasksParams = {
        query: 'test',
        priority: 'HIGH',
      };

      const mockResponse: GlobalSearchTasksResponse = {
        tasks: [
          createMockTask({
            id: 'test-task',
            title: 'Test Task',
            priority: 'HIGH',
            projectId: 'project-1',
            projectName: 'Project 1',
          }),
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockTasksService.searchAllUserTasks.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSearchAllUserTasks(params), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockTasksService.searchAllUserTasks).toHaveBeenCalledWith(params);
    });

    it('should search with no parameters', async () => {
      const mockResponse: GlobalSearchTasksResponse = {
        tasks: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockTasksService.searchAllUserTasks.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSearchAllUserTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockTasksService.searchAllUserTasks).toHaveBeenCalledWith(
        undefined
      );
    });

    it('should handle search errors', async () => {
      const mockError = new Error('Search failed');
      mockTasksService.searchAllUserTasks.mockRejectedValue(mockError);

      const { result } = renderHook(() => useSearchAllUserTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useBulkUpdateStatus', () => {
    it('should update task status in bulk successfully', async () => {
      const bulkRequest: BulkUpdateStatusRequest = {
        taskIds: ['task-1', 'task-2', 'task-3'],
        status: 'DONE',
      };

      const mockResponse: BulkOperationResponse = {
        success: true,
        result: {
          successCount: 3,
          failureCount: 0,
          totalCount: 3,
          successfulTaskIds: ['task-1', 'task-2', 'task-3'],
          errors: [],
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockTasksService.bulkUpdateStatus.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBulkUpdateStatus(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(bulkRequest);
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data).toEqual(mockResponse);
      expect(mockTasksService.bulkUpdateStatus).toHaveBeenCalledWith(
        bulkRequest
      );
    });

    it('should handle partial success with errors', async () => {
      const bulkRequest: BulkUpdateStatusRequest = {
        taskIds: ['task-1', 'invalid-task'],
        status: 'IN_PROGRESS',
      };

      const mockResponse: BulkOperationResponse = {
        success: false,
        result: {
          successCount: 1,
          failureCount: 1,
          totalCount: 2,
          successfulTaskIds: ['task-1'],
          errors: [
            { taskId: 'invalid-task', error: 'Task invalid-task not found' },
          ],
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockTasksService.bulkUpdateStatus.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBulkUpdateStatus(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(bulkRequest);
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.result.successCount).toBe(1);
      expect(result.current.data?.result.errors).toHaveLength(1);
    });

    it('should handle bulk update errors', async () => {
      const bulkRequest: BulkUpdateStatusRequest = {
        taskIds: ['task-1'],
        status: 'DONE',
      };

      const mockError = new Error('Bulk update failed');
      mockTasksService.bulkUpdateStatus.mockRejectedValue(mockError);

      const { result } = renderHook(() => useBulkUpdateStatus(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync(bulkRequest);
        } catch {
          // expected error
        }
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useBulkAssignTasks', () => {
    it('should assign tasks in bulk successfully', async () => {
      const bulkRequest: BulkAssignTasksRequest = {
        taskIds: ['task-1', 'task-2'],
        assigneeId: 'user-123',
      };

      const mockResponse: BulkOperationResponse = {
        success: true,
        result: {
          successCount: 2,
          failureCount: 0,
          totalCount: 2,
          successfulTaskIds: ['task-1', 'task-2'],
          errors: [],
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockTasksService.bulkAssignTasks.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBulkAssignTasks(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(bulkRequest);
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data).toEqual(mockResponse);
      expect(mockTasksService.bulkAssignTasks).toHaveBeenCalledWith(
        bulkRequest
      );
    });

    it('should handle assignment errors', async () => {
      const bulkRequest: BulkAssignTasksRequest = {
        taskIds: ['task-1', 'invalid-task'],
        assigneeId: 'user-123',
      };

      const mockResponse: BulkOperationResponse = {
        success: false,
        result: {
          successCount: 1,
          failureCount: 1,
          totalCount: 2,
          successfulTaskIds: ['task-1'],
          errors: [
            { taskId: 'invalid-task', error: 'Task invalid-task not found' },
          ],
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockTasksService.bulkAssignTasks.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBulkAssignTasks(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(bulkRequest);
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data?.result.successCount).toBe(1);
      expect(result.current.data?.result.errors).toHaveLength(1);
    });

    it('should handle bulk assignment errors', async () => {
      const bulkRequest: BulkAssignTasksRequest = {
        taskIds: ['task-1'],
        assigneeId: 'user-123',
      };

      const mockError = new Error('Bulk assignment failed');
      mockTasksService.bulkAssignTasks.mockRejectedValue(mockError);

      const { result } = renderHook(() => useBulkAssignTasks(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync(bulkRequest);
        } catch {
          // expected error
        }
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useBulkDeleteTasks', () => {
    it('should delete tasks in bulk successfully', async () => {
      const bulkRequest: BulkDeleteTasksRequest = {
        taskIds: ['task-1', 'task-2', 'task-3'],
      };

      const mockResponse: BulkOperationResponse = {
        success: true,
        result: {
          successCount: 3,
          failureCount: 0,
          totalCount: 3,
          successfulTaskIds: ['task-1', 'task-2', 'task-3'],
          errors: [],
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockTasksService.bulkDeleteTasks.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBulkDeleteTasks(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(bulkRequest);
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data).toEqual(mockResponse);
      expect(mockTasksService.bulkDeleteTasks).toHaveBeenCalledWith(
        bulkRequest
      );
    });

    it('should handle deletion errors', async () => {
      const bulkRequest: BulkDeleteTasksRequest = {
        taskIds: ['task-1', 'protected-task', 'task-3'],
      };

      const mockResponse: BulkOperationResponse = {
        success: false,
        result: {
          successCount: 2,
          failureCount: 1,
          totalCount: 3,
          successfulTaskIds: ['task-1', 'task-3'],
          errors: [
            {
              taskId: 'protected-task',
              error: 'Task protected-task cannot be deleted',
            },
          ],
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockTasksService.bulkDeleteTasks.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBulkDeleteTasks(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(bulkRequest);
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data?.result.successCount).toBe(2);
      expect(result.current.data?.result.errors).toHaveLength(1);
    });

    it('should handle bulk deletion errors', async () => {
      const bulkRequest: BulkDeleteTasksRequest = {
        taskIds: ['task-1'],
      };

      const mockError = new Error('Bulk deletion failed');
      mockTasksService.bulkDeleteTasks.mockRejectedValue(mockError);

      const { result } = renderHook(() => useBulkDeleteTasks(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync(bulkRequest);
        } catch {
          // expected error
        }
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toEqual(mockError);
    });
  });
});
