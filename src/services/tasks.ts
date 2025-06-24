import { apiClient } from '@/lib/api-client';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  SearchTasksParams,
  SearchTasksResponse,
} from '@/types/task';
import type { Attachment } from '@/types/attachment';

export type UploadAttachmentRequest = {
  file: File;
};

export class TasksService {
  static async getProjectTasks(projectId: string): Promise<Task[]> {
    const response = await apiClient.get(`/projects/${projectId}/tasks`);
    return response.data;
  }

  static async searchProjectTasks(
    projectId: string,
    params?: SearchTasksParams
  ): Promise<SearchTasksResponse> {
    const response = await apiClient.get(
      `/projects/${projectId}/tasks/search`,
      {
        params,
      }
    );
    return response.data;
  }

  static async getTask(projectId: string, taskId: string): Promise<Task> {
    const response = await apiClient.get(
      `/projects/${projectId}/tasks/${taskId}`
    );
    return response.data;
  }

  static async createTask(
    projectId: string,
    data: CreateTaskRequest
  ): Promise<Task> {
    const response = await apiClient.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  }

  static async updateTask(
    projectId: string,
    taskId: string,
    data: UpdateTaskRequest
  ): Promise<Task> {
    const response = await apiClient.put(
      `/projects/${projectId}/tasks/${taskId}`,
      data
    );
    return response.data;
  }

  static async deleteTask(projectId: string, taskId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
  }

  static async updateTaskStatus(
    projectId: string,
    taskId: string,
    data: UpdateTaskStatusRequest
  ): Promise<Task> {
    const response = await apiClient.put(
      `/projects/${projectId}/tasks/${taskId}/status`,
      data
    );
    return response.data;
  }

  static async assignTask(
    projectId: string,
    taskId: string,
    data: AssignTaskRequest
  ): Promise<Task> {
    const response = await apiClient.put(
      `/projects/${projectId}/tasks/${taskId}/assign`,
      data
    );
    return response.data;
  }

  // Task Attachment Methods
  static async getTaskAttachments(
    projectId: string,
    taskId: string
  ): Promise<Attachment[]> {
    const response = await apiClient.get(
      `/projects/${projectId}/tasks/${taskId}/attachments`
    );
    return response.data;
  }

  static async getTaskAttachment(
    projectId: string,
    taskId: string,
    attachmentId: string
  ): Promise<Attachment> {
    const response = await apiClient.get(
      `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`
    );
    return response.data;
  }

  static async uploadTaskAttachment(
    projectId: string,
    taskId: string,
    data: UploadAttachmentRequest
  ): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', data.file);

    const response = await apiClient.post(
      `/projects/${projectId}/tasks/${taskId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  static async deleteTaskAttachment(
    projectId: string,
    taskId: string,
    attachmentId: string
  ): Promise<void> {
    await apiClient.delete(
      `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`
    );
  }
}
