import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProjectsService, type GetProjectsParams } from '../projects';
import { apiClient } from '@/lib/api-client';
import { ProjectStatus } from '@/types/project';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  SearchProjectsResponse,
} from '@/types/project';

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
          status: ProjectStatus.ACTIVE,
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
        status: ProjectStatus.ARCHIVED,
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
        status: ProjectStatus.ACTIVE,
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
        status: ProjectStatus.ACTIVE,
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
        status: ProjectStatus.ACTIVE,
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
        status: ProjectStatus.ACTIVE,
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
        status: ProjectStatus.ARCHIVED,
      };

      const mockProject: Project = {
        id: projectId,
        name: 'Updated Project',
        description: 'Updated description',
        status: ProjectStatus.ARCHIVED,
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
        status: ProjectStatus.ARCHIVED,
      };

      const mockProject: Project = {
        id: projectId,
        name: 'Original Name',
        description: 'Original description',
        status: ProjectStatus.ARCHIVED,
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

      // Verify correct methods were called
      expect(mockGet).toHaveBeenCalledTimes(2); // getProjects + getProject
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
        status: ProjectStatus.ACTIVE,
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
