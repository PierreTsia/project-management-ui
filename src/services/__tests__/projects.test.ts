import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  ProjectsService,
  type GetProjectsParams,
  type ProjectContributor,
} from '../projects';
import { apiClient } from '@/lib/api-client';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  SearchProjectsResponse,
} from '@/types/project';
import type { Attachment } from '@/types/attachment';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);

describe('ProjectsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should call API client with correct endpoint and no params', async () => {
      const mockResponse: SearchProjectsResponse = {
        projects: [],
        total: 0,
        page: 1,
        limit: 6,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await ProjectsService.getProjects();

      expect(mockGet).toHaveBeenCalledWith('/projects/search', {
        params: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call API client with pagination params', async () => {
      const params: GetProjectsParams = {
        page: 2,
        limit: 12,
      };

      const mockResponse: SearchProjectsResponse = {
        projects: [],
        total: 50,
        page: 2,
        limit: 12,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await ProjectsService.getProjects(params);

      expect(mockGet).toHaveBeenCalledWith('/projects/search', { params });
      expect(result).toEqual(mockResponse);
    });

    it('should call API client with search query', async () => {
      const params: GetProjectsParams = {
        query: 'mobile app',
        page: 1,
        limit: 6,
      };

      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Mobile App Project',
          description: 'A mobile application',
          status: 'ACTIVE',
          ownerId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse: SearchProjectsResponse = {
        projects: mockProjects,
        total: 1,
        page: 1,
        limit: 6,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await ProjectsService.getProjects(params);

      expect(mockGet).toHaveBeenCalledWith('/projects/search', { params });
      expect(result).toEqual(mockResponse);
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].name).toBe('Mobile App Project');
    });

    it('should call API client with status filter', async () => {
      const params: GetProjectsParams = {
        status: 'ARCHIVED',
        page: 1,
        limit: 6,
      };

      const mockResponse: SearchProjectsResponse = {
        projects: [],
        total: 0,
        page: 1,
        limit: 6,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await ProjectsService.getProjects(params);

      expect(mockGet).toHaveBeenCalledWith('/projects/search', { params });
      expect(result).toEqual(mockResponse);
    });

    it('should call API client with all search parameters', async () => {
      const params: GetProjectsParams = {
        query: 'dashboard',
        status: 'ACTIVE',
        page: 3,
        limit: 24,
      };

      const mockResponse: SearchProjectsResponse = {
        projects: [],
        total: 100,
        page: 3,
        limit: 24,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await ProjectsService.getProjects(params);

      expect(mockGet).toHaveBeenCalledWith('/projects/search', { params });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Failed to fetch projects');
      mockGet.mockRejectedValue(mockError);

      await expect(ProjectsService.getProjects()).rejects.toThrow(
        'Failed to fetch projects'
      );
      expect(mockGet).toHaveBeenCalledWith('/projects/search', {
        params: undefined,
      });
    });
  });

  describe('getProject', () => {
    it('should call API client with correct endpoint and project ID', async () => {
      const projectId = 'project-123';
      const mockProject: Project = {
        id: projectId,
        name: 'Test Project',
        description: 'A test project',
        status: 'ACTIVE',
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockGet.mockResolvedValue({ data: mockProject });

      const result = await ProjectsService.getProject(projectId);

      expect(mockGet).toHaveBeenCalledWith(`/projects/${projectId}`);
      expect(result).toEqual(mockProject);
    });

    it('should throw error when project not found', async () => {
      const projectId = 'non-existent';
      const mockError = new Error('Project not found');
      mockGet.mockRejectedValue(mockError);

      await expect(ProjectsService.getProject(projectId)).rejects.toThrow(
        'Project not found'
      );
      expect(mockGet).toHaveBeenCalledWith(`/projects/${projectId}`);
    });
  });

  describe('createProject', () => {
    it('should call API client with correct endpoint and data', async () => {
      const createRequest: CreateProjectRequest = {
        name: 'New Project',
        description: 'A brand new project',
      };

      const mockProject: Project = {
        id: 'new-project-123',
        name: 'New Project',
        description: 'A brand new project',
        status: 'ACTIVE',
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockPost.mockResolvedValue({ data: mockProject });

      const result = await ProjectsService.createProject(createRequest);

      expect(mockPost).toHaveBeenCalledWith('/projects', createRequest);
      expect(result).toEqual(mockProject);
    });

    it('should create project with minimal data', async () => {
      const createRequest: CreateProjectRequest = {
        name: 'Minimal Project',
      };

      const mockProject: Project = {
        id: 'minimal-123',
        name: 'Minimal Project',
        status: 'ACTIVE',
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockPost.mockResolvedValue({ data: mockProject });

      const result = await ProjectsService.createProject(createRequest);

      expect(mockPost).toHaveBeenCalledWith('/projects', createRequest);
      expect(result).toEqual(mockProject);
    });

    it('should throw error when API call fails', async () => {
      const createRequest: CreateProjectRequest = {
        name: 'Invalid Project',
        description: 'This will fail',
      };

      const mockError = new Error('Validation failed');
      mockPost.mockRejectedValue(mockError);

      await expect(
        ProjectsService.createProject(createRequest)
      ).rejects.toThrow('Validation failed');
      expect(mockPost).toHaveBeenCalledWith('/projects', createRequest);
    });
  });

  describe('updateProject', () => {
    it('should call API client with correct endpoint and data', async () => {
      const projectId = 'project-123';
      const updateRequest: UpdateProjectRequest = {
        name: 'Updated Project',
        description: 'Updated description',
        status: 'ARCHIVED',
      };

      const mockProject: Project = {
        id: projectId,
        name: 'Updated Project',
        description: 'Updated description',
        status: 'ARCHIVED',
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockPut.mockResolvedValue({ data: mockProject });

      const result = await ProjectsService.updateProject(
        projectId,
        updateRequest
      );

      expect(mockPut).toHaveBeenCalledWith(
        `/projects/${projectId}`,
        updateRequest
      );
      expect(result).toEqual(mockProject);
    });

    it('should update project with partial data', async () => {
      const projectId = 'project-123';
      const updateRequest: UpdateProjectRequest = {
        status: 'ARCHIVED',
      };

      const mockProject: Project = {
        id: projectId,
        name: 'Original Name',
        description: 'Original description',
        status: 'ARCHIVED',
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockPut.mockResolvedValue({ data: mockProject });

      const result = await ProjectsService.updateProject(
        projectId,
        updateRequest
      );

      expect(mockPut).toHaveBeenCalledWith(
        `/projects/${projectId}`,
        updateRequest
      );
      expect(result).toEqual(mockProject);
    });

    it('should throw error when project not found', async () => {
      const projectId = 'non-existent';
      const updateRequest: UpdateProjectRequest = {
        name: 'Updated Name',
      };

      const mockError = new Error('Project not found');
      mockPut.mockRejectedValue(mockError);

      await expect(
        ProjectsService.updateProject(projectId, updateRequest)
      ).rejects.toThrow('Project not found');
      expect(mockPut).toHaveBeenCalledWith(
        `/projects/${projectId}`,
        updateRequest
      );
    });
  });

  describe('deleteProject', () => {
    it('should call API client with correct endpoint', async () => {
      const projectId = 'project-123';

      mockDelete.mockResolvedValue({ data: undefined });

      const result = await ProjectsService.deleteProject(projectId);

      expect(mockDelete).toHaveBeenCalledWith(`/projects/${projectId}`);
      expect(result).toBeUndefined();
    });

    it('should throw error when project not found', async () => {
      const projectId = 'non-existent';
      const mockError = new Error('Project not found');
      mockDelete.mockRejectedValue(mockError);

      await expect(ProjectsService.deleteProject(projectId)).rejects.toThrow(
        'Project not found'
      );
      expect(mockDelete).toHaveBeenCalledWith(`/projects/${projectId}`);
    });

    it('should throw error when deletion fails', async () => {
      const projectId = 'project-123';
      const mockError = new Error('Failed to delete project');
      mockDelete.mockRejectedValue(mockError);

      await expect(ProjectsService.deleteProject(projectId)).rejects.toThrow(
        'Failed to delete project'
      );
      expect(mockDelete).toHaveBeenCalledWith(`/projects/${projectId}`);
    });
  });

  describe('getProjectContributors', () => {
    it('should call API client with correct endpoint', async () => {
      const projectId = 'project-123';
      const mockContributors: ProjectContributor[] = [
        {
          id: 'contributor-1',
          userId: 'user-1',
          role: 'OWNER',
          joinedAt: '2024-01-01T00:00:00Z',
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
            provider: null,
            providerId: null,
            bio: null,
            dob: null,
            phone: null,
            isEmailConfirmed: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
        {
          id: 'contributor-2',
          userId: 'user-2',
          role: 'WRITE',
          joinedAt: '2024-01-02T00:00:00Z',
          user: {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            provider: null,
            providerId: null,
            bio: null,
            dob: null,
            phone: null,
            isEmailConfirmed: true,
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        },
      ];

      mockGet.mockResolvedValue({ data: mockContributors });

      const result = await ProjectsService.getProjectContributors(projectId);

      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/contributors`
      );
      expect(result).toEqual(mockContributors);
    });

    it('should throw error when API call fails', async () => {
      const projectId = 'project-123';
      const mockError = new Error('Failed to fetch contributors');
      mockGet.mockRejectedValue(mockError);

      await expect(
        ProjectsService.getProjectContributors(projectId)
      ).rejects.toThrow('Failed to fetch contributors');
      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/contributors`
      );
    });

    it('should handle empty contributors list', async () => {
      const projectId = 'project-123';
      const mockContributors: ProjectContributor[] = [];

      mockGet.mockResolvedValue({ data: mockContributors });

      const result = await ProjectsService.getProjectContributors(projectId);

      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/contributors`
      );
      expect(result).toEqual(mockContributors);
      expect(result).toHaveLength(0);
    });
  });

  describe('getProjectAttachments', () => {
    it('should call API client with correct endpoint', async () => {
      const projectId = 'project-123';
      const mockAttachments: Attachment[] = [
        {
          id: 'attachment-1',
          filename: 'document.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
          cloudinaryUrl: 'https://cloudinary.com/document.pdf',
          entityType: 'PROJECT',
          entityId: projectId,
          uploadedAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          uploadedBy: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
            provider: null,
            providerId: null,
            bio: null,
            dob: null,
            phone: null,
            isEmailConfirmed: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
        {
          id: 'attachment-2',
          filename: 'image.jpg',
          fileType: 'image/jpeg',
          fileSize: 2048,
          cloudinaryUrl: 'https://cloudinary.com/image.jpg',
          entityType: 'PROJECT',
          entityId: projectId,
          uploadedAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          uploadedBy: {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            provider: null,
            providerId: null,
            bio: null,
            dob: null,
            phone: null,
            isEmailConfirmed: true,
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        },
      ];

      mockGet.mockResolvedValue({ data: mockAttachments });

      const result = await ProjectsService.getProjectAttachments(projectId);

      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/attachments`
      );
      expect(result).toEqual(mockAttachments);
    });

    it('should throw error when API call fails', async () => {
      const projectId = 'project-123';
      const mockError = new Error('Failed to fetch attachments');
      mockGet.mockRejectedValue(mockError);

      await expect(
        ProjectsService.getProjectAttachments(projectId)
      ).rejects.toThrow('Failed to fetch attachments');
      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/attachments`
      );
    });

    it('should handle empty attachments list', async () => {
      const projectId = 'project-123';
      const mockAttachments: Attachment[] = [];

      mockGet.mockResolvedValue({ data: mockAttachments });

      const result = await ProjectsService.getProjectAttachments(projectId);

      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/attachments`
      );
      expect(result).toEqual(mockAttachments);
      expect(result).toHaveLength(0);
    });
  });

  describe('Service behavior', () => {
    it('should use correct HTTP methods for each operation', async () => {
      // Mock all methods
      mockGet.mockResolvedValue({ data: {} });
      mockPost.mockResolvedValue({ data: {} });
      mockPut.mockResolvedValue({ data: {} });
      mockDelete.mockResolvedValue({ data: undefined });

      // Test each method
      await ProjectsService.getProjects();
      await ProjectsService.getProject('1');
      await ProjectsService.createProject({ name: 'Test' });
      await ProjectsService.updateProject('1', { name: 'Updated' });
      await ProjectsService.deleteProject('1');
      await ProjectsService.getProjectContributors('1');
      await ProjectsService.getProjectAttachments('1');

      // Verify correct methods were called
      expect(mockGet).toHaveBeenCalledTimes(4); // getProjects + getProject + getProjectContributors + getProjectAttachments
      expect(mockPost).toHaveBeenCalledTimes(1); // createProject
      expect(mockPut).toHaveBeenCalledTimes(1); // updateProject
      expect(mockDelete).toHaveBeenCalledTimes(1); // deleteProject
    });

    it('should return correct response types', async () => {
      const searchResponse: SearchProjectsResponse = {
        projects: [],
        total: 0,
        page: 1,
        limit: 6,
      };

      const projectResponse: Project = {
        id: '1',
        name: 'Test',
        status: 'ACTIVE',
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockGet.mockResolvedValueOnce({ data: searchResponse });
      mockGet.mockResolvedValueOnce({ data: projectResponse });

      const searchResult = await ProjectsService.getProjects();
      const projectResult = await ProjectsService.getProject('1');

      // Verify response types have correct structure
      expect(searchResult).toHaveProperty('projects');
      expect(searchResult).toHaveProperty('total');
      expect(searchResult).toHaveProperty('page');
      expect(searchResult).toHaveProperty('limit');

      expect(projectResult).toHaveProperty('id');
      expect(projectResult).toHaveProperty('name');
      expect(projectResult).toHaveProperty('status');
      expect(projectResult).toHaveProperty('ownerId');
    });
  });
});
