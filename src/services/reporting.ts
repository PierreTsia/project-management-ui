import { apiClient } from '@/lib/api-client';
import type { Project } from '@/types/project';

export interface ProjectProgressCurrent {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionPercentage: number;
}

export interface ProjectProgressTrendDaily {
  date: string;
  totalTasks: number;
  completedTasks: number;
  newTasks: number;
  completionRate: number;
  commentsAdded: number;
}

export interface ProjectProgressTrendWeekly {
  week: string;
  totalTasks: number;
  completedTasks: number;
  newTasks: number;
  completionRate: number;
}

export interface ProjectProgressTrends {
  daily: ProjectProgressTrendDaily[];
  weekly: ProjectProgressTrendWeekly[];
}

export interface ProjectProgressRecentActivity {
  tasksCreated: number;
  tasksCompleted: number;
  commentsAdded: number;
  attachmentsUploaded: number;
}

export interface ProjectProgress {
  current: ProjectProgressCurrent;
  trends?: ProjectProgressTrends;
  recentActivity?: ProjectProgressRecentActivity;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  myTasks: number;
  overdueTasks: number;
}

interface ProjectProgressResult {
  projectId: string;
  status: string;
  progress: ProjectProgress;
}

interface DailyTrendData {
  date: string;
  totalTasks: number;
  completedTasks: number;
  newTasks: number;
  completionRate: number;
  commentsAdded: number;
}

