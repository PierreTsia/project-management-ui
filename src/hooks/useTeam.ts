import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import type {
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
} from '@/types/api';

// Query keys
export const teamKeys = {
  all: ['team-members'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...teamKeys.lists(), filters] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: number) => [...teamKeys.details(), id] as const,
};

// Get team members list
export function useTeamMembers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: teamKeys.list(params || {}),
    queryFn: () => ApiService.getTeamMembers(params),
    staleTime: 1000 * 60 * 10, // 10 minutes (team members don't change often)
  });
}

// Get single team member
export function useTeamMember(id: number) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => ApiService.getTeamMember(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Create team member mutation
export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamMemberRequest) =>
      ApiService.createTeamMember(data),
    onSuccess: () => {
      // Invalidate and refetch team members list
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

// Update team member mutation
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTeamMemberRequest) =>
      ApiService.updateTeamMember(data),
    onSuccess: (data, variables) => {
      // Update the team member in cache
      queryClient.setQueryData(teamKeys.detail(variables.id), data);
      // Invalidate and refetch team members list
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

// Delete team member mutation
export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ApiService.deleteTeamMember(id),
    onSuccess: (_, id) => {
      // Remove the team member from cache
      queryClient.removeQueries({ queryKey: teamKeys.detail(id) });
      // Invalidate and refetch team members list
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}
