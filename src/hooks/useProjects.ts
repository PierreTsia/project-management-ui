import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectsService, type GetProjectsParams } from '@/services/projects';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/types/project';

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
  tasks: () => [...projectKeys.all, 'tasks'] as const,
  projectTasks: (id: string) => [...projectKeys.tasks(), id] as const,
  attachments: () => [...projectKeys.all, 'attachments'] as const,
  projectAttachments: (id: string) =>
    [...projectKeys.attachments(), id] as const,
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

export const useProjectTasks = (id: string) => {
  return useQuery({
    queryKey: projectKeys.projectTasks(id),
    queryFn: () => ProjectsService.getProjectTasks(id),
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
