import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TasksService, type UploadAttachmentRequest } from '@/services/tasks';
import { dashboardKeys } from './useDashboard';
import type { Task } from '@/types/task';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  SearchTasksParams,
  GlobalSearchTasksParams,
  BulkUpdateStatusRequest,
  BulkAssignTasksRequest,
  BulkDeleteTasksRequest,
  CreateTaskLinkRequest,
  CreateTaskHierarchyRequest,
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
  // Task links keys
  links: () => [...taskKeys.all, 'links'] as const,
  taskLinks: (projectId: string, taskId: string) =>
    [...taskKeys.links(), projectId, taskId] as const,
  taskLinksDetailed: (projectId: string, taskId: string) =>
    [...taskKeys.taskLinks(projectId, taskId), 'detailed'] as const,
  relatedTasks: (projectId: string, taskId: string) =>
    [...taskKeys.links(), projectId, taskId, 'related'] as const,
  // Task hierarchy keys
  hierarchy: () => [...taskKeys.all, 'hierarchy'] as const,
  taskHierarchy: (projectId: string, taskId: string) =>
    [...taskKeys.hierarchy(), projectId, taskId] as const,
  allTaskChildren: (projectId: string, taskId: string) =>
    [...taskKeys.taskHierarchy(projectId, taskId), 'all-children'] as const,
  allTaskParents: (projectId: string, taskId: string) =>
    [...taskKeys.taskHierarchy(projectId, taskId), 'all-parents'] as const,
  // Global tasks keys
  global: () => [...taskKeys.all, 'global'] as const,
  globalList: (params: GlobalSearchTasksParams) =>
    [...taskKeys.global(), 'list', params] as const,
  globalSearch: (params: GlobalSearchTasksParams) =>
    [...taskKeys.global(), 'search', params] as const,
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
      // Invalidate global tasks queries (used on Tasks page)
      queryClient.invalidateQueries({
        queryKey: taskKeys.global(),
      });
      // Invalidate dashboard queries (summary and myTasks)
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
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
      // Invalidate dashboard queries (summary and myTasks)
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
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
      // Also invalidate global tasks used on Tasks page
      queryClient.invalidateQueries({
        queryKey: taskKeys.global(),
      });
      // Invalidate dashboard queries (summary and myTasks)
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
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
      // Also refresh global tasks queries (used on Tasks page)
      queryClient.invalidateQueries({
        queryKey: taskKeys.global(),
      });
      // Invalidate dashboard queries (summary and myTasks)
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
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
      // Also invalidate global tasks used on Tasks page
      queryClient.invalidateQueries({
        queryKey: taskKeys.global(),
      });
      // Invalidate dashboard queries (summary and myTasks)
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
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
      // Also invalidate global tasks used on Tasks page
      queryClient.invalidateQueries({
        queryKey: taskKeys.global(),
      });
      // Invalidate dashboard queries (summary and myTasks)
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
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

// Global Tasks Hooks
export const useAllUserTasks = (params?: GlobalSearchTasksParams) => {
  return useQuery({
    queryKey: taskKeys.globalList(params || {}),
    queryFn: () => TasksService.getAllUserTasks(params),
    staleTime: TASK_STALE_TIME,
  });
};

export const useSearchAllUserTasks = (params?: GlobalSearchTasksParams) => {
  return useQuery({
    queryKey: taskKeys.globalSearch(params || {}),
    queryFn: () => TasksService.searchAllUserTasks(params),
    staleTime: TASK_STALE_TIME,
  });
};

// Bulk Operations Hooks
export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateStatusRequest) =>
      TasksService.bulkUpdateStatus(data),
    onSuccess: () => {
      // Invalidate all global task queries
      queryClient.invalidateQueries({
        queryKey: taskKeys.global(),
      });
      // Also invalidate project-specific queries
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });
      // Invalidate dashboard queries (summary and myTasks)
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });
    },
  });
};

export const useBulkAssignTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkAssignTasksRequest) =>
      TasksService.bulkAssignTasks(data),
    onSuccess: () => {
      // Invalidate all global task queries
      queryClient.invalidateQueries({
        queryKey: taskKeys.global(),
      });
      // Also invalidate project-specific queries
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });
      // Invalidate dashboard queries (summary and myTasks)
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });
    },
  });
};

export const useBulkDeleteTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkDeleteTasksRequest) =>
      TasksService.bulkDeleteTasks(data),
    onSuccess: () => {
      // Invalidate all global task queries
      queryClient.invalidateQueries({
        queryKey: taskKeys.global(),
      });
      // Also invalidate project-specific queries
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });
      // Invalidate dashboard queries (summary and myTasks)
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });
    },
  });
};

