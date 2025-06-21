import { apiClient } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/types/project';

export class ProjectsService {
  static async getProjects(params?: {
    page?: number;
    limit?: number;
    status?: Project['status'];
    priority?: Project['priority'];
  }): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  }

  static async getProject(id: number): Promise<ApiResponse<Project>> {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  }

  static async createProject(
    data: CreateProjectRequest
  ): Promise<ApiResponse<Project>> {
    const response = await apiClient.post('/projects', data);
    return response.data;
  }

  static async updateProject(
    data: UpdateProjectRequest
  ): Promise<ApiResponse<Project>> {
    const response = await apiClient.put(`/projects/${data.id}`, data);
    return response.data;
  }

  static async deleteProject(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  }
}
