import { apiClient } from '@/lib/api-client';
import type { TaskComment } from '@/types/comment';

export class CommentsService {
  // Fetch all comments for a given task
  static async getTaskComments(
    projectId: string,
    taskId: string
  ): Promise<TaskComment[]> {
    const { data } = await apiClient.get(
      `/projects/${projectId}/tasks/${taskId}/comments`
    );
    return data;
  }

  // Future: static async createTaskComment(...) { ... }
  // Future: static async updateTaskComment(...) { ... }
  // Future: static async deleteTaskComment(...) { ... }
}
