import { apiClient } from '@/lib/api-client';
import type { TaskComment } from '@/types/comment';

export class CommentsService {
  // Fetch all comments for a given task
  static async getTaskComments(
    projectId: string,
    taskId: string
  ): Promise<TaskComment[]> {
    const { data } = await apiClient.get<TaskComment[]>(
      `/projects/${projectId}/tasks/${taskId}/comments`
    );
    return data;
  }

  // Create a new comment for a given task
  static async createTaskComment(
    projectId: string,
    taskId: string,
    data: { content: string }
  ): Promise<TaskComment> {
    const response = await apiClient.post(
      `/projects/${projectId}/tasks/${taskId}/comments`,
      data
    );
    return response.data;
  }

  // Update a comment for a given task
  static async updateTaskComment(
    projectId: string,
    taskId: string,
    commentId: string,
    data: { content: string }
  ): Promise<TaskComment> {
    const response = await apiClient.put(
      `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
      data
    );
    return response.data;
  }

  // Delete a comment for a given task
  static async deleteTaskComment(
    projectId: string,
    taskId: string,
    commentId: string
  ): Promise<void> {
    await apiClient.delete(
      `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`
    );
  }
}
