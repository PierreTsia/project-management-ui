import {
  useQueryParamHelper,
  queryParamSerializers,
} from './useQueryParamHelper';
import type { GlobalSearchTasksParams } from '@/types/task';

export function useTasksQueryParams() {
  return useQueryParamHelper<GlobalSearchTasksParams>({
    mapping: {
      query: 'query',
      status: 'status',
      priority: 'priority',
      assigneeFilter: 'assigneeFilter',
      projectIds: 'projectIds',
      sortBy: 'sortBy',
      dueDateFrom: 'dueDateFrom',
      dueDateTo: 'dueDateTo',
      isOverdue: 'isOverdue',
      hasDueDate: 'hasDueDate',
      page: 'page',
      limit: 'limit',
    },
    defaultValues: {
      page: 1,
      limit: 20,
    },
    serializers: {
      isOverdue: queryParamSerializers.boolean,
      hasDueDate: queryParamSerializers.boolean,
      projectIds: queryParamSerializers.array,
      page: queryParamSerializers.number,
      limit: queryParamSerializers.number,
    },
  });
}
