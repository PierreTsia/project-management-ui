import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '../../test/TestAppWithRouting';
import { useProjects } from '../../hooks/useProjects';
import {
  useAllProjectsProgress,
  useTeamPerformance,
} from '../../hooks/useReporting';
import type { SearchProjectsResponse } from '@/types/project';
import type { UseQueryResult } from '@tanstack/react-query';
import type { DashboardStats } from '@/services/reporting';

// Mock the reporting hooks
const mockProgressData = {
  aggregatedStats: {
    totalProjects: 3,
    activeProjects: 3,
    completedProjects: 0,
    totalTasks: 11,
    completedTasks: 4,
    inProgressTasks: 4,
    todoTasks: 3,
    myTasks: 2,
    overdueTasks: 1,
  },
  trendData: [
    { date: '2024-01-01', completionRate: 0, completedTasks: 0 },
    { date: '2024-01-02', completionRate: 25, completedTasks: 5 },
    { date: '2024-01-03', completionRate: 50, completedTasks: 10 },
  ],
};

const mockProjectsData = {
  projects: [
    {
      id: 'project-1',
      name: 'Test Project 1',
      description: 'First test project',
      status: 'ACTIVE',
      ownerId: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      contributors: [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'OWNER',
          avatarUrl: null,
        },
      ],
      completionPercentage: 75,
    },
    {
      id: 'project-2',
      name: 'Test Project 2',
      description: 'Second test project',
      status: 'ACTIVE',
      ownerId: 'user-1',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-16T00:00:00Z',
      contributors: [],
      completionPercentage: 50,
    },
  ],
};

const mockTeamPerformanceData = {
  topPerformers: [
    { id: '1', name: 'Alice Johnson', tasksCompleted: 24, completionRate: 95 },
    { id: '2', name: 'Bob Smith', tasksCompleted: 18, completionRate: 88 },
    { id: '3', name: 'Carol Davis', tasksCompleted: 15, completionRate: 92 },
  ],
  averageVelocity: 19,
  velocityTrend: 'up' as const,
};

// Mock the hooks
vi.mock('../../hooks/useProjects', () => ({
  useProjects: vi.fn(),
}));

