import type { TaskStatus } from './task';
import type { TaskPriority } from './task';
import type { ProjectStatus } from './project';

export type DashboardSummary = {
  totalProjects: number;
  activeProjects: number;
  archivedProjects: number;
  totalTasks: number;
  assignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksByStatus: {
    todo: number;
    inProgress: number;
    done: number;
  };
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  completionRate: number;
  averageTasksPerProject: number;
  recentActivity: ActivityItem[];
};

export type ActivityItem = {
  type: string;
  description: string;
  timestamp: Date;
};

export type DashboardTask = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  project: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type DashboardProject = {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  owner: {
    id: string;
    name: string;
  };
  userRole: string;
  taskCount: number;
  assignedTaskCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DashboardQuery = {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  page?: number;
  limit?: number;
};
