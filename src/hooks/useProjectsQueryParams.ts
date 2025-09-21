import {
  useQueryParamHelper,
  queryParamSerializers,
} from './useQueryParamHelper';
import type { ProjectStatus } from '@/types/project';

interface ProjectsQueryParams {
  query?: string;
  status?: ProjectStatus;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export function useProjectsQueryParams() {
  return useQueryParamHelper<ProjectsQueryParams>({
    mapping: {
      query: 'query',
      status: 'status',
      page: 'page',
      limit: 'limit',
    },
    defaultValues: {
      page: 1,
      limit: 6,
    },
    serializers: {
      page: queryParamSerializers.number,
      limit: queryParamSerializers.number,
    },
  });
}
