import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectsService } from '@/services/projects';
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
  detail: (id: number) => [...projectKeys.details(), id] as const,
};

// Get projects list
export const useProjects = (params?: {
  page?: number;
  limit?: number;
  status?: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  priority?: 'low' | 'medium' | 'high';
}) => {
  return useQuery({
    queryKey: projectKeys.list(params || {}),
    queryFn: () => ProjectsService.getProjects(params),
    staleTime: PROJECT_STALE_TIME,
  });
};

export const useProject = (id: number) => {
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
    mutationFn: (data: UpdateProjectRequest) =>
      ProjectsService.updateProject(data),
    onSuccess: (data, variables) => {
      // Update the project in cache
      queryClient.setQueryData(projectKeys.detail(variables.id), data);
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ProjectsService.deleteProject(id),
    onSuccess: (_, id) => {
      // Remove the project from cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};
