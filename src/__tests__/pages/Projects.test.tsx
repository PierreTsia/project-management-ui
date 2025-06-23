import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestApp } from '../../test/TestApp';
import { ProjectStatus } from '@/types/project';
import type { SearchProjectsResponse } from '@/types/project';
import { Projects } from '@/pages/Projects';

const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

// Mock the useUser hook since it makes API calls (required for ProtectedRoute)
vi.mock('../../hooks/useUser', () => ({
  useUser: () => ({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    isLoading: false,
  }),
}));

// Mock the useProjects hook to control data fetching behavior
const mockUseProjects = vi.fn();
vi.mock('../../hooks/useProjects', () => ({
  useProjects: () => mockUseProjects(),
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

const renderProjectPage = () => {
  return render(
    <TestApp url="/projects">
      <Projects />
    </TestApp>
  );
};

describe('Projects Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('query');
    mockSearchParams.delete('status');
    mockSearchParams.delete('page');
    mockSearchParams.delete('limit');
    localStorage.clear();
  });

  describe('Loading State', () => {
    it('shows skeleton loader while projects are loading', () => {
      mockUseProjects.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderProjectPage();

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

      renderProjectPage();

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

      renderProjectPage();

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

      renderProjectPage();

      await waitFor(() => {
        expect(screen.getByText('No projects found')).toBeInTheDocument();
        expect(
          screen.getByText('Create your first project to get started.')
        ).toBeInTheDocument();
      });
    });

    it('shows no results state when search/filter returns empty', async () => {
      mockSearchParams.set('query', 'test');
      mockSearchParams.set('page', '1');

      mockUseProjects.mockReturnValue({
        data: mockEmptyProjects,
        isLoading: false,
        error: null,
      });

      renderProjectPage();

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

      renderProjectPage();

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
      renderProjectPage();

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('renders status filter dropdown', () => {
      renderProjectPage();

      expect(screen.getByText('All statuses')).toBeInTheDocument();
    });

    it('renders page size selector', () => {
      renderProjectPage();

      expect(screen.getByText('6 per page')).toBeInTheDocument();
    });

    it('updates search input value from URL parameters', () => {
      mockSearchParams.set('query', 'mobile');

      renderProjectPage();

      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('mobile');
    });

    it('updates status filter from URL parameters', () => {
      mockSearchParams.set('status', 'ACTIVE');
      renderProjectPage();

      expect(screen.getByTestId('status-filter')).toHaveTextContent('Active');
    });

    /* it('handles search input changes', async () => {
      const user = userEvent.setup();
      renderProjectPage();

      const searchInput = screen.getByPlaceholderText('Search');
      await user.type(searchInput, 'mobile');

      expect(searchInput).toHaveValue('mobile');
    });

    it('handles status filter changes', async () => {
      const user = userEvent.setup();
      render(<TestApp url="/projects" />);

      const statusFilter = screen.getByText('All Status');
      await user.click(statusFilter);

      // Should show dropdown options
      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Archived')).toBeInTheDocument();
      });
    });

    it('handles page size changes', async () => {
      const user = userEvent.setup();
      render(<TestApp url="/projects" />);

      const pageSizeSelector = screen.getByText('6 per page');
      await user.click(pageSizeSelector);

      // Should show page size options
      await waitFor(() => {
        expect(screen.getByText('3 per page')).toBeInTheDocument();
        expect(screen.getByText('12 per page')).toBeInTheDocument();
        expect(screen.getByText('24 per page')).toBeInTheDocument();
      });
    }); */
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

      renderProjectPage();

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

      renderProjectPage();

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

      renderProjectPage();

      expect(screen.getByText('New Project')).toBeInTheDocument();
    });
  });

  /*   describe('URL State Management', () => {
    it('updates URL when search parameters change', () => {
      // This would test URL parameter synchronization
      // In a real test environment, we'd verify that the URL is updated
      // when filters are applied
      render(
        <TestApp url="/projects?page=2&limit=12&query=mobile&status=ACTIVE" />
      );

      // Verify that the component correctly reads URL parameters
      const searchInput = screen.getByPlaceholderText('Search');
      expect(searchInput).toHaveValue('mobile');
    });
  }); */
});
