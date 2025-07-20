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
} from '../useTasks';
import { TasksService } from '@/services/tasks';
import type {
  Task,
  SearchTasksParams,
  SearchTasksResponse,
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
      const mockTask: Task = {
        id: taskId,
        title: 'Test Task',
        description: 'A test task',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: projectId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

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
      const mockTask: Task = {
        id: taskId,
        title: 'Test Task',
        description: 'A test task',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: projectId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

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
      const mockTask: Task = {
        id: 'task-1',
        title: 'New Task',
        description: 'Task description',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        projectId: 'project-1',
        assignee: {
          id: 'user-id',
          email: 'user@example.com',
          name: 'Test User',
          provider: null,
          providerId: null,
          bio: null,
          dob: null,
          phone: null,
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=user',
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

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
      const mockTask: Task = {
        id: 'task-1',
        title: 'New Task',
        description: 'Task description',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        projectId: 'project-1',
        assignee: {
          id: 'user-id',
          email: 'user@example.com',
          name: 'Test User',
          provider: null,
          providerId: null,
          bio: null,
          dob: null,
          phone: null,
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=user',
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

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
      const mockTask: Task = {
        id: taskId,
        title: 'Updated Task',
        description: 'Updated desc',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };
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
      const mockTask: Task = {
        id: taskId,
        title: 'Updated Task',
        description: 'Updated desc',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };
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
      const mockTask: Task = {
        id: taskId,
        title: 'Task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };
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
      const mockTask: Task = {
        id: taskId,
        title: 'Task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };
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
  });

  describe('useAssignTask', () => {
    const projectId = 'project-1';
    const taskId = 'task-1';
    const assignData = { assigneeId: 'user-123' };

    it('should assign task to user successfully', async () => {
      const mockTask: Task = {
        id: taskId,
        title: 'Task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId,
        assignee: {
          id: 'user-123',
          email: 'user123@example.com',
          name: 'Test User 123',
          provider: null,
          providerId: null,
          bio: null,
          dob: null,
          phone: null,
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=user123',
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };
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
      const mockTask: Task = {
        id: taskId,
        title: 'Task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId,
        assignee: {
          id: 'user-123',
          email: 'user123@example.com',
          name: 'Test User 123',
          provider: null,
          providerId: null,
          bio: null,
          dob: null,
          phone: null,
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=user123',
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };
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
});
