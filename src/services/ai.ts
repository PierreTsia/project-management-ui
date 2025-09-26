import { apiClient } from '@/lib/api-client';
import type {
  GenerateTasksRequest,
  GenerateTasksResponse,
  GenerateLinkedTasksPreviewRequest,
  GenerateLinkedTasksPreviewResponse,
  ConfirmLinkedTasksRequest,
  ConfirmLinkedTasksResponse,
} from '@/types/ai';

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

  static async generateLinkedTasksPreview(
    payload: GenerateLinkedTasksPreviewRequest
  ): Promise<GenerateLinkedTasksPreviewResponse> {
    const response = await apiClient.post<GenerateLinkedTasksPreviewResponse>(
      '/ai/generate-linked-tasks-preview',
      payload
    );
    return response.data;
  }

  static async confirmLinkedTasks(
    payload: ConfirmLinkedTasksRequest
  ): Promise<ConfirmLinkedTasksResponse> {
    const response = await apiClient.post<ConfirmLinkedTasksResponse>(
      '/ai/confirm-linked-tasks',
      payload
    );
    return response.data;
  }
}
