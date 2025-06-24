import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createElement } from 'react';
import {
  useProjectTasks,
  useSearchProjectTasks,
  useTask,
  useCreateTask,
  taskKeys,
  useDeleteTask,
  useUpdateTaskStatus,
  useAssignTask,
} from '../useTasks';
import { TasksService } from '@/services/tasks';
import type {
  Task,
  SearchTasksParams,
  SearchTasksResponse,
} from '@/types/task';

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
        assigneeId: 'user-id',
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

      result.current.mutate(createData);

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

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
      expect(mockTasksService.createTask).toHaveBeenCalledWith(
        createData.projectId,
        createData.data
      );
    });

    it('should invalidate project tasks queries on success', async () => {
      const mockTask: Task = {
        id: 'task-1',
        title: 'New Task',
        description: 'Task description',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        projectId: 'project-1',
        assigneeId: 'user-id',
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

      result.current.mutate(createData);

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
    it('should update task successfully');
    it('should update task in cache on success');
    it('should invalidate project tasks list');
    it('should handle validation errors');
    it('should handle API errors gracefully');
  });

  describe('useDeleteTask', () => {
    const projectId = 'project-1';
    const taskId = 'task-1';

    it('should delete task successfully', async () => {
      mockTasksService.deleteTask.mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTask(), { wrapper });

      result.current.mutate({ projectId, taskId });

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

      result.current.mutate({ projectId, taskId });

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

      result.current.mutate({ projectId, taskId });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
      expect(mockTasksService.deleteTask).toHaveBeenCalledWith(
        projectId,
        taskId
      );
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

      result.current.mutate({ projectId, taskId, data: updateData });

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

      result.current.mutate({ projectId, taskId, data: updateData });

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

      result.current.mutate({ projectId, taskId, data: updateData });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
      expect(mockTasksService.updateTaskStatus).toHaveBeenCalledWith(
        projectId,
        taskId,
        updateData
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Failed to update task status:',
        expect.stringContaining('Failed to update status')
      );
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
        assigneeId: 'user-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };
      mockTasksService.assignTask.mockResolvedValue(mockTask);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAssignTask(), { wrapper });

      result.current.mutate({ projectId, taskId, data: assignData });

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
        assigneeId: 'user-123',
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

      result.current.mutate({ projectId, taskId, data: assignData });

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

      result.current.mutate({ projectId, taskId, data: assignData });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
      expect(mockTasksService.assignTask).toHaveBeenCalledWith(
        projectId,
        taskId,
        assignData
      );
    });
  });
});
