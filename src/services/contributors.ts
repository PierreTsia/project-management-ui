import { apiClient } from '@/lib/api-client';
import type {
  ContributorsListResponse,
  ContributorsParams,
  ContributorProjectsResponse,
} from '@/types/contributor';

export class ContributorsService {
  static async getContributors(
    params?: ContributorsParams
  ): Promise<ContributorsListResponse> {
    const response = await apiClient.get('/contributors', { params });
    return response.data;
  }

  static async getContributorProjects(
    userId: string
  ): Promise<ContributorProjectsResponse> {
    const response = await apiClient.get(`/contributors/${userId}/projects`);
    return response.data;
  }
}
