import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CommentsService } from '../comments';
import { apiClient } from '@/lib/api-client';
import type { TaskComment } from '@/types/comment';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);

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
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
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
});
