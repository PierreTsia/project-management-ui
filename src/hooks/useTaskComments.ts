import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CommentsService } from '@/services/comments';
import type { TaskComment } from '@/types/comment';

export const useTaskComments = (projectId: string, taskId: string) => {
  return useQuery<TaskComment[], Error>({
    queryKey: ['taskComments', projectId, taskId],
    queryFn: () => CommentsService.getTaskComments(projectId, taskId),
    enabled: !!projectId && !!taskId,
  });
};

export const useCreateTaskComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      content,
    }: {
      projectId: string;
      taskId: string;
      content: string;
    }) => CommentsService.createTaskComment(projectId, taskId, { content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['taskComments', variables.projectId, variables.taskId],
      });
    },
  });
};

export const useDeleteTaskComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      commentId,
    }: {
      projectId: string;
      taskId: string;
      commentId: string;
    }) => CommentsService.deleteTaskComment(projectId, taskId, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['taskComments', variables.projectId, variables.taskId],
      });
    },
  });
};
