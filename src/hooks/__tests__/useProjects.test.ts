import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createElement } from 'react';
import {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  projectKeys,
} from '../useProjects';
import { ProjectsService, type GetProjectsParams } from '@/services/projects';
import { ProjectStatus } from '@/types/project';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  SearchProjectsResponse,
} from '@/types/project';

// Mock ProjectsService
vi.mock('@/services/projects');
const mockProjectsService = vi.mocked(ProjectsService);

// Mock console.error to avoid noise in tests
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => {});

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useProjects hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('projectKeys', () => {
    it('should generate correct query keys', () => {
      expect(projectKeys.all).toEqual(['projects']);
      expect(projectKeys.lists()).toEqual(['projects', 'list']);
      expect(projectKeys.list({})).toEqual(['projects', 'list', {}]);
      expect(projectKeys.list({ page: 1, limit: 6 })).toEqual([
        'projects',
        'list',
        { page: 1, limit: 6 },
      ]);
      expect(projectKeys.details()).toEqual(['projects', 'detail']);
      expect(projectKeys.detail('project-123')).toEqual([
        'projects',
        'detail',
        'project-123',
      ]);
    });
  });

  describe('useProjects', () => {
    it('should fetch projects successfully with default params', async () => {
      const mockResponse: SearchProjectsResponse = {
        projects: [
          {
            id: '1',
            name: 'Test Project',
            description: 'A test project',
            status: ProjectStatus.ACTIVE,
            ownerId: 'user1',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 6,
      };

      mockProjectsService.getProjects.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjects(), { wrapper });

      // Should start loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(mockProjectsService.getProjects).toHaveBeenCalledTimes(1);
      expect(mockProjectsService.getProjects).toHaveBeenCalledWith(undefined);
    });

    it('should fetch projects with custom params', async () => {
      const params: GetProjectsParams = {
        query: 'mobile',
        status: ProjectStatus.ACTIVE,
        page: 2,
        limit: 12,
      };

      const mockResponse: SearchProjectsResponse = {
        projects: [],
        total: 50,
        page: 2,
        limit: 12,
      };

      mockProjectsService.getProjects.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjects(params), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mockProjectsService.getProjects).toHaveBeenCalledWith(params);
    });

    it('should handle fetch error', async () => {
      const mockError = new Error('Failed to fetch projects');
      mockProjectsService.getProjects.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjects(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });

    it('should use correct query key and stale time', async () => {
      const params = { page: 1, limit: 6 };
      const mockResponse: SearchProjectsResponse = {
        projects: [],
        total: 0,
        page: 1,
        limit: 6,
      };

      mockProjectsService.getProjects.mockResolvedValue(mockResponse);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      renderHook(() => useProjects(params), { wrapper });

      await waitFor(() => {
        const queryData = queryClient.getQueryData(projectKeys.list(params));
        expect(queryData).toEqual(mockResponse);
      });
    });
  });

  describe('useProject', () => {
    const projectId = 'project-123';

    it('should fetch single project successfully', async () => {
      const mockProject: Project = {
        id: projectId,
        name: 'Test Project',
        description: 'A test project',
        status: ProjectStatus.ACTIVE,
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockProjectsService.getProject.mockResolvedValue(mockProject);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProject(projectId), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProject);
      expect(mockProjectsService.getProject).toHaveBeenCalledWith(projectId);
    });

    it('should be disabled when projectId is empty', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useProject(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(mockProjectsService.getProject).not.toHaveBeenCalled();
    });

    it('should handle project not found error', async () => {
      const mockError = new Error('Project not found');
      mockProjectsService.getProject.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProject(projectId), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useCreateProject', () => {
    it('should create project successfully', async () => {
      const createRequest: CreateProjectRequest = {
        name: 'New Project',
        description: 'A new project',
      };

      const mockProject: Project = {
        id: 'new-project-123',
        name: 'New Project',
        description: 'A new project',
        status: ProjectStatus.ACTIVE,
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockProjectsService.createProject.mockResolvedValue(mockProject);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateProject(), { wrapper });

      result.current.mutate(createRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProject);
      expect(mockProjectsService.createProject).toHaveBeenCalledWith(
        createRequest
      );
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

      mockProjectsService.createProject.mockResolvedValue(mockProject);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateProject(), { wrapper });

      result.current.mutate(createRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProject);
    });

    it('should handle create error', async () => {
      const createRequest: CreateProjectRequest = {
        name: 'Invalid Project',
      };

      const mockError = new Error('Validation failed');
      mockProjectsService.createProject.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateProject(), { wrapper });

      result.current.mutate(createRequest);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });

    it('should invalidate projects list on success', async () => {
      const createRequest: CreateProjectRequest = {
        name: 'New Project',
      };

      const mockProject: Project = {
        id: 'new-project-123',
        name: 'New Project',
        status: ProjectStatus.ACTIVE,
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockProjectsService.createProject.mockResolvedValue(mockProject);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useCreateProject(), { wrapper });

      result.current.mutate(createRequest);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: projectKeys.lists(),
      });
    });
  });

  describe('useUpdateProject', () => {
    const projectId = 'project-123';

    it('should update project successfully', async () => {
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

      mockProjectsService.updateProject.mockResolvedValue(mockProject);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProject(), { wrapper });

      result.current.mutate({ id: projectId, data: updateRequest });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProject);
      expect(mockProjectsService.updateProject).toHaveBeenCalledWith(
        projectId,
        updateRequest
      );
    });

    it('should update project with partial data', async () => {
      const updateRequest: UpdateProjectRequest = {
        status: ProjectStatus.ARCHIVED,
      };

      const mockProject: Project = {
        id: projectId,
        name: 'Original Name',
        status: ProjectStatus.ARCHIVED,
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockProjectsService.updateProject.mockResolvedValue(mockProject);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProject(), { wrapper });

      result.current.mutate({ id: projectId, data: updateRequest });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProject);
    });

    it('should handle update error', async () => {
      const updateRequest: UpdateProjectRequest = {
        name: 'Updated Name',
      };

      const mockError = new Error('Project not found');
      mockProjectsService.updateProject.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateProject(), { wrapper });

      result.current.mutate({ id: projectId, data: updateRequest });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });

    it('should update cache and invalidate queries on success', async () => {
      const updateRequest: UpdateProjectRequest = {
        name: 'Updated Project',
      };

      const mockProject: Project = {
        id: projectId,
        name: 'Updated Project',
        status: ProjectStatus.ACTIVE,
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockProjectsService.updateProject.mockResolvedValue(mockProject);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useUpdateProject(), { wrapper });

      result.current.mutate({ id: projectId, data: updateRequest });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(setQueryDataSpy).toHaveBeenCalledWith(
        projectKeys.detail(projectId),
        mockProject
      );
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: projectKeys.lists(),
      });
    });
  });

  describe('useDeleteProject', () => {
    const projectId = 'project-123';

    it('should delete project successfully', async () => {
      mockProjectsService.deleteProject.mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteProject(), { wrapper });

      result.current.mutate(projectId);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockProjectsService.deleteProject).toHaveBeenCalledWith(projectId);
    });

    it('should handle delete error', async () => {
      const mockError = new Error('Failed to delete project');
      mockProjectsService.deleteProject.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteProject(), { wrapper });

      result.current.mutate(projectId);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });

    it('should remove from cache and invalidate queries on success', async () => {
      mockProjectsService.deleteProject.mockResolvedValue(undefined);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const removeQueriesSpy = vi.spyOn(queryClient, 'removeQueries');
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

      const { result } = renderHook(() => useDeleteProject(), { wrapper });

      result.current.mutate(projectId);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(removeQueriesSpy).toHaveBeenCalledWith({
        queryKey: projectKeys.detail(projectId),
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: projectKeys.lists(),
      });
    });
  });

  describe('stale time configuration', () => {
    it('should use 5 minute stale time for queries', async () => {
      const mockResponse: SearchProjectsResponse = {
        projects: [],
        total: 0,
        page: 1,
        limit: 6,
      };

      mockProjectsService.getProjects.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProjects(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Data should be fresh (not stale) initially
      expect(result.current.isStale).toBe(false);
    });
  });
});
