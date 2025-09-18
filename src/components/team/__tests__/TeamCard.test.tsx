import { render, screen } from '@testing-library/react';
import { TeamCard } from '../TeamCard';
import { TestWrapper } from '@/test/TestWrapper';
import type { ContributorAggregate } from '@/types/contributor';
import { describe, it, expect } from 'vitest';

const renderWithProviders = (ui: React.ReactNode) => {
  return render(<TestWrapper>{ui}</TestWrapper>);
};

const mockContributor: ContributorAggregate = {
  user: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  projectsCount: 3,
  roles: ['ADMIN', 'WRITE'],
  projectsPreview: [
    {
      id: 'project-1',
      name: 'Test Project 1',
      role: 'ADMIN',
    },
    {
      id: 'project-2',
      name: 'Test Project 2',
      role: 'WRITE',
    },
    {
      id: 'project-3',
      name: 'Test Project 3',
      role: 'READ',
    },
  ],
};

describe('TeamCard', () => {
  it('renders user information correctly', () => {
    renderWithProviders(<TeamCard contributor={mockContributor} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders project count in footer', () => {
    renderWithProviders(<TeamCard contributor={mockContributor} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders roles count in footer', () => {
    renderWithProviders(<TeamCard contributor={mockContributor} />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('renders project previews as clickable links', () => {
    renderWithProviders(<TeamCard contributor={mockContributor} />);

    const project1Link = screen.getByRole('link', { name: /test project 1/i });
    const project2Link = screen.getByRole('link', { name: /test project 2/i });

    expect(project1Link).toBeInTheDocument();
    expect(project1Link).toHaveAttribute('href', '/projects/project-1');
    expect(project2Link).toBeInTheDocument();
    expect(project2Link).toHaveAttribute('href', '/projects/project-2');
  });

  it('renders role badges for each project', () => {
    renderWithProviders(<TeamCard contributor={mockContributor} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Write')).toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();
  });

  it('shows overflow count when there are more than 5 projects', () => {
    const contributorWithManyProjects = {
      ...mockContributor,
      projectsPreview: Array.from({ length: 7 }, (_, i) => ({
        id: `project-${i + 1}`,
        name: `Project ${i + 1}`,
        role: 'READ' as const,
      })),
    };

    renderWithProviders(<TeamCard contributor={contributorWithManyProjects} />);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('handles user without name gracefully', () => {
    const contributorWithoutName = {
      ...mockContributor,
      user: {
        ...mockContributor.user,
        name: null,
      },
    };

    renderWithProviders(<TeamCard contributor={contributorWithoutName} />);

    // Email appears in both title and subtitle when name is null, so use getAllByText
    expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0);
  });

  it('handles user without avatar gracefully', () => {
    const contributorWithoutAvatar = {
      ...mockContributor,
      user: {
        ...mockContributor.user,
        avatarUrl: null,
      },
    };

    renderWithProviders(<TeamCard contributor={contributorWithoutAvatar} />);

    // Should still render the card without errors
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders card with proper structure', () => {
    renderWithProviders(<TeamCard contributor={mockContributor} />);

    // Verify the main card elements are present
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // projects count
    expect(screen.getByText('2')).toBeInTheDocument(); // roles count
  });

  it('has minimum height for projects section', () => {
    renderWithProviders(<TeamCard contributor={mockContributor} />);

    const projectsSection = screen.getByText('Test Project 1').closest('div');
    expect(projectsSection).toHaveClass('min-h-[80px]');
  });
});
