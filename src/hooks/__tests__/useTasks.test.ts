import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createElement } from 'react';
import { useProjectTasks } from '../useTasks';
import { TasksService } from '@/services/tasks';
import type { Task } from '@/types/task';

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
    it('should search tasks with parameters');
    it('should handle empty search parameters');
    it('should use correct query key with params');
    it('should handle API errors gracefully');
  });

  describe('useTask', () => {
    it('should fetch single task successfully');
    it('should require both project and task IDs');
    it('should use correct query key');
    it('should handle API errors gracefully');
  });

  describe('useCreateTask', () => {
    it('should create task successfully');
    it('should invalidate project tasks queries on success');
    it('should handle validation errors');
    it('should handle API errors gracefully');
  });

  describe('useUpdateTask', () => {
    it('should update task successfully');
    it('should update task in cache on success');
    it('should invalidate project tasks list');
    it('should handle validation errors');
    it('should handle API errors gracefully');
  });

  describe('useDeleteTask', () => {
    it('should delete task successfully');
    it('should remove task from cache on success');
    it('should invalidate project tasks list');
    it('should handle API errors gracefully');
  });

  describe('useUpdateTaskStatus', () => {
    it('should update task status successfully');
    it('should validate status transitions');
    it('should update task in cache on success');
    it('should invalidate project tasks list');
    it('should handle invalid status transitions');
    it('should handle API errors gracefully');
    it('should log errors properly');
  });

  describe('useAssignTask', () => {
    it('should assign task to user successfully');
    it('should update task in cache on success');
    it('should invalidate project tasks list');
    it('should handle invalid user assignment');
    it('should handle API errors gracefully');
  });

  describe('Query Key Management', () => {
    it('should generate correct query keys for all operations');
    it('should invalidate correct queries on mutations');
    it('should handle cache updates properly');
  });
});