export class ReportingService {
  /**
   * Get project progress with optional trends and activity data
   */
  static async getProjectProgress(
    projectId: string,
    include?: 'trends' | 'activity' | 'trends,activity',
    days: number = 30
  ): Promise<ProjectProgress> {
    const params = new URLSearchParams();
    if (include) {
      params.append('include', include);
    }
    params.append('days', days.toString());

    const response = await apiClient.get(
      `/reporting/projects/${projectId}/progress?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get dashboard statistics (mock data for now)
   * TODO: Replace with real API endpoint when available
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    // Mock data - replace with real API call when backend endpoint is ready
    return {
      totalProjects: 12,
      activeProjects: 8,
      completedProjects: 4,
      totalTasks: 156,
      completedTasks: 89,
      inProgressTasks: 34,
      todoTasks: 33,
      myTasks: 23,
      overdueTasks: 3,
    };
  }

  /**
   * Get aggregated progress data for all projects
   */
  static async getAllProjectsProgress(currentUserId?: string): Promise<{
    aggregatedStats: DashboardStats;
    trendData: Array<{
      date: string;
      completionRate: number;
      completedTasks: number;
    }>;
  }> {
    try {
      // First, get all projects
      const projectsResponse = await apiClient.get('/projects');
      const projects = projectsResponse.data;

      if (!projects || projects.length === 0) {
        return {
          aggregatedStats: {
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            todoTasks: 0,
            myTasks: 0,
            overdueTasks: 0,
          },
          trendData: [],
        };
      }

      // Get progress data for each project
      const progressPromises = projects.map(async (project: Project) => {
        try {
          const progressResponse = await apiClient.get(
            `/reporting/projects/${project.id}/progress?include=trends&days=30`
          );
          return {
            projectId: project.id,
            status: project.status,
            progress: progressResponse.data,
          } as ProjectProgressResult;
        } catch (error) {
          console.warn(
            `Failed to fetch progress for project ${project.id}:`,
            error
          );
          return null;
        }
      });

      const progressResults = await Promise.all(progressPromises);
      const validProgressResults = progressResults.filter(
        (result): result is ProjectProgressResult => result !== null
      );

      // Aggregate stats
      const aggregatedStats: DashboardStats = {
        totalProjects: projects.length,
        activeProjects: projects.filter((p: Project) => p.status === 'ACTIVE')
          .length,
        completedProjects: projects.filter(
          (p: Project) => p.status === 'ARCHIVED'
        ).length,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        myTasks: 0, // This would need user-specific data
        overdueTasks: 0, // This would need due date logic
      };

      // Aggregate task counts
      validProgressResults.forEach(result => {
        if (result?.progress?.current) {
          const current = result.progress.current;
          aggregatedStats.totalTasks += current.totalTasks;
          aggregatedStats.completedTasks += current.completedTasks;
          aggregatedStats.inProgressTasks += current.inProgressTasks;
          aggregatedStats.todoTasks += current.todoTasks;
        }
      });

      // Get user-specific task counts by fetching tasks from all projects
      try {
        const userTasksPromises = projects.map(async (project: Project) => {
          try {
            const tasksResponse = await apiClient.get(
              `/projects/${project.id}/tasks`
            );
            return (
              (tasksResponse.data as Array<{
                assigneeId?: string;
                dueDate?: string;
                status?: string;
              }>) || []
            );
          } catch (error) {
            console.warn(
              `Failed to fetch tasks for project ${project.id}:`,
              error
            );
            return [];
          }
        });

        const allTasksArrays = await Promise.all(userTasksPromises);
        const allTasks = allTasksArrays.flat();

        // Filter tasks assigned to current user
        const userTasks = currentUserId
          ? allTasks.filter(
              (task: { assigneeId?: string }) =>
                task.assigneeId === currentUserId
            )
          : allTasks.filter((task: { assigneeId?: string }) => task.assigneeId); // Fallback to all assigned tasks if no user ID

        console.log('Dashboard Debug:', {
          currentUserId,
          totalTasks: allTasks.length,
          userTasks: userTasks.length,
          allTasksSample: allTasks
            .slice(0, 3)
            .map(t => ({ id: t.assigneeId, assigneeId: t.assigneeId })),
        });

        aggregatedStats.myTasks = userTasks.length;

        // Count overdue tasks (assuming tasks have dueDate field)
        const now = new Date();
        aggregatedStats.overdueTasks = userTasks.filter(
          (task: { dueDate?: string; status?: string }) => {
            if (!task.dueDate) return false;
            return new Date(task.dueDate) < now && task.status !== 'COMPLETED';
          }
        ).length;
      } catch (error) {
        console.warn('Failed to fetch user tasks:', error);
        // Keep default values (0) if API call fails
      }

      // Aggregate trend data
      const trendDataMap = new Map<
        string,
        { completionRate: number; completedTasks: number }
      >();

      validProgressResults.forEach(result => {
        if (result?.progress?.trends?.daily) {
          result.progress.trends.daily.forEach((day: DailyTrendData) => {
            const existing = trendDataMap.get(day.date);
            if (existing) {
              existing.completionRate = Math.max(
                existing.completionRate,
                day.completionRate
              );
              existing.completedTasks += day.completedTasks;
            } else {
              trendDataMap.set(day.date, {
                completionRate: day.completionRate,
                completedTasks: day.completedTasks,
              });
            }
          });
        }
      });

      const trendData = Array.from(trendDataMap.entries())
        .map(([date, data]) => ({
          date,
          completionRate: data.completionRate,
          completedTasks: data.completedTasks,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      return {
        aggregatedStats,
        trendData,
      };
    } catch (error) {
      console.error('Failed to fetch aggregated progress data:', error);
      // Fallback to mock data
      return {
        aggregatedStats: {
          totalProjects: 12,
          activeProjects: 8,
          completedProjects: 4,
          totalTasks: 156,
          completedTasks: 89,
          inProgressTasks: 34,
          todoTasks: 33,
          myTasks: 23,
          overdueTasks: 3,
        },
        trendData: [
          { date: '2024-01-01', completionRate: 45, completedTasks: 12 },
          { date: '2024-01-02', completionRate: 52, completedTasks: 18 },
          { date: '2024-01-03', completionRate: 48, completedTasks: 15 },
          { date: '2024-01-04', completionRate: 61, completedTasks: 22 },
          { date: '2024-01-05', completionRate: 58, completedTasks: 20 },
          { date: '2024-01-06', completionRate: 67, completedTasks: 25 },
          { date: '2024-01-07', completionRate: 72, completedTasks: 28 },
        ],
      };
    }
  }

  /**
   * Get team performance metrics (mock data for now)
   * TODO: Replace with real API endpoint when available
   */
  static async getTeamPerformance(): Promise<{
    topPerformers: Array<{
      id: string;
      name: string;
      avatar?: string;
      tasksCompleted: number;
      completionRate: number;
    }>;
    teamVelocity: {
      current: number;
      previous: number;
      trend: 'up' | 'down' | 'stable';
    };
  }> {
    // Mock data - replace with real API call when backend endpoint is ready
    return {
      topPerformers: [
        {
          id: '1',
          name: 'Alice Johnson',
          tasksCompleted: 24,
          completionRate: 96,
        },
        {
          id: '2',
          name: 'Bob Smith',
          tasksCompleted: 18,
          completionRate: 89,
        },
        {
          id: '3',
          name: 'Carol Davis',
          tasksCompleted: 15,
          completionRate: 85,
        },
      ],
      teamVelocity: {
        current: 42,
        previous: 38,
        trend: 'up',
      },
    };
  }
}
