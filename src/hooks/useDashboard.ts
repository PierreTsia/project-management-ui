import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard';
import type { DashboardQuery } from '@/types/dashboard';

const DASHBOARD_STALE_TIME = 1000 * 60 * 2; // 2 minutes

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  myTasks: (query?: DashboardQuery) =>
    [...dashboardKeys.all, 'myTasks', query] as const,
  myProjects: () => [...dashboardKeys.all, 'myProjects'] as const,
};

/**
 * Get dashboard summary statistics
 */
export const useDashboardSummary = () => {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => DashboardService.getSummary(),
    staleTime: DASHBOARD_STALE_TIME,
  });
};

/**
 * Get user assigned tasks across all projects
 */
export const useMyTasks = (query?: DashboardQuery) => {
  return useQuery({
    queryKey: dashboardKeys.myTasks(query),
    queryFn: () => DashboardService.getMyTasks(query),
    staleTime: DASHBOARD_STALE_TIME,
  });
};

/**
 * Get user accessible projects
 */
export const useMyProjects = () => {
  return useQuery({
    queryKey: dashboardKeys.myProjects(),
    queryFn: () => DashboardService.getMyProjects(),
    staleTime: DASHBOARD_STALE_TIME,
  });
};