vi.mock('../../hooks/useReporting', () => ({
  useAllProjectsProgress: vi.fn(),
  useTeamPerformance: vi.fn(),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Set default mock implementations
    vi.mocked(useProjects).mockReturnValue({
      data: mockProjectsData,
      isLoading: false,
    } as unknown as UseQueryResult<SearchProjectsResponse, Error>);

    vi.mocked(useAllProjectsProgress).mockReturnValue({
      data: mockProgressData,
      isLoading: false,
    } as unknown as UseQueryResult<
      {
        aggregatedStats: DashboardStats;
        trendData: {
          date: string;
          completionRate: number;
          completedTasks: number;
        }[];
      },
      Error
    >);

    vi.mocked(useTeamPerformance).mockReturnValue({
      data: mockTeamPerformanceData,
      isLoading: false,
    } as unknown as UseQueryResult<
      {
        topPerformers: {
          id: string;
          name: string;
          tasksCompleted: number;
          completionRate: number;
        }[];
        averageVelocity: number;
        velocityTrend: 'up' | 'down' | 'stable';
      },
      Error
    >);
  });

  describe('Header Section', () => {
    it('renders dashboard title and welcome message', () => {
      render(<TestAppWithRouting url="/" />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText(
          "Welcome back! Here's what's happening with your projects."
        )
      ).toBeInTheDocument();
    });

    it('renders new project button', () => {
      render(<TestAppWithRouting url="/" />);

      const newProjectButton = screen.getByRole('link', {
        name: /new project/i,
      });
      expect(newProjectButton).toBeInTheDocument();
      expect(newProjectButton).toHaveAttribute('href', '/projects');
    });
  });

  describe('Stats Overview', () => {
    it('renders all stats cards with correct data', () => {
      render(<TestAppWithRouting url="/" />);

      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      expect(screen.getByText('Active Projects')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument();

      expect(screen.getByText('My Tasks')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders stats cards with loading state', () => {
      // Mock loading state
      vi.mocked(useAllProjectsProgress).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as unknown as UseQueryResult<
        {
          aggregatedStats: DashboardStats;
          trendData: {
            date: string;
            completionRate: number;
            completedTasks: number;
          }[];
        },
        Error
      >);

      render(<TestAppWithRouting url="/" />);

      // Should show skeleton loaders
      expect(screen.getAllByRole('generic')).toHaveLength(16); // 4 stats cards * 4 skeletons each
    });
  });

  describe('Charts Section', () => {
    it('renders task completion chart', () => {
      render(<TestAppWithRouting url="/" />);

      expect(screen.getByText('Task Distribution')).toBeInTheDocument();
    });

    it('renders progress trend chart', () => {
      render(<TestAppWithRouting url="/" />);

      expect(screen.getByText('Progress Trend')).toBeInTheDocument();
    });

    it('renders charts with loading state', () => {
      vi.mocked(useAllProjectsProgress).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as unknown as UseQueryResult<
        {
          aggregatedStats: DashboardStats;
          trendData: {
            date: string;
            completionRate: number;
            completedTasks: number;
          }[];
        },
        Error
      >);

      render(<TestAppWithRouting url="/" />);

      // Should show skeleton loaders for charts
      expect(screen.getAllByRole('generic')).toHaveLength(20); // 4 stats * 4 + 2 charts * 2
    });
  });

  describe('Recent Projects Section', () => {
    it('renders recent projects with data', () => {
      render(<TestAppWithRouting url="/" />);

      expect(screen.getByText('Recent Projects')).toBeInTheDocument();
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });

    it('renders view all projects button', () => {
      render(<TestAppWithRouting url="/" />);

      const viewAllButton = screen.getByRole('link', { name: /view all/i });
      expect(viewAllButton).toBeInTheDocument();
      expect(viewAllButton).toHaveAttribute('href', '/projects');
    });

    it('renders empty state when no projects', () => {
      vi.mocked(useProjects).mockReturnValue({
        data: { projects: [] },
        isLoading: false,
      } as unknown as UseQueryResult<SearchProjectsResponse, Error>);

      render(<TestAppWithRouting url="/" />);

      expect(screen.getByText('No projects yet')).toBeInTheDocument();
      expect(
        screen.getByText('Start by creating your first project')
      ).toBeInTheDocument();
    });

    it('renders projects with loading state', () => {
      vi.mocked(useProjects).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as unknown as UseQueryResult<SearchProjectsResponse, Error>);

      render(<TestAppWithRouting url="/" />);

      // Should show skeleton loaders for projects
      expect(screen.getAllByRole('generic')).toHaveLength(20); // 4 stats * 4 + 2 charts * 2
    });
  });

  describe('Team Performance Section', () => {
    it('renders team performance data', () => {
      render(<TestAppWithRouting url="/" />);

      expect(screen.getByText('Team Performance')).toBeInTheDocument();
      expect(screen.getByText('Top Performers')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Carol Davis')).toBeInTheDocument();
    });

    it('renders team velocity data', () => {
      render(<TestAppWithRouting url="/" />);

      expect(screen.getByText('Velocity')).toBeInTheDocument();
      expect(screen.getByText('19')).toBeInTheDocument();
      expect(screen.getByText('tasks per week')).toBeInTheDocument();
    });

    it('renders team performance with loading state', () => {
      vi.mocked(useTeamPerformance).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        refetch: vi.fn(),
        fetchStatus: 'fetching' as const,
        status: 'pending' as const,
      } as unknown as UseQueryResult<
        {
          topPerformers: {
            id: string;
            name: string;
            tasksCompleted: number;
            completionRate: number;
          }[];
          averageVelocity: number;
          velocityTrend: 'up' | 'down' | 'stable';
        },
        Error
      >);
    });

    render(<TestAppWithRouting url="/" />);

    // Should show skeleton loaders
    expect(screen.getAllByRole('generic')).toHaveLength(20); // 4 stats * 4 + 2 charts * 2
  });
});

describe('Quick Actions Section', () => {
  it('renders quick actions', () => {
    render(<TestAppWithRouting url="/" />);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /manage projects/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /view tasks/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /team management/i })
    ).toBeInTheDocument();
  });

  it('has correct links for quick actions', () => {
    render(<TestAppWithRouting url="/" />);

    expect(
      screen.getByRole('link', { name: /manage projects/i })
    ).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: /view tasks/i })).toHaveAttribute(
      'href',
      '/tasks'
    );
    expect(
      screen.getByRole('link', { name: /team management/i })
    ).toHaveAttribute('href', '/team');
  });
});

describe('Responsive Layout', () => {
  it('renders with proper grid layout', () => {
    const { container } = render(<TestAppWithRouting url="/" />);

    // Check for grid classes
    expect(
      container.querySelector(
        '.grid.gap-3.grid-cols-2.md\\:grid-cols-2.lg\\:grid-cols-4'
      )
    ).toBeInTheDocument();
    expect(
      container.querySelector('.grid.gap-6.md\\:grid-cols-2')
    ).toBeInTheDocument();
    expect(
      container.querySelector('.grid.gap-6.lg\\:grid-cols-3')
    ).toBeInTheDocument();
  });
});
