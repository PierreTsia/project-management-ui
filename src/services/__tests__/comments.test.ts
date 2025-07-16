import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CommentsService } from '../comments';
import { apiClient } from '@/lib/api-client';
import type { TaskComment } from '@/types/comment';
import type { User } from '@/types/user';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockDelete = vi.mocked(apiClient.delete);

const MOCK_USER: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  provider: null,
  providerId: 'jane@example.com',
  bio: '',
  dob: '1990-01-01',
  avatarUrl: '',
  phone: '',
  isEmailConfirmed: true,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

const MOCK_USER_2: User = {
  ...MOCK_USER,
  id: 'user-2',
  name: 'Jane Doe',
  email: 'jane@example.com',
};

describe('CommentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTaskComments', () => {
    it('should call API client with correct endpoint and return comments', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockComments: TaskComment[] = [
        {
          id: 'comment-1',
          content: 'This is a comment',
          taskId,
          userId: 'user-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          user: MOCK_USER,
        },
      ];
      mockGet.mockResolvedValue({ data: mockComments });
      const result = await CommentsService.getTaskComments(projectId, taskId);
      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/comments`
      );
      expect(result).toEqual(mockComments);
    });

    it('should throw error when API call fails', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockError = new Error('Failed to fetch comments');
      mockGet.mockRejectedValue(mockError);
      await expect(
        CommentsService.getTaskComments(projectId, taskId)
      ).rejects.toThrow('Failed to fetch comments');
      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/comments`
      );
    });
  });

  describe('createTaskComment', () => {
    it('should call API client with correct endpoint and data, and return the created comment', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const content = 'New comment';
      const mockComment: TaskComment = {
        id: 'comment-2',
        content,
        taskId,
        userId: 'user-2',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        user: MOCK_USER_2,
      };
      mockPost.mockResolvedValue({ data: mockComment });
      const result = await CommentsService.createTaskComment(
        projectId,
        taskId,
        { content }
      );
      expect(mockPost).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/comments`,
        { content }
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw error when API call fails', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const content = 'New comment';
      const mockError = new Error('Failed to create comment');
      mockPost.mockRejectedValue(mockError);
      await expect(
        CommentsService.createTaskComment(projectId, taskId, { content })
      ).rejects.toThrow('Failed to create comment');
      expect(mockPost).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/comments`,
        { content }
      );
    });
  });

  describe('deleteTaskComment', () => {
    it('should call API client with correct endpoint and return void', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const commentId = 'comment-1';
      mockDelete.mockResolvedValue({});
      const result = await CommentsService.deleteTaskComment(
        projectId,
        taskId,
        commentId
      );
      expect(mockDelete).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`
      );
      expect(result).toBeUndefined();
    });

    it('should throw error when API call fails', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const commentId = 'comment-1';
      const mockError = new Error('Failed to delete comment');
      mockDelete.mockRejectedValue(mockError);
      await expect(
        CommentsService.deleteTaskComment(projectId, taskId, commentId)
      ).rejects.toThrow('Failed to delete comment');
      expect(mockDelete).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`
      );
    });
  });
});
