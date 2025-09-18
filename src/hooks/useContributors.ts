import { useQuery } from '@tanstack/react-query';
import { ContributorsService } from '@/services';
import type {
  ContributorsParams,
  ContributorsListResponse,
  ContributorProjectsResponse,
} from '@/types/contributor';

const CONTRIBUTORS_STALE_TIME = 1000 * 60 * 2; // 2 minutes
const CONTRIBUTOR_PROJECTS_STALE_TIME = 1000 * 60 * 2; // 2 minutes

export const contributorKeys = {
  all: ['contributors'] as const,
  lists: () => [...contributorKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...contributorKeys.lists(), filters] as const,
  projects: () => [...contributorKeys.all, 'projects'] as const,
  userProjects: (userId: string) =>
    [...contributorKeys.projects(), userId] as const,
};

export const useContributors = (params?: ContributorsParams) => {
  return useQuery<ContributorsListResponse>({
    queryKey: contributorKeys.list(params || {}),
    queryFn: () => ContributorsService.getContributors(params),
    staleTime: CONTRIBUTORS_STALE_TIME,
  });
};

export const useContributorProjects = (userId: string) => {
  return useQuery<ContributorProjectsResponse>({
    queryKey: contributorKeys.userProjects(userId),
    queryFn: () => ContributorsService.getContributorProjects(userId),
    enabled: !!userId,
    staleTime: CONTRIBUTOR_PROJECTS_STALE_TIME,
  });
};
