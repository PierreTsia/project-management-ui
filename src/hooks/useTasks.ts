import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import type { CreateTaskRequest, UpdateTaskRequest } from '@/types/api';

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
};

// Get tasks list
export function useTasks(params?: {
  page?: number;
  limit?: number;
  status?: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  projectId?: number;
  assigneeId?: number;
}) {
  return useQuery({
    queryKey: taskKeys.list(params || {}),
    queryFn: () => ApiService.getTasks(params),
    staleTime: 1000 * 60 * 3, // 3 minutes (tasks change more frequently)
  });
}

// Get single task
export function useTask(id: number) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => ApiService.getTask(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Create task mutation
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => ApiService.createTask(data),
    onSuccess: () => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

// Update task mutation
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskRequest) => ApiService.updateTask(data),
    onSuccess: (data, variables) => {
      // Update the task in cache
      queryClient.setQueryData(taskKeys.detail(variables.id), data);
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

// Delete task mutation
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ApiService.deleteTask(id),
    onSuccess: (_, id) => {
      // Remove the task from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
