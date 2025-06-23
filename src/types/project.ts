// Corresponds to the ProjectStatus enum in the API
export const PROJECT_STATUSES = ['ACTIVE', 'ARCHIVED'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_ROLES = ['OWNER', 'ADMIN', 'WRITE', 'READ'] as const;

export type ProjectRole = (typeof PROJECT_ROLES)[number];
// This type should match the ProjectResponseDto from the API
export type Project = {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

// This type should match the CreateProjectDto from the API
export type CreateProjectRequest = {
  name: string;
  description?: string;
};

// This type should match the UpdateProjectDto from the API
export type UpdateProjectRequest = {
  name?: string;
  description?: string;
  status?: ProjectStatus;
};

// This type should match the SearchProjectsResponseDto from the API
export type SearchProjectsResponse = {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
};
