import { apiClient } from '@/lib/api-client';
import type { GenerateTasksRequest, GenerateTasksResponse } from '@/types/ai';

export class AiService {
  static async generateTasks(
    payload: GenerateTasksRequest
  ): Promise<GenerateTasksResponse> {
    const response = await apiClient.post<GenerateTasksResponse>(
      '/ai/generate-tasks',
      payload
    );
    return response.data;
  }
}
