import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProjectOverviewCard } from '@/components/dashboard/ProjectOverviewCard';
import { TestWrapper } from '@/test/TestWrapper';
import type { Project } from '@/types/project';

const mockProject: Project = {
  id: 'project-1',
  name: 'Test Project',
  description: 'A test project description',
  status: 'ACTIVE',
  ownerId: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  contributors: [
    {
      id: 'user-1',

      userId: 'user-1',
      joinedAt: '2024-01-01T00:00:00Z',
      user: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://example.com/avatar1.jpg',
      },
      role: 'OWNER',
    },
    {
      id: 'user-2',
      userId: 'user-2',
      joinedAt: '2024-01-01T00:00:00Z',
      user: {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://example.com/avatar2.jpg',
      },
      role: 'WRITE',
    },
  ],
  completionPercentage: 75,
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
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('2 members')).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    render(
      <TestWrapper>
        <ProjectOverviewCard project={{} as Project} loading />
      </TestWrapper>
    );

    // Should show skeleton loaders
    expect(screen.getAllByRole('generic')).toHaveLength(11); // 11 skeleton elements
  });

  it('renders with minimal project data', () => {
    const minimalProject: Project = {
      id: 'project-2',
      name: 'Minimal Project',
      status: 'ACTIVE',
      ownerId: 'user-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    render(
      <TestWrapper>
        <ProjectOverviewCard project={minimalProject} />
      </TestWrapper>
    );

    expect(screen.getByText('Minimal Project')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0 members')).toBeInTheDocument();
  });

  it('renders different project statuses', () => {
    const archivedProject: Project = {
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

  it('handles missing contributors gracefully', () => {
    const projectWithoutContributors: Project = {
      ...mockProject,
      contributors: [],
    };

    render(
      <TestWrapper>
        <ProjectOverviewCard project={projectWithoutContributors} />
      </TestWrapper>
    );

    expect(screen.getByText('0 members')).toBeInTheDocument();
  });

  it('handles missing completion percentage gracefully', () => {
    const projectWithoutCompletion: Project = {
      ...mockProject,
      completionPercentage: 0,
    };

    render(
      <TestWrapper>
        <ProjectOverviewCard project={projectWithoutCompletion} />
      </TestWrapper>
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders single contributor correctly', () => {
    const singleContributorProject: Project = {
      ...mockProject,
      contributors: [mockProject.contributors![0]],
    };

    render(
      <TestWrapper>
        <ProjectOverviewCard project={singleContributorProject} />
      </TestWrapper>
    );

    expect(screen.getByText('1 members')).toBeInTheDocument();
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
});
