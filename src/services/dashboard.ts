import { apiClient } from '@/lib/api-client';
import type {
  DashboardSummary,
  DashboardTask,
  DashboardProject,
  DashboardQuery,
} from '@/types/dashboard';

export class DashboardService {
  /**
   * Get dashboard summary statistics
   */
  static async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get('/dashboard/summary');
    return response.data;
  }

  /**
   * Get user assigned tasks across all projects
   */
  static async getMyTasks(query?: DashboardQuery): Promise<DashboardTask[]> {
    const params = new URLSearchParams();

    if (query?.status) params.append('status', query.status);
    if (query?.priority) params.append('priority', query.priority);
    if (query?.projectId) params.append('projectId', query.projectId);
    if (query?.dueDateFrom) params.append('dueDateFrom', query.dueDateFrom);
    if (query?.dueDateTo) params.append('dueDateTo', query.dueDateTo);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const response = await apiClient.get(
      `/dashboard/my-tasks?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get user accessible projects
   */
  static async getMyProjects(): Promise<DashboardProject[]> {
    const response = await apiClient.get('/dashboard/my-projects');
    return response.data;
  }
}
