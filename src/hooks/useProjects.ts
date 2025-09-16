import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ProjectsService,
  type GetProjectsParams,
  type AddContributorRequest,
  type UploadAttachmentRequest,
} from '@/services/projects';
import type { UpdateContributorRoleRequest } from '@/services/projects';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/types/project';
import { taskKeys } from '@/hooks/useTasks';
import { dashboardKeys } from './useDashboard';

const PROJECT_STALE_TIME = 1000 * 60 * 5; // 5 minutes

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  contributors: () => [...projectKeys.all, 'contributors'] as const,
  projectContributors: (id: string) =>
    [...projectKeys.contributors(), id] as const,
  attachments: () => [...projectKeys.all, 'attachments'] as const,
  projectAttachments: (id: string) =>
    [...projectKeys.attachments(), id] as const,
  projectAttachment: (projectId: string, attachmentId: string) =>
    [...projectKeys.projectAttachments(projectId), attachmentId] as const,
};

// Get projects list
export const useProjects = (params?: GetProjectsParams) => {
  return useQuery({
    queryKey: projectKeys.list(params || {}),
    queryFn: () => ProjectsService.getProjects(params),
    staleTime: PROJECT_STALE_TIME,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => ProjectsService.getProject(id),
    enabled: !!id,
    staleTime: PROJECT_STALE_TIME,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) =>
      ProjectsService.createProject(data),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // Invalidate dashboard queries (summary and myProjects)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      ProjectsService.updateProject(id, data),
    onSuccess: (response, variables) => {
      // Update the project in cache
      queryClient.setQueryData(projectKeys.detail(variables.id), response);
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // Also invalidate task caches that may denormalize project name on tasks
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.global() });
      // Invalidate dashboard queries (summary and myProjects)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ProjectsService.deleteProject(id),
    onSuccess: (_, id) => {
      // Remove the project from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // Invalidate dashboard queries (summary and myProjects)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useProjectContributors = (id: string) => {
  return useQuery({
    queryKey: projectKeys.projectContributors(id),
    queryFn: () => ProjectsService.getProjectContributors(id),
    enabled: !!id,
    staleTime: PROJECT_STALE_TIME,
  });
};

export const useProjectAttachments = (id: string) => {
  return useQuery({
    queryKey: projectKeys.projectAttachments(id),
    queryFn: () => ProjectsService.getProjectAttachments(id),
    enabled: !!id,
    staleTime: PROJECT_STALE_TIME,
  });
};

export const useProjectAttachment = (
  projectId: string,
  attachmentId: string
) => {
  return useQuery({
    queryKey: projectKeys.projectAttachment(projectId, attachmentId),
    queryFn: () =>
      ProjectsService.getProjectAttachment(projectId, attachmentId),
    enabled: !!projectId && !!attachmentId,
    staleTime: PROJECT_STALE_TIME,
  });
};

export const useUploadProjectAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UploadAttachmentRequest;
    }) => ProjectsService.uploadProjectAttachment(projectId, data),
    onSuccess: (_, { projectId }) => {
      // Invalidate and refetch project attachments
      queryClient.invalidateQueries({
        queryKey: projectKeys.projectAttachments(projectId),
      });
    },
  });
};

export const useDeleteProjectAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      attachmentId,
    }: {
      projectId: string;
      attachmentId: string;
    }) => ProjectsService.deleteProjectAttachment(projectId, attachmentId),
    onSuccess: (_, { projectId }) => {
      // Invalidate and refetch project attachments
      queryClient.invalidateQueries({
        queryKey: projectKeys.projectAttachments(projectId),
      });
    },
  });
};

export const useAddContributor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: AddContributorRequest;
    }) => ProjectsService.addContributor(projectId, data),
    onSuccess: (_, { projectId }) => {
      // Invalidate and refetch project contributors
      queryClient.invalidateQueries({
        queryKey: projectKeys.projectContributors(projectId),
      });
    },
  });
};

export const useUpdateContributorRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      contributorId,
      data,
    }: {
      projectId: string;
      contributorId: string;
      data: UpdateContributorRoleRequest;
    }) => ProjectsService.updateContributorRole(projectId, contributorId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.projectContributors(projectId),
      });
    },
  });
};

export const useRemoveContributor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      contributorId,
    }: {
      projectId: string;
      contributorId: string;
    }) => ProjectsService.removeContributor(projectId, contributorId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.projectContributors(projectId),
      });
    },
  });
};
