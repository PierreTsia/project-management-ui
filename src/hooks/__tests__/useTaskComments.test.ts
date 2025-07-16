import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createElement } from 'react';
import { act } from 'react';
import {
  useTaskComments,
  useCreateTaskComment,
  useDeleteTaskComment,
} from '../useTaskComments';
import { CommentsService } from '@/services/comments';
import type { TaskComment } from '@/types/comment';
import type { User } from '@/types/user';

vi.mock('@/services/comments');
const mockCommentsService = vi.mocked(CommentsService);

const MOCK_USER: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  provider: null,
  providerId: null,
  bio: '',
  dob: '1990-01-01',
  avatarUrl: '',
  phone: '',
  isEmailConfirmed: true,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

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
        user: MOCK_USER,
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

  describe('useCreateTaskComment', () => {
    it('should create a comment successfully and invalidate queries', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const content = 'New comment';
      const mockComment: TaskComment = {
        id: 'comment-2',
        content,
        taskId,
        userId: 'user-1',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        user: MOCK_USER,
      };
      mockCommentsService.createTaskComment.mockResolvedValue(mockComment);
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);
      const { result } = renderHook(() => useCreateTaskComment(), { wrapper });
      await act(async () => {
        await result.current.mutateAsync({ projectId, taskId, content });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(result.current.data).toEqual(mockComment);
      expect(mockCommentsService.createTaskComment).toHaveBeenCalledWith(
        projectId,
        taskId,
        { content }
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['taskComments', projectId, taskId],
      });
    });

    it('should handle API errors when creating a comment', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const content = 'New comment';
      const mockError = new Error('Failed to create comment');
      mockCommentsService.createTaskComment.mockRejectedValue(mockError);
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTaskComment(), { wrapper });
      await act(async () => {
        await expect(
          result.current.mutateAsync({ projectId, taskId, content })
        ).rejects.toThrow('Failed to create comment');
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useDeleteTaskComment', () => {
    it('should delete a comment successfully and invalidate queries', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const commentId = 'comment-1';
      mockCommentsService.deleteTaskComment.mockResolvedValue(undefined);
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);
      const { result } = renderHook(() => useDeleteTaskComment(), { wrapper });
      await act(async () => {
        await result.current.mutateAsync({ projectId, taskId, commentId });
      });
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(mockCommentsService.deleteTaskComment).toHaveBeenCalledWith(
        projectId,
        taskId,
        commentId
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['taskComments', projectId, taskId],
      });
    });

    it('should handle API errors when deleting a comment', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const commentId = 'comment-1';
      const mockError = new Error('Failed to delete comment');
      mockCommentsService.deleteTaskComment.mockRejectedValue(mockError);
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTaskComment(), { wrapper });
      await act(async () => {
        await expect(
          result.current.mutateAsync({ projectId, taskId, commentId })
        ).rejects.toThrow('Failed to delete comment');
      });
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error).toEqual(mockError);
    });
  });
});
