import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createElement } from 'react';
import { useTaskComments } from '../useTaskComments';
import { CommentsService } from '@/services/comments';
import type { TaskComment } from '@/types/comment';

vi.mock('@/services/comments');
const mockCommentsService = vi.mocked(CommentsService);

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

describe('useTaskComments', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch task comments successfully', async () => {
    const projectId = 'project-123';
    const taskId = 'task-456';
    const mockComments: TaskComment[] = [
      {
        id: 'comment-1',
        content: 'Test comment',
        taskId,
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    ];
    mockCommentsService.getTaskComments.mockResolvedValue(mockComments);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTaskComments(projectId, taskId), {
      wrapper,
    });
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(mockComments);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(mockCommentsService.getTaskComments).toHaveBeenCalledWith(
      projectId,
      taskId
    );
  });

  it('should handle missing IDs', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTaskComments('', ''), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockCommentsService.getTaskComments).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const projectId = 'project-123';
    const taskId = 'task-456';
    const mockError = new Error('Failed to fetch comments');
    mockCommentsService.getTaskComments.mockRejectedValue(mockError);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTaskComments(projectId, taskId), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(mockError);
  });
});