// Task Link Hooks
export const useTaskLinks = (projectId: string, taskId: string) => {
  return useQuery({
    queryKey: taskKeys.taskLinks(projectId, taskId),
    queryFn: () => TasksService.getTaskLinks(projectId, taskId),
    enabled: !!projectId && !!taskId,
    staleTime: TASK_STALE_TIME,
  });
};

export const useTaskLinksDetailed = (projectId: string, taskId: string) => {
  return useQuery({
    queryKey: taskKeys.taskLinksDetailed(projectId, taskId),
    queryFn: () => TasksService.getTaskLinksDetailed(projectId, taskId),
    enabled: !!projectId && !!taskId,
    staleTime: TASK_STALE_TIME,
  });
};

export const useCreateTaskLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      data,
    }: {
      projectId: string;
      taskId: string;
      data: CreateTaskLinkRequest;
    }) => TasksService.createTaskLink(projectId, taskId, data),
    onSuccess: (_, variables) => {
      // Invalidate task links queries
      queryClient.invalidateQueries({
        queryKey: taskKeys.taskLinks(variables.projectId, variables.taskId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.taskLinksDetailed(
          variables.projectId,
          variables.taskId
        ),
      });
      // Invalidate related tasks
      queryClient.invalidateQueries({
        queryKey: taskKeys.relatedTasks(variables.projectId, variables.taskId),
      });
      // Invalidate task detail to refresh links
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.projectId, variables.taskId),
      });
    },
  });
};

export const useDeleteTaskLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      linkId,
    }: {
      projectId: string;
      taskId: string;
      linkId: string;
    }) => TasksService.deleteTaskLink(projectId, taskId, linkId),
    onSuccess: (_, variables) => {
      // Invalidate task links queries
      queryClient.invalidateQueries({
        queryKey: taskKeys.taskLinks(variables.projectId, variables.taskId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.taskLinksDetailed(
          variables.projectId,
          variables.taskId
        ),
      });
      // Invalidate related tasks
      queryClient.invalidateQueries({
        queryKey: taskKeys.relatedTasks(variables.projectId, variables.taskId),
      });
      // Invalidate task detail to refresh links
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.projectId, variables.taskId),
      });
    },
  });
};

export const useRelatedTasks = (projectId: string, taskId: string) => {
  return useQuery({
    queryKey: taskKeys.relatedTasks(projectId, taskId),
    queryFn: () => TasksService.getRelatedTasks(projectId, taskId),
    enabled: !!projectId && !!taskId,
    staleTime: TASK_STALE_TIME,
  });
};

// Task Hierarchy Hooks
export const useTaskHierarchy = (projectId: string, taskId: string) => {
  return useQuery({
    queryKey: taskKeys.taskHierarchy(projectId, taskId),
    queryFn: () => TasksService.getTaskHierarchy(projectId, taskId),
    enabled: !!projectId && !!taskId,
    staleTime: TASK_STALE_TIME,
  });
};

export const useCreateTaskHierarchy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      parentTaskId,
      data,
    }: {
      projectId: string;
      parentTaskId: string;
      data: CreateTaskHierarchyRequest;
    }) => TasksService.createTaskHierarchy(projectId, parentTaskId, data),
    onSuccess: (_, variables) => {
      // Invalidate hierarchy queries for both parent and child
      queryClient.invalidateQueries({
        queryKey: taskKeys.taskHierarchy(
          variables.projectId,
          variables.parentTaskId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.taskHierarchy(
          variables.projectId,
          variables.data.childTaskId
        ),
      });
      // Invalidate task details
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.projectId, variables.parentTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(
          variables.projectId,
          variables.data.childTaskId
        ),
      });
    },
  });
};

export const useDeleteTaskHierarchy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      parentTaskId,
      childTaskId,
    }: {
      projectId: string;
      parentTaskId: string;
      childTaskId: string;
    }) =>
      TasksService.deleteTaskHierarchy(projectId, parentTaskId, childTaskId),
    onSuccess: (_, variables) => {
      // Invalidate hierarchy queries for both parent and child
      queryClient.invalidateQueries({
        queryKey: taskKeys.taskHierarchy(
          variables.projectId,
          variables.parentTaskId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.taskHierarchy(
          variables.projectId,
          variables.childTaskId
        ),
      });
      // Invalidate task details
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.projectId, variables.parentTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.projectId, variables.childTaskId),
      });
    },
  });
};
