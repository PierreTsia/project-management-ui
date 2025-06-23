import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { TestAppWithRouting } from '../../test/TestAppWithRouting';
import { ProjectStatus } from '@/types/project';
import type { SearchProjectsResponse } from '@/types/project';

// Mock the useProjects hook to control data fetching behavior
const mockUseProjects = vi.fn();
const mockUseCreateProject = vi.fn();
const mockUseProject = vi.fn();

vi.mock('../../hooks/useProjects', () => ({
  useProjects: () => mockUseProjects(),
  useCreateProject: () => mockUseCreateProject(),
  useProject: () => mockUseProject(),
}));

// Mock debounce to make search synchronous in tests
vi.mock('lodash.debounce', () => ({
  default: <T extends (...args: unknown[]) => unknown>(fn: T) => {
    const debounced = (...args: Parameters<T>) => fn(...args);
    debounced.cancel = vi.fn();
    return debounced;
  },
}));

// Mock data
const mockProjects: SearchProjectsResponse = {
  projects: [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Modern React-based shopping platform',
      status: ProjectStatus.ACTIVE,
      ownerId: 'user1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '2',
      name: 'Mobile App',
      description: 'Cross-platform mobile application',
      status: ProjectStatus.ARCHIVED,
      ownerId: 'user2',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  limit: 6,
};

const mockEmptyProjects: SearchProjectsResponse = {
  projects: [],
  total: 0,
  page: 1,
  limit: 6,
};

describe('Projects Page - Proper Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Setup default mock for useCreateProject
    mockUseCreateProject.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    });

    // Setup default mock for useProject (used by breadcrumb)
    mockUseProject.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
  });

  describe('Loading State', () => {
    it('shows skeleton loader while projects are loading', () => {
      mockUseProjects.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<TestAppWithRouting url="/projects" />);

      // Should show skeleton loading cards
      expect(screen.getAllByTestId('project-skeleton')).toHaveLength(6);
    });
  });

  describe('Projects List', () => {
    it('renders projects successfully', async () => {
      mockUseProjects.mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
      });

      render(<TestAppWithRouting url="/projects" />);

      // Should show page header (look for the main page title, not breadcrumb)
      expect(
        screen.getByRole('heading', { name: 'Projects' })
      ).toBeInTheDocument();

      // Should show projects
      await waitFor(() => {
        expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
        expect(screen.getByText('Mobile App')).toBeInTheDocument();
      });

      // Should show project descriptions
      expect(
        screen.getByText('Modern React-based shopping platform')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Cross-platform mobile application')
      ).toBeInTheDocument();

      // Should show results counter
      expect(screen.getByText('Showing 1-2 of 2 results')).toBeInTheDocument();
    });

    it('renders project status badges correctly', async () => {
      mockUseProjects.mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
      });

      render(<TestAppWithRouting url="/projects" />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Archived')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no projects exist', async () => {
      mockUseProjects.mockReturnValue({
        data: mockEmptyProjects,
        isLoading: false,
        error: null,
      });

      render(<TestAppWithRouting url="/projects" />);

      await waitFor(() => {
        expect(screen.getByText('No projects found')).toBeInTheDocument();
        expect(
          screen.getByText('Create your first project to get started.')
        ).toBeInTheDocument();
      });
    });

    it('shows no results state when search/filter returns empty', async () => {
      mockUseProjects.mockReturnValue({
        data: mockEmptyProjects,
        isLoading: false,
        error: null,
      });

      render(<TestAppWithRouting url="/projects?query=test&page=1" />);

      await waitFor(() => {
        expect(
          screen.getByText('No projects match your search')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Try adjusting your search terms or filters.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('shows error message when projects fail to load', async () => {
      mockUseProjects.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      });

      render(<TestAppWithRouting url="/projects" />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
        expect(
          screen.getByText(
            'Please try again or contact support if the problem persists.'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(() => {
      mockUseProjects.mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
      });
    });

    it('renders search input', () => {
      render(<TestAppWithRouting url="/projects" />);

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('renders status filter dropdown', () => {
      render(<TestAppWithRouting url="/projects" />);

      expect(screen.getByText('All statuses')).toBeInTheDocument();
    });

    it('renders page size selector', () => {
      render(<TestAppWithRouting url="/projects" />);

      expect(screen.getByText('6 per page')).toBeInTheDocument();
    });

    it('updates search input value from URL parameters', () => {
      render(<TestAppWithRouting url="/projects?query=mobile" />);

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('mobile');
    });

    it('updates status filter from URL parameters', () => {
      render(<TestAppWithRouting url="/projects?status=ACTIVE" />);

      expect(screen.getByTestId('status-filter')).toHaveTextContent('Active');
    });

    it('handles search input changes', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/projects" />);

      const searchInput = screen.getByPlaceholderText('Search');
      await user.type(searchInput, 'mobile');

      expect(searchInput).toHaveValue('mobile');
    });

    it('renders status filter with correct value from URL', () => {
      render(<TestAppWithRouting url="/projects?status=ARCHIVED" />);

      // Should show the correct status from URL
      expect(screen.getByTestId('status-filter')).toHaveTextContent('Archived');
    });

    it('renders page size selector with correct value', () => {
      render(<TestAppWithRouting url="/projects?limit=12" />);

      // Should show the correct page size from URL
      expect(screen.getByText('12 per page')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('shows pagination when there are multiple pages', async () => {
      const paginatedData: SearchProjectsResponse = {
        ...mockProjects,
        total: 20,
        page: 1,
        limit: 6,
      };

      mockUseProjects.mockReturnValue({
        data: paginatedData,
        isLoading: false,
        error: null,
      });

      render(<TestAppWithRouting url="/projects" />);

      await waitFor(() => {
        expect(
          screen.getByRole('navigation', { name: /pagination/i })
        ).toBeInTheDocument();
      });

      // Should show results counter with correct pagination info
      expect(screen.getByText('Showing 1-6 of 20 results')).toBeInTheDocument();
    });

    it('does not show pagination for single page', async () => {
      mockUseProjects.mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
      });

      render(<TestAppWithRouting url="/projects" />);

      await waitFor(() => {
        expect(
          screen.queryByRole('navigation', { name: /pagination/i })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('New Project Button', () => {
    it('renders new project button', () => {
      mockUseProjects.mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
      });

      render(<TestAppWithRouting url="/projects" />);

      expect(screen.getByText('New Project')).toBeInTheDocument();
    });
  });

  describe('Create Project Modal', () => {
    beforeEach(() => {
      mockUseProjects.mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
      });
    });

    it('opens modal when new project button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/projects" />);

      const newProjectButton = screen.getByText('New Project');
      await user.click(newProjectButton);

      // Modal should be open
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
      expect(
        screen.getByText('Add a new project to your portfolio')
      ).toBeInTheDocument();
    });

    it('renders form fields correctly', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/projects" />);

      const newProjectButton = screen.getByText('New Project');
      await user.click(newProjectButton);

      // Should show form fields
      expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter project name')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter project description (optional)')
      ).toBeInTheDocument();
    });

    it('renders form buttons correctly', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/projects" />);

      const newProjectButton = screen.getByText('New Project');
      await user.click(newProjectButton);

      // Should show buttons
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Create Project' })
      ).toBeInTheDocument();
    });

    it('closes modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/projects" />);

      // Open modal
      const newProjectButton = screen.getByText('New Project');
      await user.click(newProjectButton);
      expect(screen.getByText('Create New Project')).toBeInTheDocument();

      // Close modal
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      // Modal should be closed
      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
    });

    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUseCreateProject.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      render(<TestAppWithRouting url="/projects" />);

      // Open modal
      const newProjectButton = screen.getByText('New Project');
      await user.click(newProjectButton);

      // Fill form
      const nameInput = screen.getByPlaceholderText('Enter project name');
      const descriptionInput = screen.getByPlaceholderText(
        'Enter project description (optional)'
      );

      await user.type(nameInput, 'Test Project');
      await user.type(descriptionInput, 'Test Description');

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: 'Create Project',
      });
      await user.click(submitButton);

      // Should call create project mutation
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Test Project',
        description: 'Test Description',
      });
    });

    it('submits form with only name (description optional)', async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUseCreateProject.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      render(<TestAppWithRouting url="/projects" />);

      // Open modal
      const newProjectButton = screen.getByText('New Project');
      await user.click(newProjectButton);

      // Fill only name
      const nameInput = screen.getByPlaceholderText('Enter project name');
      await user.type(nameInput, 'Test Project');

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: 'Create Project',
      });
      await user.click(submitButton);

      // Should call create project mutation without description
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'Test Project',
      });
    });

    it('shows validation error for empty name', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/projects" />);

      // Open modal
      const newProjectButton = screen.getByText('New Project');
      await user.click(newProjectButton);

      // Try to submit without name
      const submitButton = screen.getByRole('button', {
        name: 'Create Project',
      });
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(
          screen.getByText('Project name is required')
        ).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      mockUseCreateProject.mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true,
        error: null,
      });

      render(<TestAppWithRouting url="/projects" />);

      // Open modal
      const newProjectButton = screen.getByText('New Project');
      await user.click(newProjectButton);

      // Should show loading state
      expect(screen.getByText('Creating...')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Creating...' })
      ).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });

    it('closes modal and resets form after successful submission', async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUseCreateProject.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      render(<TestAppWithRouting url="/projects" />);

      // Open modal
      const newProjectButton = screen.getByText('New Project');
      await user.click(newProjectButton);

      // Fill and submit form
      const nameInput = screen.getByPlaceholderText('Enter project name');
      await user.type(nameInput, 'Test Project');

      const submitButton = screen.getByRole('button', {
        name: 'Create Project',
      });
      await user.click(submitButton);

      // Wait for submission to complete and modal to close
      await waitFor(() => {
        expect(
          screen.queryByText('Create New Project')
        ).not.toBeInTheDocument();
      });

      // If we open the modal again, form should be reset
      await user.click(newProjectButton);
      const nameInputAfterReset =
        screen.getByPlaceholderText('Enter project name');
      expect(nameInputAfterReset).toHaveValue('');
    });
  });
});
