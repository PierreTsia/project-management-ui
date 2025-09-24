import { useMutation } from '@tanstack/react-query';
import { AiService } from '@/services/ai';
import type { GenerateTasksRequest, GenerateTasksResponse } from '@/types/ai';

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
