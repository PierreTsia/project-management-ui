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

export interface ProjectProgressResult {
  projectId: string;
  projectName: string;
  progress: ProjectProgress;
}

export interface DailyTrendData {
  date: string;
  completionRate: number;
  completedTasks: number;
}

export class ReportingService {
  private static readonly DEFAULT_INCLUDE = 'current,trends,recentActivity';
  private static readonly DEFAULT_DAYS = 30;

  /**
   * Get project progress data
   */
  static async getProjectProgress(
    projectId: string,
    include: string = this.DEFAULT_INCLUDE,
    days: number = this.DEFAULT_DAYS
  ): Promise<ProjectProgress> {
    const response = await apiClient.get(
      `/reporting/projects/${projectId}/progress?include=${include}&days=${days}`
    );
    return response.data;
  }

  /**
   * Get aggregated progress data for all projects
   * Note: This makes N+1 API calls. Consider adding a bulk endpoint.
   */
  static async getAllProjectsProgress(): Promise<{
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
        console.warn('No projects found, returning fallback data');
        return {
          aggregatedStats: {
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            todoTasks: 0,
            myTasks: 0, // No projects = no user tasks
            overdueTasks: 0, // No projects = no overdue tasks
          },
          trendData: [],
        };
      }

      // Get progress data for each project
      const progressPromises = projects.map(async (project: Project) => {
        try {
          const progress = await this.getProjectProgress(project.id, 'current');
          return {
            projectId: project.id,
            projectName: project.name,
            progress,
          };
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
        myTasks: this.getMockUserTasks(projects.length), // Mock until API endpoint exists
        overdueTasks: this.getMockOverdueTasks(projects.length), // Mock until API endpoint exists
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

      // Aggregate trend data
      const trendDataMap = new Map<
        string,
        { completionRate: number; completedTasks: number }
      >();

      validProgressResults.forEach(result => {
        if (result?.progress?.trends?.daily) {
          result.progress.trends.daily.forEach(day => {
            const existing = trendDataMap.get(day.date) || {
              completionRate: 0,
              completedTasks: 0,
            };
            trendDataMap.set(day.date, {
              completionRate: existing.completionRate + day.completionRate,
              completedTasks: existing.completedTasks + day.completedTasks,
            });
          });
        }
      });

      // Convert to array and sort by date
      const trendData = Array.from(trendDataMap.entries())
        .map(([date, data]) => ({
          date,
          completionRate: data.completionRate / validProgressResults.length, // Average completion rate
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

      // Return fallback data
      return {
        aggregatedStats: {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          todoTasks: 0,
          myTasks: 0, // Error fallback
          overdueTasks: 0, // Error fallback
        },
        trendData: [],
      };
    }
  }

  /**
   * Get team performance metrics (mock data until team analytics API exists)
   */
  static async getTeamPerformance(): Promise<{
    topPerformers: Array<{
      id: string;
      name: string;
      tasksCompleted: number;
      completionRate: number;
    }>;
    averageVelocity: number;
    velocityTrend: 'up' | 'down' | 'stable';
  }> {
    // Mock data - replace with real API call when available
    return {
      topPerformers: [
        {
          id: '1',
          name: 'Alice Johnson',
          tasksCompleted: 24,
          completionRate: 95,
        },
        {
          id: '2',
          name: 'Bob Smith',
          tasksCompleted: 18,
          completionRate: 88,
        },
        {
          id: '3',
          name: 'Carol Davis',
          tasksCompleted: 15,
          completionRate: 92,
        },
      ],
      averageVelocity: 19,
      velocityTrend: 'up',
    };
  }

  /**
   * Mock user tasks count (realistic based on project count)
   * TODO: Replace with GET /users/me/tasks endpoint
   */
  private static getMockUserTasks(projectCount: number): number {
    // Realistic mock: user typically has 20-30% of total tasks assigned
    const baseTasks = Math.max(1, Math.floor(projectCount * 2.5));
    return Math.floor(baseTasks * (0.2 + Math.random() * 0.2)); // 20-40% of base
  }

  /**
   * Mock overdue tasks count (realistic based on project count)
   * TODO: Replace with GET /users/me/tasks?overdue=true endpoint
   */
  private static getMockOverdueTasks(projectCount: number): number {
    // Realistic mock: 5-15% of user tasks are overdue
    const userTasks = this.getMockUserTasks(projectCount);
    return Math.floor(userTasks * (0.05 + Math.random() * 0.1)); // 5-15% overdue
  }
}
