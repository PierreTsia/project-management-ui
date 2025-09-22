import type { GetProjectsParams } from '@/services/projects';

export type BuildProjectsSearchParamsInput = {
  query?: string | undefined;
  includeArchived?: boolean | undefined;
  page?: number | undefined;
  limit?: number | undefined;
};

export function buildProjectsSearchParams(
  input: BuildProjectsSearchParamsInput
): GetProjectsParams {
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;
  const includeArchived = Boolean(input.includeArchived);
  const params: GetProjectsParams = {
    page,
    limit,
    ...(input.query ? { query: input.query } : {}),
    ...(!includeArchived ? { status: 'ACTIVE' } : {}),
  };
  return params;
}
