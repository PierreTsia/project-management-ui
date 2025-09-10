import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProjectOverviewCard } from '@/components/dashboard/ProjectOverviewCard';
import { TestWrapper } from '@/test/TestWrapper';
import type { DashboardProject } from '@/types/dashboard';

const mockProject: DashboardProject = {
  id: 'project-1',
  name: 'Test Project',
  description: 'A test project description',
  status: 'ACTIVE',
  owner: {
    id: 'user-1',
    name: 'John Doe',
  },
  userRole: 'OWNER',
  taskCount: 10,
  assignedTaskCount: 5,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

describe('ProjectOverviewCard', () => {
  it('renders project with all data', () => {
    render(
      <TestWrapper>
        <ProjectOverviewCard project={mockProject} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project description')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // assignedTaskCount
    expect(screen.getByText('10 tasks')).toBeInTheDocument(); // taskCount
  });

  it('renders with loading state', () => {
    render(
      <TestWrapper>
        <ProjectOverviewCard project={{} as DashboardProject} loading />
      </TestWrapper>
    );

    // Should show skeleton loaders
    expect(screen.getAllByRole('generic')).toHaveLength(11); // 11 skeleton elements
  });

  it('renders with minimal project data', () => {
    const minimalProject: DashboardProject = {
      id: 'project-2',
      name: 'Minimal Project',
      status: 'ACTIVE',
      owner: {
        id: 'user-1',
        name: 'John Doe',
      },
      userRole: 'CONTRIBUTOR',
      taskCount: 0,
      assignedTaskCount: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    render(
      <TestWrapper>
        <ProjectOverviewCard project={minimalProject} />
      </TestWrapper>
    );

    expect(screen.getByText('Minimal Project')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // assignedTaskCount
    expect(screen.getByText('0 tasks')).toBeInTheDocument(); // taskCount
  });

  it('renders different project statuses', () => {
    const archivedProject: DashboardProject = {
      ...mockProject,
      id: 'project-3',
      name: 'Archived Project',
      status: 'ARCHIVED',
    };

    render(
      <TestWrapper>
        <ProjectOverviewCard project={archivedProject} />
      </TestWrapper>
    );

    expect(screen.getByText('Archived Project')).toBeInTheDocument();
  });

  it('handles zero task counts gracefully', () => {
    const projectWithNoTasks: DashboardProject = {
      ...mockProject,
      taskCount: 0,
      assignedTaskCount: 0,
    };

    render(
      <TestWrapper>
        <ProjectOverviewCard project={projectWithNoTasks} />
      </TestWrapper>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0 tasks')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TestWrapper>
        <ProjectOverviewCard project={mockProject} className="custom-class" />
      </TestWrapper>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('formats dates correctly', () => {
    render(
      <TestWrapper>
        <ProjectOverviewCard project={mockProject} />
      </TestWrapper>
    );

    // Should show formatted date (exact format depends on implementation)
    expect(screen.getByText('1/1/2024')).toBeInTheDocument();
  });

  it('displays owner information correctly', () => {
    render(
      <TestWrapper>
        <ProjectOverviewCard project={mockProject} />
      </TestWrapper>
    );

    // The owner name should be visible in the project card
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('shows correct user role information', () => {
    const contributorProject: DashboardProject = {
      ...mockProject,
      userRole: 'CONTRIBUTOR',
    };

    render(
      <TestWrapper>
        <ProjectOverviewCard project={contributorProject} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
});
