import { useMemo } from 'react';
import {
  useQueryParamHelper,
  queryParamSerializers,
} from './useQueryParamHelper';
import type { GlobalSearchTasksParams } from '@/types/task';

export function useTasksQueryParams() {
  const queryParamResult = useQueryParamHelper<GlobalSearchTasksParams>({
    mapping: {
      query: 'query',
      status: 'status',
      priority: 'priority',
      assigneeFilter: 'assigneeFilter',
      projectIds: 'projectIds',
      includeArchived: 'includeArchived',
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
      includeArchived: queryParamSerializers.boolean,
      projectIds: queryParamSerializers.array,
      page: queryParamSerializers.number,
      limit: queryParamSerializers.number,
    },
  });

  // Check if there are meaningful filters (excluding pagination)
  const hasActiveFilters = useMemo(() => {
    const {
      page: _,
      limit: __,
      ...meaningfulFilters
    } = queryParamResult.filters;
    return Object.values(meaningfulFilters).some(
      value =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        (Array.isArray(value) ? value.length > 0 : true)
    );
  }, [queryParamResult.filters]);

  return {
    ...queryParamResult,
    hasActiveFilters,
  };
}
