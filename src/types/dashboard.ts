export interface DashboardSummary {
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
}

export interface ActivityItem {
  type: string;
  description: string;
  timestamp: Date;
}

export interface DashboardTask {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
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
}

export interface DashboardProject {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  owner: {
    id: string;
    name: string;
  };
  userRole: string;
  taskCount: number;
  assignedTaskCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardQuery {
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  projectId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  page?: number;
  limit?: number;
}
