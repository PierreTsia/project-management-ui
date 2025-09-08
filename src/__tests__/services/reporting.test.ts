import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReportingService } from '@/services/reporting';
import { apiClient } from '@/lib/api-client';

// Mock the apiClient
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);

describe('ReportingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProjectProgress', () => {
    it('fetches project progress with default parameters', async () => {
      const mockProgress = {
        current: {
          totalTasks: 10,
          completedTasks: 5,
          inProgressTasks: 3,
          todoTasks: 2,
          completionPercentage: 50,
        },
        trends: {
          daily: [
            {
              date: '2024-01-01',
              totalTasks: 10,
              completedTasks: 5,
              newTasks: 2,
              completionRate: 50,
              commentsAdded: 3,
            },
          ],
          weekly: [
            {
              week: '2024-W01',
              totalTasks: 10,
              completedTasks: 5,
              newTasks: 2,
              completionRate: 50,
            },
          ],
        },
        recentActivity: {
          tasksCreated: 2,
          tasksCompleted: 1,
          commentsAdded: 3,
          attachmentsUploaded: 1,
        },
      };

      mockGet.mockResolvedValue({ data: mockProgress });

      const result = await ReportingService.getProjectProgress('project-1');

      expect(mockGet).toHaveBeenCalledWith(
        '/reporting/projects/project-1/progress?include=current,trends,recentActivity&days=30'
      );
      expect(result).toEqual(mockProgress);
    });

    it('fetches project progress with custom parameters', async () => {
      const mockProgress = {
        current: {
          totalTasks: 5,
          completedTasks: 3,
          inProgressTasks: 1,
          todoTasks: 1,
          completionPercentage: 60,
        },
      };

      mockGet.mockResolvedValue({ data: mockProgress });

      const result = await ReportingService.getProjectProgress(
        'project-2',
        'current',
        7
      );

      expect(mockGet).toHaveBeenCalledWith(
        '/reporting/projects/project-2/progress?include=current&days=7'
      );
      expect(result).toEqual(mockProgress);
    });
  });

  describe('getAllProjectsProgress', () => {
    it('returns aggregated data for multiple projects', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          status: 'ACTIVE',
        },
        {
          id: 'project-2',
          name: 'Project 2',
          status: 'ACTIVE',
        },
      ];

      const mockProgress1 = {
        current: {
          totalTasks: 10,
          completedTasks: 5,
          inProgressTasks: 3,
          todoTasks: 2,
          completionPercentage: 50,
        },
        trends: {
          daily: [
            {
              date: '2024-01-01',
              totalTasks: 10,
              completedTasks: 5,
              newTasks: 2,
              completionRate: 50,
              commentsAdded: 3,
            },
          ],
        },
      };

      const mockProgress2 = {
        current: {
          totalTasks: 8,
          completedTasks: 4,
          inProgressTasks: 2,
          todoTasks: 2,
          completionPercentage: 50,
        },
        trends: {
          daily: [
            {
              date: '2024-01-01',
              totalTasks: 8,
              completedTasks: 4,
              newTasks: 1,
              completionRate: 50,
              commentsAdded: 2,
            },
          ],
        },
      };

      mockGet
        .mockResolvedValueOnce({ data: mockProjects })
        .mockResolvedValueOnce({ data: mockProgress1 })
        .mockResolvedValueOnce({ data: mockProgress2 });

      const result = await ReportingService.getAllProjectsProgress();

      expect(result.aggregatedStats).toEqual({
        totalProjects: 2,
        activeProjects: 2,
        completedProjects: 0,
        totalTasks: 18, // 10 + 8
        completedTasks: 9, // 5 + 4
        inProgressTasks: 5, // 3 + 2
        todoTasks: 4, // 2 + 2
        myTasks: expect.any(Number), // Mock value
        overdueTasks: expect.any(Number), // Mock value
      });

      expect(result.trendData).toHaveLength(1);
      expect(result.trendData[0]).toEqual({
        date: '2024-01-01',
        completionRate: 50, // Average of 50 and 50
        completedTasks: 9, // 5 + 4
      });
    });

    it('returns empty data when no projects exist', async () => {
      mockGet.mockResolvedValue({ data: [] });

      const result = await ReportingService.getAllProjectsProgress();

      expect(result.aggregatedStats).toEqual({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        myTasks: 0,
        overdueTasks: 0,
      });

      expect(result.trendData).toEqual([]);
    });

    it('handles API errors gracefully', async () => {
      mockGet.mockRejectedValue(new Error('API Error'));

      const result = await ReportingService.getAllProjectsProgress();

      expect(result.aggregatedStats).toEqual({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        myTasks: 0,
        overdueTasks: 0,
      });

      expect(result.trendData).toEqual([]);
    });

    it('handles individual project progress failures', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project 1', status: 'ACTIVE' },
        { id: 'project-2', name: 'Project 2', status: 'ACTIVE' },
      ];

      const mockProgress1 = {
        current: {
          totalTasks: 10,
          completedTasks: 5,
          inProgressTasks: 3,
          todoTasks: 2,
          completionPercentage: 50,
        },
      };

      mockGet
        .mockResolvedValueOnce({ data: mockProjects })
        .mockResolvedValueOnce({ data: mockProgress1 })
        .mockRejectedValueOnce(new Error('Project 2 error'));

      const result = await ReportingService.getAllProjectsProgress();

      // Should still work with the successful project
      expect(result.aggregatedStats.totalProjects).toBe(2);
      expect(result.aggregatedStats.totalTasks).toBe(10); // Only from project 1
    });
  });

  describe('getTeamPerformance', () => {
    it('returns mock team performance data', async () => {
      const result = await ReportingService.getTeamPerformance();

      expect(result).toEqual({
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
      });
    });
  });

  describe('Mock User Tasks', () => {
    it('generates realistic user tasks based on project count', () => {
      // Test the private method indirectly through getAllProjectsProgress
      const mockProjects = Array.from({ length: 5 }, (_, i) => ({
        id: `project-${i}`,
        name: `Project ${i}`,
        status: 'ACTIVE',
      }));

      // Mock the projects call first, then individual project progress calls
      mockGet.mockResolvedValueOnce({ data: mockProjects }).mockResolvedValue({
        data: {
          current: {
            totalTasks: 10,
            completedTasks: 5,
            inProgressTasks: 3,
            todoTasks: 2,
            completionPercentage: 50,
          },
        },
      });

      return ReportingService.getAllProjectsProgress().then(result => {
        // User tasks should be a realistic number based on project count
        expect(result.aggregatedStats.myTasks).toBeGreaterThan(0);
        expect(result.aggregatedStats.myTasks).toBeLessThan(20); // Reasonable upper bound
      });
    });
  });
});
