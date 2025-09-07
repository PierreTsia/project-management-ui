import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TasksService, type UploadAttachmentRequest } from '@/services/tasks';
import type { Task } from '@/types/task';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  SearchTasksParams,
} from '@/types/task';

const TASK_STALE_TIME = 1000 * 60 * 5; // 5 minutes

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (projectId: string, filters: Record<string, unknown>) =>
    [...taskKeys.lists(), projectId, filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (projectId: string, taskId: string) =>
    [...taskKeys.details(), projectId, taskId] as const,
  search: (projectId: string, params: SearchTasksParams) =>
    [...taskKeys.all, 'search', projectId, params] as const,
  attachments: () => [...taskKeys.all, 'attachments'] as const,
  taskAttachments: (projectId: string, taskId: string) =>
    [...taskKeys.attachments(), projectId, taskId] as const,
  taskAttachment: (projectId: string, taskId: string, attachmentId: string) =>
    [...taskKeys.taskAttachments(projectId, taskId), attachmentId] as const,
};

// Get project tasks
export const useProjectTasks = (projectId: string) => {
  return useQuery({
    queryKey: taskKeys.list(projectId, {}),
    queryFn: () => TasksService.getProjectTasks(projectId),
    enabled: !!projectId,
    staleTime: TASK_STALE_TIME,
  });
};

// Search project tasks
export const useSearchProjectTasks = (
  projectId: string,
  params?: SearchTasksParams
) => {
  return useQuery({
    queryKey: taskKeys.search(projectId, params || {}),
    queryFn: () => TasksService.searchProjectTasks(projectId, params),
    enabled: !!projectId,
    staleTime: TASK_STALE_TIME,
  });
};

// Get single task
export const useTask = (projectId: string, taskId: string) => {
  return useQuery({
    queryKey: taskKeys.detail(projectId, taskId),
    queryFn: () => TasksService.getTask(projectId, taskId),
    enabled: !!projectId && !!taskId,
    staleTime: TASK_STALE_TIME,
  });
};

// Create task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateTaskRequest;
    }) => TasksService.createTask(projectId, data),
    onSuccess: (_, variables) => {
      // Invalidate project tasks list
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });
      // Also invalidate the specific project tasks
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.projectId, {}),
      });
    },
  });
};

// Update task mutation
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      data,
    }: {
      projectId: string;
      taskId: string;
      data: UpdateTaskRequest;
    }) => TasksService.updateTask(projectId, taskId, data),
    onSuccess: (response, variables) => {
      // Update the task in cache
      queryClient.setQueryData(
        taskKeys.detail(variables.projectId, variables.taskId),
        response
      );
      // Invalidate project tasks list
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.projectId, {}),
      });
    },
  });
};

// Delete task mutation
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
    }: {
      projectId: string;
      taskId: string;
    }) => TasksService.deleteTask(projectId, taskId),
    onSuccess: (_, variables) => {
      // Remove the task from cache
      queryClient.removeQueries({
        queryKey: taskKeys.detail(variables.projectId, variables.taskId),
      });
      // Invalidate project tasks list
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.projectId, {}),
      });
    },
  });
};

// Update task status mutation
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      data,
    }: {
      projectId: string;
      taskId: string;
      data: UpdateTaskStatusRequest;
    }) => TasksService.updateTaskStatus(projectId, taskId, data),
    onMutate: async variables => {
      const { projectId, taskId, data } = variables;
      await queryClient.cancelQueries({
        queryKey: taskKeys.list(projectId, {}),
      });
      await queryClient.cancelQueries({
        queryKey: taskKeys.detail(projectId, taskId),
      });

      const previousList = queryClient.getQueryData<Task[]>(
        taskKeys.list(projectId, {})
      );
      const previousDetail = queryClient.getQueryData<Task>(
        taskKeys.detail(projectId, taskId)
      );

      if (previousList) {
        queryClient.setQueryData<Task[]>(
          taskKeys.list(projectId, {}),
          prev =>
            prev?.map(t =>
              t.id === taskId ? { ...t, status: data.status } : t
            ) ?? prev
        );
      }
      if (previousDetail) {
        queryClient.setQueryData<Task>(taskKeys.detail(projectId, taskId), {
          ...previousDetail,
          status: data.status,
        });
      }

      return { previousList, previousDetail };
    },
    onError: (_error, variables, context) => {
      const { projectId, taskId } = variables;
      if (context?.previousList) {
        queryClient.setQueryData<Task[]>(
          taskKeys.list(projectId, {}),
          context.previousList
        );
      }
      if (context?.previousDetail) {
        queryClient.setQueryData<Task>(
          taskKeys.detail(projectId, taskId),
          context.previousDetail
        );
      }
    },
    onSuccess: (response, variables) => {
      // keep tests that assert setQueryData on success
      queryClient.setQueryData(
        taskKeys.detail(variables.projectId, variables.taskId),
        response
      );
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.projectId, {}),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.projectId, variables.taskId),
      });
    },
  });
};

// Assign task mutation
export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      data,
    }: {
      projectId: string;
      taskId: string;
      data: AssignTaskRequest;
    }) => TasksService.assignTask(projectId, taskId, data),
    onSuccess: (response, variables) => {
      // Update the task in cache
      queryClient.setQueryData(
        taskKeys.detail(variables.projectId, variables.taskId),
        response
      );
      // Invalidate project tasks list
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.projectId, {}),
      });
    },
  });
};

// Unassign task mutation
export const useUnassignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
    }: {
      projectId: string;
      taskId: string;
    }) => TasksService.unassignTask(projectId, taskId),
    onSuccess: (response, variables) => {
      // Update the task in cache
      queryClient.setQueryData(
        taskKeys.detail(variables.projectId, variables.taskId),
        response
      );
      // Invalidate project tasks list
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.projectId, {}),
      });
    },
  });
};

// Task Attachment Hooks
export const useTaskAttachments = (projectId: string, taskId: string) => {
  return useQuery({
    queryKey: taskKeys.taskAttachments(projectId, taskId),
    queryFn: () => TasksService.getTaskAttachments(projectId, taskId),
    enabled: !!projectId && !!taskId,
    staleTime: TASK_STALE_TIME,
  });
};

export const useTaskAttachment = (
  projectId: string,
  taskId: string,
  attachmentId: string
) => {
  return useQuery({
    queryKey: taskKeys.taskAttachment(projectId, taskId, attachmentId),
    queryFn: () =>
      TasksService.getTaskAttachment(projectId, taskId, attachmentId),
    enabled: !!projectId && !!taskId && !!attachmentId,
    staleTime: TASK_STALE_TIME,
  });
};

export const useUploadTaskAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      data,
    }: {
      projectId: string;
      taskId: string;
      data: UploadAttachmentRequest;
    }) => TasksService.uploadTaskAttachment(projectId, taskId, data),
    onSuccess: (_, { projectId, taskId }) => {
      // Invalidate and refetch task attachments
      queryClient.invalidateQueries({
        queryKey: taskKeys.taskAttachments(projectId, taskId),
      });
    },
  });
};

export const useDeleteTaskAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      attachmentId,
    }: {
      projectId: string;
      taskId: string;
      attachmentId: string;
    }) => TasksService.deleteTaskAttachment(projectId, taskId, attachmentId),
    onSuccess: (_, { projectId, taskId }) => {
      // Invalidate and refetch task attachments
      queryClient.invalidateQueries({
        queryKey: taskKeys.taskAttachments(projectId, taskId),
      });
    },
  });
};
