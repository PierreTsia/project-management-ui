import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the hooks before importing the component
vi.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({
    data: {
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
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useReporting', () => ({
  useAllProjectsProgress: () => ({
    data: {
      aggregatedStats: {
        totalProjects: 3,
        activeProjects: 3,
        completedProjects: 0,
        totalTasks: 11,
        completedTasks: 8,
        inProgressTasks: 2,
        todoTasks: 1,
        myTasks: 5,
        overdueTasks: 2,
      },
      trendData: [
        {
          date: '2024-01-01',
          completionRate: 75,
          completedTasks: 8,
        },
      ],
    },
    isLoading: false,
  }),
  useTeamPerformance: () => ({
    data: {
      topPerformers: [
        {
          id: '1',
          name: 'Alice Johnson',
          tasksCompleted: 24,
          completionRate: 95,
        },
        { id: '2', name: 'Bob Smith', tasksCompleted: 18, completionRate: 88 },
        {
          id: '3',
          name: 'Carol Davis',
          tasksCompleted: 15,
          completionRate: 92,
        },
      ],
      averageVelocity: 19,
      velocityTrend: 'up',
    },
    isLoading: false,
  }),
}));

import { TestAppWithRouting } from '../../test/TestAppWithRouting';

describe.skip('Dashboard Page (legacy)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Header Section', () => {
    it('renders dashboard title and welcome message', () => {
      render(<TestAppWithRouting url="/" />);

      expect(
        screen.getByRole('heading', { name: 'Dashboard' })
      ).toBeInTheDocument();
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
      expect(screen.getAllByText('3')).toHaveLength(3); // Should have 3 elements with "3"

      expect(screen.getByText('Active Projects')).toBeInTheDocument();

      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument();

      expect(screen.getByText('My Tasks')).toBeInTheDocument();
      // expect(screen.getByText('2')).toBeInTheDocument();
    });

    it.todo('renders stats cards with loading state');
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

    it.todo('renders charts with loading state');
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

    it.todo('renders empty state when no projects');

    it.todo('renders projects with loading state');
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

    it.todo('renders team velocity data');

    it.todo('renders team performance with loading state');
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
});
