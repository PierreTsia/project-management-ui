import type { ProjectRole } from '@/types/project';

export type ContributorUser = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
};

export type ContributorProjectPreview = {
  id: string;
  name: string;
  role: ProjectRole;
};

export type ContributorAggregate = {
  user: ContributorUser;
  projectsCount: number;
  projectsPreview: ContributorProjectPreview[];
  roles: ProjectRole[];
};

export type ContributorsListResponse = {
  contributors: ContributorAggregate[];
  total: number;
  page: number;
  limit: number;
};

export type ContributorProjectsResponse = Array<{
  projectId: string;
  name: string;
  role: ProjectRole;
}>;

export type ContributorsParams = {
  q?: string;
  role?: ProjectRole;
  projectId?: string;
  page?: number;
  pageSize?: number;
  sort?: 'name' | 'joinedAt' | 'projectsCount';
  order?: 'asc' | 'desc';
};
