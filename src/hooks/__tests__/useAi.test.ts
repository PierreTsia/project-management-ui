import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createElement } from 'react';
import { act } from 'react';
import {
  useGenerateTasks,
  useGenerateLinkedTasksPreview,
  useConfirmLinkedTasks,
  aiKeys,
} from '../useAi';
import { AiService } from '@/services/ai';
import type {
  GenerateTasksRequest,
  GenerateTasksResponse,
  GenerateLinkedTasksPreviewRequest,
  GenerateLinkedTasksPreviewResponse,
  ConfirmLinkedTasksRequest,
  ConfirmLinkedTasksResponse,
} from '@/types/ai';

// Mock the AI service
vi.mock('@/services/ai', () => ({
  AiService: {
    generateTasks: vi.fn(),
    generateLinkedTasksPreview: vi.fn(),
    confirmLinkedTasks: vi.fn(),
  },
}));

const mockAiService = vi.mocked(AiService);

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAi hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('useGenerateTasks', () => {
    it('should call AiService.generateTasks with correct parameters', async () => {
      const mockResponse: GenerateTasksResponse = {
        tasks: [
          {
            title: 'Test Task 1',
            description: 'Test Description 1',
            priority: 'HIGH',
          },
          {
            title: 'Test Task 2',
            description: 'Test Description 2',
            priority: 'MEDIUM',
          },
        ],
        meta: {
          degraded: false,
        },
      };

      mockAiService.generateTasks.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useGenerateTasks(), { wrapper });

      const request: GenerateTasksRequest = {
        prompt: 'Create a test project',
        projectId: 'test-project-id',
        locale: 'en',
        options: {
          taskCount: 5,
          minPriority: 'HIGH',
          projectType: 'WEB_APP',
        },
      };

      let mutationResult: GenerateTasksResponse;
      await act(async () => {
        mutationResult = await result.current.mutateAsync(request);
      });

      expect(mockAiService.generateTasks).toHaveBeenCalledWith(request);
      expect(mutationResult!).toEqual(mockResponse);
    });

    it('should handle errors correctly', async () => {
      const error = new Error('API Error');
      mockAiService.generateTasks.mockRejectedValue(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useGenerateTasks(), { wrapper });

      const request: GenerateTasksRequest = {
        prompt: 'Create a test project',
        projectId: 'test-project-id',
        locale: 'en',
        options: {
          taskCount: 5,
        },
      };

      await act(async () => {
        try {
          await result.current.mutateAsync(request);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useGenerateLinkedTasksPreview', () => {
    it('should call AiService.generateLinkedTasksPreview with correct parameters', async () => {
      const mockResponse: GenerateLinkedTasksPreviewResponse = {
        tasks: [
          {
            id: 'task_1',
            title: 'Setup project structure',
            description: 'Initialize the project with proper folder structure',
            priority: 'HIGH',
          },
          {
            id: 'task_2',
            title: 'Implement authentication',
            description: 'Add user login and registration functionality',
            priority: 'MEDIUM',
          },
        ],
        relationships: [
          {
            sourceTask: 'task_1',
            targetTask: 'task_2',
            type: 'BLOCKS',
          },
        ],
        meta: {
          placeholderMode: true,
        },
      };

      mockAiService.generateLinkedTasksPreview.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useGenerateLinkedTasksPreview(), {
        wrapper,
      });

      const request: GenerateLinkedTasksPreviewRequest = {
        prompt: 'Create a web application with authentication',
        projectId: 'test-project-id',
      };

      let mutationResult: GenerateLinkedTasksPreviewResponse;
      await act(async () => {
        mutationResult = await result.current.mutateAsync(request);
      });

      expect(mockAiService.generateLinkedTasksPreview).toHaveBeenCalledWith(
        request
      );
      expect(mutationResult!).toEqual(mockResponse);
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Preview API Error');
      mockAiService.generateLinkedTasksPreview.mockRejectedValue(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useGenerateLinkedTasksPreview(), {
        wrapper,
      });

      const request: GenerateLinkedTasksPreviewRequest = {
        prompt: 'Create a web application',
        projectId: 'test-project-id',
      };

      await act(async () => {
        try {
          await result.current.mutateAsync(request);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.isError).toBe(true);
      });
    });

    it('should track loading state correctly', async () => {
      const mockResponse: GenerateLinkedTasksPreviewResponse = {
        tasks: [],
        relationships: [],
        meta: { placeholderMode: true },
      };

      mockAiService.generateLinkedTasksPreview.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useGenerateLinkedTasksPreview(), {
        wrapper,
      });

      const request: GenerateLinkedTasksPreviewRequest = {
        prompt: 'Create a web application',
        projectId: 'test-project-id',
      };

      // Initially not pending
      expect(result.current.isPending).toBe(false);

      // Start the mutation
      act(() => {
        result.current.mutateAsync(request);
      });

      // Should complete successfully
      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe('useConfirmLinkedTasks', () => {
    it('should call AiService.confirmLinkedTasks with correct parameters', async () => {
      const mockResponse: ConfirmLinkedTasksResponse = {
        createdTaskIds: ['task-1', 'task-2'],
        createdRelationships: [
          {
            fromTaskId: 'task-1',
            toTaskId: 'task-2',
            type: 'BLOCKS',
          },
        ],
        rejectedRelationships: [],
        counts: {
          totalLinks: 1,
          createdLinks: 1,
          rejectedLinks: 0,
        },
      };

      mockAiService.confirmLinkedTasks.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useConfirmLinkedTasks(), { wrapper });

      const request: ConfirmLinkedTasksRequest = {
        projectId: 'test-project-id',
        tasks: [
          {
            title: 'Setup project structure',
            description: 'Initialize the project',
            priority: 'HIGH',
          },
          {
            title: 'Implement authentication',
            description: 'Add user login',
            priority: 'MEDIUM',
          },
        ],
        relationships: [
          {
            sourceTask: 'task_1',
            targetTask: 'task_2',
            type: 'BLOCKS',
          },
        ],
      };

      let mutationResult: ConfirmLinkedTasksResponse;
      await act(async () => {
        mutationResult = await result.current.mutateAsync(request);
      });

      expect(mockAiService.confirmLinkedTasks).toHaveBeenCalledWith(request);
      expect(mutationResult!).toEqual(mockResponse);
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Confirm API Error');
      mockAiService.confirmLinkedTasks.mockRejectedValue(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useConfirmLinkedTasks(), { wrapper });

      const request: ConfirmLinkedTasksRequest = {
        projectId: 'test-project-id',
        tasks: [
          {
            title: 'Test Task',
            description: 'Test Description',
            priority: 'HIGH',
          },
        ],
        relationships: [],
      };

      await act(async () => {
        try {
          await result.current.mutateAsync(request);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.isError).toBe(true);
      });
    });

    it('should track loading state correctly', async () => {
      const mockResponse: ConfirmLinkedTasksResponse = {
        createdTaskIds: [],
        createdRelationships: [],
        rejectedRelationships: [],
        counts: {
          totalLinks: 0,
          createdLinks: 0,
          rejectedLinks: 0,
        },
      };

      mockAiService.confirmLinkedTasks.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useConfirmLinkedTasks(), { wrapper });

      const request: ConfirmLinkedTasksRequest = {
        projectId: 'test-project-id',
        tasks: [],
        relationships: [],
      };

      // Initially not pending
      expect(result.current.isPending).toBe(false);

      // Start the mutation
      act(() => {
        result.current.mutateAsync(request);
      });

      // Should complete successfully
      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });

    it('should handle empty tasks and relationships', async () => {
      const mockResponse: ConfirmLinkedTasksResponse = {
        createdTaskIds: [],
        createdRelationships: [],
        rejectedRelationships: [],
        counts: {
          totalLinks: 0,
          createdLinks: 0,
          rejectedLinks: 0,
        },
      };

      mockAiService.confirmLinkedTasks.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useConfirmLinkedTasks(), { wrapper });

      const request: ConfirmLinkedTasksRequest = {
        projectId: 'test-project-id',
        tasks: [],
        relationships: [],
      };

      let mutationResult: ConfirmLinkedTasksResponse;
      await act(async () => {
        mutationResult = await result.current.mutateAsync(request);
      });

      expect(mockAiService.confirmLinkedTasks).toHaveBeenCalledWith(request);
      expect(mutationResult!).toEqual(mockResponse);
    });
  });

  describe('aiKeys', () => {
    it('should generate correct query keys', () => {
      expect(aiKeys.all).toEqual(['ai']);
      expect(aiKeys.taskgen()).toEqual(['ai', 'taskgen']);
    });
  });
});
