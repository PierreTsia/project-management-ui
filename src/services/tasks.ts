import { apiClient } from '@/lib/api-client';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  SearchTasksParams,
  SearchTasksResponse,
  GlobalSearchTasksParams,
  GlobalSearchTasksResponse,
  BulkUpdateStatusRequest,
  BulkAssignTasksRequest,
  BulkDeleteTasksRequest,
  BulkOperationResponse,
  TaskLink,
  TaskLinkWithTask,
  CreateTaskLinkRequest,
  TaskLinkResponse,
  CreateTaskHierarchyRequest,
  TaskHierarchyResponse,
  TaskHierarchyDto,
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

  static async unassignTask(projectId: string, taskId: string): Promise<Task> {
    const response = await apiClient.delete(
      `/projects/${projectId}/tasks/${taskId}/assign`
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

  // Global Tasks Methods
  // Note:
  // The API exposes two endpoints:
  // - GET /tasks           → default listing used by the Tasks page (global feed)
  // - GET /tasks/search    → search endpoint that the backend may evolve separately
  // We mirror both explicitly to keep a clear 1:1 mapping with the REST API,
  // even though implementations are currently similar. Please avoid merging
  // them unless the backend consolidates the endpoints as well.
  static async getAllUserTasks(
    params?: GlobalSearchTasksParams
  ): Promise<GlobalSearchTasksResponse> {
    const response = await apiClient.get('/tasks', {
      params,
    });
    return response.data;
  }

  static async searchAllUserTasks(
    params?: GlobalSearchTasksParams
  ): Promise<GlobalSearchTasksResponse> {
    const response = await apiClient.get('/tasks/search', {
      params,
    });
    return response.data;
  }

  // Bulk Operations
  static async bulkUpdateStatus(
    data: BulkUpdateStatusRequest
  ): Promise<BulkOperationResponse> {
    const response = await apiClient.post('/tasks/bulk/status', data);
    return response.data;
  }

  static async bulkAssignTasks(
    data: BulkAssignTasksRequest
  ): Promise<BulkOperationResponse> {
    const response = await apiClient.post('/tasks/bulk/assign', data);
    return response.data;
  }

  static async bulkDeleteTasks(
    data: BulkDeleteTasksRequest
  ): Promise<BulkOperationResponse> {
    const response = await apiClient.post('/tasks/bulk/delete', data);
    return response.data;
  }

  // Task Link Methods
  static async getTaskLinks(
    projectId: string,
    taskId: string
  ): Promise<TaskLinkResponse> {
    const response = await apiClient.get(
      `/projects/${projectId}/tasks/${taskId}/links`
    );
    return response.data;
  }

  static async getTaskLinksDetailed(
    projectId: string,
    taskId: string
  ): Promise<TaskLinkWithTask[]> {
    const response = await apiClient.get(
      `/projects/${projectId}/tasks/${taskId}/links/detailed`
    );
    return response.data;
  }

  static async createTaskLink(
    projectId: string,
    taskId: string,
    data: CreateTaskLinkRequest
  ): Promise<TaskLink> {
    const response = await apiClient.post(
      `/projects/${projectId}/tasks/${taskId}/links`,
      data
    );
    return response.data;
  }

  static async deleteTaskLink(
    projectId: string,
    taskId: string,
    linkId: string
  ): Promise<void> {
    await apiClient.delete(
      `/projects/${projectId}/tasks/${taskId}/links/${linkId}`
    );
  }

  static async getRelatedTasks(
    projectId: string,
    taskId: string
  ): Promise<string[]> {
    const response = await apiClient.get(
      `/projects/${projectId}/tasks/${taskId}/related`
    );
    return response.data;
  }

  // Task Hierarchy Methods
  static async getTaskHierarchy(
    projectId: string,
    taskId: string
  ): Promise<TaskHierarchyResponse> {
    const response = await apiClient.get(
      `/projects/${projectId}/tasks/${taskId}/hierarchy`
    );
    return response.data;
  }

  static async getAllTaskChildren(
    projectId: string,
    taskId: string
  ): Promise<Task[]> {
    const response = await apiClient.get(
      `/projects/${projectId}/tasks/${taskId}/hierarchy/all-children`
    );
    // Extract childTask from each hierarchy DTO
    return response.data
      .map((hierarchy: TaskHierarchyDto) => hierarchy.childTask)
      .filter((task: Task) => task !== undefined);
  }

  static async getAllTaskParents(
    projectId: string,
    taskId: string
  ): Promise<Task[]> {
    const response = await apiClient.get(
      `/projects/${projectId}/tasks/${taskId}/hierarchy/all-parents`
    );
    // Extract parentTask from each hierarchy DTO
    return response.data
      .map((hierarchy: TaskHierarchyDto) => hierarchy.parentTask)
      .filter((task: Task) => task !== undefined);
  }

  static async createTaskHierarchy(
    projectId: string,
    parentTaskId: string,
    data: CreateTaskHierarchyRequest
  ): Promise<void> {
    await apiClient.post(
      `/projects/${projectId}/tasks/${parentTaskId}/hierarchy/${data.childTaskId}`
    );
  }

  static async deleteTaskHierarchy(
    projectId: string,
    parentTaskId: string,
    childTaskId: string
  ): Promise<void> {
    await apiClient.delete(
      `/projects/${projectId}/tasks/${parentTaskId}/hierarchy/${childTaskId}`
    );
  }
}
