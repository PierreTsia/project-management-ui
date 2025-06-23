import { apiClient } from '@/lib/api-client';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStatus,
  SearchProjectsResponse,
} from '@/types/project';

export type GetProjectsParams = {
  query?: string;
  status?: ProjectStatus;
  page?: number;
  limit?: number;
};

export class ProjectsService {
  static async getProjects(
    params?: GetProjectsParams
  ): Promise<SearchProjectsResponse> {
    const response = await apiClient.get('/projects/search', { params });
    return response.data;
  }

  static async getProject(id: string): Promise<Project> {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  }

  static async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post('/projects', data);
    return response.data;
  }

  static async updateProject(
    id: string,
    data: UpdateProjectRequest
  ): Promise<Project> {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  }

  static async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  }
}
