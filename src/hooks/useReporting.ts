import { useQuery } from '@tanstack/react-query';
import { ReportingService } from '@/services/reporting';

const REPORTING_STALE_TIME = 1000 * 60 * 2; // 2 minutes

// Query keys
export const reportingKeys = {
  all: ['reporting'] as const,
  projectProgress: (projectId: string, include?: string, days?: number) =>
    [
      ...reportingKeys.all,
      'projectProgress',
      projectId,
      include,
      days,
    ] as const,
  teamPerformance: () => [...reportingKeys.all, 'teamPerformance'] as const,
  allProjectsProgress: () =>
    [...reportingKeys.all, 'allProjectsProgress'] as const,
};

/**
 * Get project progress with trends and activity
 */
export const useProjectProgress = (
  projectId: string,
  include?: 'trends' | 'activity' | 'trends,activity',
  days: number = 30
) => {
  return useQuery({
    queryKey: reportingKeys.projectProgress(projectId, include, days),
    queryFn: () =>
      ReportingService.getProjectProgress(projectId, include, days),
    enabled: !!projectId,
    staleTime: REPORTING_STALE_TIME,
  });
};

/**
 * Get team performance metrics
 */
export const useTeamPerformance = () => {
  return useQuery({
    queryKey: reportingKeys.teamPerformance(),
    queryFn: () => ReportingService.getTeamPerformance(),
    staleTime: REPORTING_STALE_TIME,
  });
};

/**
 * Get aggregated progress data for all projects
 */
export const useAllProjectsProgress = () => {
  return useQuery({
    queryKey: reportingKeys.allProjectsProgress(),
    queryFn: () => ReportingService.getAllProjectsProgress(),
    staleTime: REPORTING_STALE_TIME,
  });
};
