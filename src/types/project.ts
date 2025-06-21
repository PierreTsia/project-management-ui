// Project types
export type Project = {
  id: number;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  dueDate: string;
  teamSize: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectRequest = {
  name: string;
  description: string;
  status: Project['status'];
  priority: Project['priority'];
  startDate: string;
  dueDate: string;
};

export type UpdateProjectRequest = {
  id: number;
} & Partial<CreateProjectRequest>;
