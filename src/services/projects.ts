import { apiClient } from '@/lib/api-client';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStatus,
  SearchProjectsResponse,
  ProjectRole,
} from '@/types/project';
import type { User } from '@/types/user';
import type { Attachment } from '@/types/attachment';

export type GetProjectsParams = {
  query?: string;
  status?: ProjectStatus;
  page?: number;
  limit?: number;
};

export type ProjectContributor = {
  id: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  user: User;
};

export type AddContributorRequest = {
  email: string;
  role: ProjectRole;
};

export type UploadAttachmentRequest = {
  file: File;
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

  static async getProjectContributors(
    id: string
  ): Promise<ProjectContributor[]> {
    const response = await apiClient.get(`/projects/${id}/contributors`);
    return response.data;
  }

  static async getProjectAttachments(id: string): Promise<Attachment[]> {
    const response = await apiClient.get(`/projects/${id}/attachments`);
    return response.data;
  }

  static async getProjectAttachment(
    projectId: string,
    attachmentId: string
  ): Promise<Attachment> {
    const response = await apiClient.get(
      `/projects/${projectId}/attachments/${attachmentId}`
    );
    return response.data;
  }

  static async uploadProjectAttachment(
    projectId: string,
    data: UploadAttachmentRequest
  ): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', data.file);

    const response = await apiClient.post(
      `/projects/${projectId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  static async deleteProjectAttachment(
    projectId: string,
    attachmentId: string
  ): Promise<void> {
    await apiClient.delete(
      `/projects/${projectId}/attachments/${attachmentId}`
    );
  }

  static async addContributor(
    projectId: string,
    data: AddContributorRequest
  ): Promise<ProjectContributor> {
    const response = await apiClient.post(
      `/projects/${projectId}/contributors`,
      data
    );
    return response.data;
  }
}
