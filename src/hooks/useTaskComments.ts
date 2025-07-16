import { useQuery } from '@tanstack/react-query';
import { CommentsService } from '@/services/comments';
import type { TaskComment } from '@/types/comment';

export const useTaskComments = (projectId: string, taskId: string) => {
  return useQuery<TaskComment[], Error>({
    queryKey: ['taskComments', projectId, taskId],
    queryFn: () => CommentsService.getTaskComments(projectId, taskId),
    enabled: !!projectId && !!taskId,
  });
};
