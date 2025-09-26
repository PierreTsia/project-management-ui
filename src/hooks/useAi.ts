import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AiService } from '@/services/ai';
import type {
  GenerateTasksRequest,
  GenerateTasksResponse,
  GenerateLinkedTasksPreviewRequest,
  GenerateLinkedTasksPreviewResponse,
  ConfirmLinkedTasksRequest,
  ConfirmLinkedTasksResponse,
} from '@/types/ai';
import { taskKeys } from './useTasks';
import { dashboardKeys } from './useDashboard';

export const aiKeys = {
  all: ['ai'] as const,
  taskgen: () => [...aiKeys.all, 'taskgen'] as const,
};

export function useGenerateTasks() {
  return useMutation<GenerateTasksResponse, unknown, GenerateTasksRequest>({
    mutationKey: aiKeys.taskgen(),
    mutationFn: (payload: GenerateTasksRequest) =>
      AiService.generateTasks(payload),
  });
}

export function useGenerateLinkedTasksPreview() {
  return useMutation<
    GenerateLinkedTasksPreviewResponse,
    unknown,
    GenerateLinkedTasksPreviewRequest
  >({
    mutationKey: [...aiKeys.taskgen(), 'linked', 'preview'],
    mutationFn: (payload: GenerateLinkedTasksPreviewRequest) =>
      AiService.generateLinkedTasksPreview(payload),
  });
}

export function useConfirmLinkedTasks() {
  const queryClient = useQueryClient();
  return useMutation<
    ConfirmLinkedTasksResponse,
    unknown,
    ConfirmLinkedTasksRequest
  >({
    mutationKey: [...aiKeys.taskgen(), 'linked', 'confirm'],
    mutationFn: (payload: ConfirmLinkedTasksRequest) =>
      AiService.confirmLinkedTasks(payload),
    onSuccess: (_data, variables) => {
      // Invalidate tasks caches for the project and global views
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.projectId, {}),
      });
      queryClient.invalidateQueries({ queryKey: taskKeys.global() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
