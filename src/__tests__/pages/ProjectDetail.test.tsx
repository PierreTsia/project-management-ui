import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '../../test/TestAppWithRouting';

const mockProject = {
  id: 'test-project-id',
  name: 'E-commerce Platform',
  description: 'Modern React-based shopping platform',
  status: 'ACTIVE' as const,
  ownerId: 'user1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

const mockContributors = [
  {
    id: 'contrib1',
    userId: 'user1',
    role: 'OWNER' as const,
    joinedAt: '2024-01-01T00:00:00Z',
    user: {
      id: 'user1',
      email: 'owner@example.com',
      name: 'John Owner',
      provider: null,
      providerId: null,
      bio: null,
      dob: null,
      phone: null,
      avatarUrl: 'https://example.com/owner-avatar.jpg',
      isEmailConfirmed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'contrib2',
    userId: 'user2',
    role: 'ADMIN' as const,
    joinedAt: '2024-01-02T00:00:00Z',
    user: {
      id: 'user2',
      email: 'admin@example.com',
      name: 'Jane Admin',
      provider: null,
      providerId: null,
      bio: null,
      dob: null,
      phone: null,
      avatarUrl: 'https://example.com/admin-avatar.jpg',
      isEmailConfirmed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'contrib3',
    userId: 'user3',
    role: 'WRITE' as const,
    joinedAt: '2024-01-03T00:00:00Z',
    user: {
      id: 'user3',
      email: 'writer@example.com',
      name: 'Bob Writer',
      provider: null,
      providerId: null,
      bio: null,
      dob: null,
      phone: null,
      isEmailConfirmed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
];

const mockTasks = [
  {
    id: 'task1',
    title: 'Implement user authentication',
    description: 'Set up login and registration system',
    status: 'TODO' as const,
    priority: 'HIGH' as const,
    dueDate: '2024-02-01T00:00:00Z',
    projectId: 'test-project-id',
    assigneeId: 'user2',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'task2',
    title: 'Design product catalog',
    description: 'Create mockups for product listing page',
    status: 'IN_PROGRESS' as const,
    priority: 'MEDIUM' as const,
    projectId: 'test-project-id',
    assigneeId: 'user3',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'task3',
    title: 'Setup deployment pipeline',
    description: undefined,
    status: 'DONE' as const,
    priority: 'LOW' as const,
    projectId: 'test-project-id',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
];

// Mock the hooks used by ProjectDetail component
const mockUseProject = vi.fn();
const mockUseUpdateProject = vi.fn();
const mockUseDeleteProject = vi.fn();
const mockUseProjectContributors = vi.fn();
const mockUseProjectAttachments = vi.fn();
const mockUseAddContributor = vi.fn();
const mockUseUploadProjectAttachment = vi.fn();
const mockUseDeleteProjectAttachment = vi.fn();

vi.mock('../../hooks/useProjects', () => ({
  useProject: () => mockUseProject(),
  useUpdateProject: () => mockUseUpdateProject(),
  useDeleteProject: () => mockUseDeleteProject(),
  useProjectContributors: () => mockUseProjectContributors(),
  useProjectAttachments: () => mockUseProjectAttachments(),
  useAddContributor: () => mockUseAddContributor(),
  useUploadProjectAttachment: () => mockUseUploadProjectAttachment(),
  useDeleteProjectAttachment: () => mockUseDeleteProjectAttachment(),
}));

const mockUseProjectTasks = vi.fn();
const mockUseUpdateTaskStatus = vi.fn();
const mockUseDeleteTask = vi.fn();
const mockUseCreateTask = vi.fn();

vi.mock('../../hooks/useTasks', () => ({
  useProjectTasks: () => mockUseProjectTasks(),
  useUpdateTaskStatus: () => mockUseUpdateTaskStatus(),
  useDeleteTask: () => mockUseDeleteTask(),
  useCreateTask: () => mockUseCreateTask(),
}));

// Mock react-router-dom to control URL params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-project-id' }),
  };
});

describe('ProjectDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Setup default mocks for all hooks
    mockUseProject.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    mockUseUpdateProject.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseDeleteProject.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseProjectContributors.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    mockUseProjectAttachments.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    mockUseAddContributor.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseProjectTasks.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    mockUseUpdateTaskStatus.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseDeleteTask.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseCreateTask.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  describe('Project Loading & Data Fetching', () => {
    it('should mount the component', () => {
      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should render the loading skeleton when component mounts
      expect(
        screen.getByTestId('project-details-skeleton')
      ).toBeInTheDocument();
    });
    it('should load project data on mount', () => {
      const mockProject = {
        id: 'test-project-id',
        name: 'E-commerce Platform',
        description: 'Modern React-based shopping platform',
        status: 'ACTIVE' as const,
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      // Mock the project data to be loaded
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      // Mock empty contributors, attachments, and tasks for now
      mockUseProjectContributors.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseProjectTasks.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should display the project name in the main heading
      expect(
        screen.getByRole('heading', { name: 'E-commerce Platform' })
      ).toBeInTheDocument();

      // Should display the project description
      expect(
        screen.getByText('Modern React-based shopping platform')
      ).toBeInTheDocument();

      // Should display the project status badge
      const badges = screen.getAllByTestId('project-status-badge');
      badges.forEach(badge => expect(badge).toHaveTextContent('Active'));

      // Should display creation and update dates
      expect(screen.getByText('Created:')).toBeInTheDocument();
      expect(screen.getByText('Updated:')).toBeInTheDocument();

      // Should display properly formatted dates
      expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument(); // Created date
      expect(screen.getByText('Jan 2, 2024')).toBeInTheDocument(); // Updated date

      // Should display back button
      expect(screen.getByText('Back')).toBeInTheDocument();

      // Should not show loading skeleton anymore
      expect(
        screen.queryByTestId('project-details-skeleton')
      ).not.toBeInTheDocument();
    });
    it('should load project contributors', () => {
      // Mock loaded project data
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      // Mock loaded contributors data
      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      // Mock empty attachments and tasks
      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseProjectTasks.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should display the owner section
      expect(screen.getByText('Owner:')).toBeInTheDocument();

      // Should display the contributors section
      expect(screen.getByText('Contributors:')).toBeInTheDocument();

      // Should display the owner avatar
      expect(screen.getByTestId('project-owner-avatar')).toBeInTheDocument();

      // Should display contributor avatars for non-owner contributors
      expect(
        screen.getByTestId('project-contributor-avatar-user2')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('project-contributor-avatar-user3')
      ).toBeInTheDocument();

      // Should display the contributors section with content
      // Since we have 2 non-owner contributors, the empty state should not be shown
      expect(screen.queryByText('No contributors yet')).not.toBeInTheDocument();

      // The "Add" button for empty state should not be present since we have contributors
      expect(screen.queryByText(/Add.*contributor/i)).not.toBeInTheDocument();

      // Should not show loading skeleton
      expect(
        screen.queryByTestId('project-details-skeleton')
      ).not.toBeInTheDocument();
    });
    it('TODO: should load project attachments');
    it('should load project tasks', () => {
      // Mock loaded project data
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      // Mock loaded contributors data
      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      // Mock empty attachments
      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      // Mock loaded tasks data
      mockUseProjectTasks.mockReturnValue({
        data: mockTasks,
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should display the Tasks section heading
      expect(
        screen.getByRole('heading', { name: 'Tasks' })
      ).toBeInTheDocument();

      // Should display all task titles
      expect(
        screen.getByText('Implement user authentication')
      ).toBeInTheDocument();
      expect(screen.getByText('Design product catalog')).toBeInTheDocument();
      expect(screen.getByText('Setup deployment pipeline')).toBeInTheDocument();

      // Should display task descriptions where available
      expect(
        screen.getByText('Set up login and registration system')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Create mockups for product listing page')
      ).toBeInTheDocument();

      // Should display priority badges
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();

      // Should display status dropdowns (checking that Select components are rendered)
      // We have 3 tasks, so we should have 3 status selectors
      const selectTriggers = screen.getAllByRole('combobox');
      expect(selectTriggers).toHaveLength(3);

      // Should not show loading skeleton
      expect(
        screen.queryByTestId('project-details-skeleton')
      ).not.toBeInTheDocument();

      // Should not show empty tasks state
      expect(screen.queryByText('No tasks yet')).not.toBeInTheDocument();
      expect(screen.queryByText('Create a first task')).not.toBeInTheDocument();
    });
    it('should handle project not found error', () => {
      // Mock useProject to return an error state
      mockUseProject.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Project not found'),
      });

      // Mock other hooks to prevent issues
      mockUseProjectContributors.mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      mockUseProjectAttachments.mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      mockUseProjectTasks.mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/nonexistent-id" />);

      // Should display back button even in error state
      expect(screen.getByText('Back')).toBeInTheDocument();

      // Should display error message
      expect(
        screen.getByText('Failed to load project details')
      ).toBeInTheDocument();

      // Should not show loading skeleton
      expect(
        screen.queryByTestId('project-details-skeleton')
      ).not.toBeInTheDocument();

      // Should not show any project content
      expect(
        screen.queryByRole('heading', { name: /E-commerce Platform/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Owner:')).not.toBeInTheDocument();
      expect(screen.queryByText('Contributors:')).not.toBeInTheDocument();
    });
  });

  describe('Project Information Management', () => {
    it('should open edit modal when edit button is clicked', async () => {
      const user = userEvent.setup();

      // Setup mocks for loaded state
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseProjectTasks.mockReturnValue({
        data: mockTasks,
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Wait for project to load
      await screen.findByRole('heading', { name: 'E-commerce Platform' });

      // Open edit modal
      const actionsMenu = screen.getByTestId('project-actions-menu');
      await user.click(actionsMenu);

      const editMenuItem = screen.getByRole('menuitem', { name: 'Edit' });
      await user.click(editMenuItem);

      // Verify modal opens
      const modal = screen.getByTestId('edit-project-modal');
      expect(modal).toBeInTheDocument();
      expect(
        within(modal).getByDisplayValue('E-commerce Platform')
      ).toBeInTheDocument();
      expect(
        within(modal).getByDisplayValue('Modern React-based shopping platform')
      ).toBeInTheDocument();
    });

    it('should successfully update project with valid data', async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({
        ...mockProject,
        name: 'Updated Project Name',
        description: 'Updated description',
      });

      // Setup mocks
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseProjectTasks.mockReturnValue({
        data: mockTasks,
        isLoading: false,
      });

      mockUseUpdateProject.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Wait for project to load
      await screen.findByRole('heading', { name: 'E-commerce Platform' });

      // Open edit modal
      const actionsMenu = screen.getByTestId('project-actions-menu');
      await user.click(actionsMenu);

      const editMenuItem = screen.getByRole('menuitem', { name: 'Edit' });
      await user.click(editMenuItem);

      // Get modal and work within it
      const modal = screen.getByTestId('edit-project-modal');

      // Update project data
      const nameInput = within(modal).getByDisplayValue('E-commerce Platform');
      const descriptionInput = within(modal).getByDisplayValue(
        'Modern React-based shopping platform'
      );

      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Project Name');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Updated description');

      // Submit form
      const saveButton = within(modal).getByTestId('submit-edit-project');
      await user.click(saveButton);

      // Verify API call
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          id: 'test-project-id',
          data: {
            name: 'Updated Project Name',
            description: 'Updated description',
            status: 'ACTIVE',
          },
        });
      });

      // Verify modal closes
      await waitFor(() => {
        expect(
          screen.queryByTestId('edit-project-modal')
        ).not.toBeInTheDocument();
      });
    });

    it('should display error when name is empty', async () => {
      const user = userEvent.setup();

      // Setup mocks
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseProjectTasks.mockReturnValue({
        data: mockTasks,
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Wait for project to load
      await screen.findByRole('heading', { name: 'E-commerce Platform' });

      // Open edit modal
      const actionsMenu = screen.getByTestId('project-actions-menu');
      await user.click(actionsMenu);

      const editMenuItem = screen.getByRole('menuitem', { name: 'Edit' });
      await user.click(editMenuItem);

      // Get modal and work within it
      const modal = screen.getByTestId('edit-project-modal');

      // Clear name field
      const nameInput = within(modal).getByDisplayValue('E-commerce Platform');
      await user.clear(nameInput);

      // Submit form
      const saveButton = within(modal).getByTestId('submit-edit-project');
      await user.click(saveButton);

      // Verify validation error
      await waitFor(() => {
        expect(
          within(modal).getByText('Project name must be at least 2 characters')
        ).toBeInTheDocument();
      });

      // Verify modal stays open
      expect(screen.getByTestId('edit-project-modal')).toBeInTheDocument();
    });

    it('should allow clearing description', async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({
        ...mockProject,
        description: null,
      });

      // Setup mocks
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseProjectTasks.mockReturnValue({
        data: mockTasks,
        isLoading: false,
      });

      mockUseUpdateProject.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Wait for project to load
      await screen.findByRole('heading', { name: 'E-commerce Platform' });

      // Open edit modal
      const actionsMenu = screen.getByTestId('project-actions-menu');
      await user.click(actionsMenu);

      const editMenuItem = screen.getByRole('menuitem', { name: 'Edit' });
      await user.click(editMenuItem);

      // Get modal and work within it
      const modal = screen.getByTestId('edit-project-modal');

      // Clear description field
      const descriptionInput = within(modal).getByDisplayValue(
        'Modern React-based shopping platform'
      );
      await user.clear(descriptionInput);

      // Submit form
      const saveButton = within(modal).getByTestId('submit-edit-project');
      await user.click(saveButton);

      // Verify API call with null description
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          id: 'test-project-id',
          data: {
            name: 'E-commerce Platform',
            description: null,
            status: 'ACTIVE',
          },
        });
      });

      // Verify modal closes
      await waitFor(() => {
        expect(
          screen.queryByTestId('edit-project-modal')
        ).not.toBeInTheDocument();
      });
    });

    it('should handle API error gracefully', async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi
        .fn()
        .mockRejectedValue(new Error('Update failed'));

      // Setup mocks
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseProjectTasks.mockReturnValue({
        data: mockTasks,
        isLoading: false,
      });

      mockUseUpdateProject.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Wait for project to load
      await screen.findByRole('heading', { name: 'E-commerce Platform' });

      // Open edit modal
      const actionsMenu = screen.getByTestId('project-actions-menu');
      await user.click(actionsMenu);

      const editMenuItem = screen.getByRole('menuitem', { name: 'Edit' });
      await user.click(editMenuItem);

      // Get modal and work within it
      const modal = screen.getByTestId('edit-project-modal');

      // Update project data
      const nameInput = within(modal).getByDisplayValue('E-commerce Platform');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Project Name');

      // Submit form
      const saveButton = within(modal).getByTestId('submit-edit-project');
      await user.click(saveButton);

      // Verify API call was made
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });

      // Verify modal stays open (error handling)
      expect(screen.getByTestId('edit-project-modal')).toBeInTheDocument();
    });

    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup();

      // Setup mocks
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseProjectTasks.mockReturnValue({
        data: mockTasks,
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Wait for project to load
      await screen.findByRole('heading', { name: 'E-commerce Platform' });

      // Open edit modal
      const actionsMenu = screen.getByTestId('project-actions-menu');
      await user.click(actionsMenu);

      const editMenuItem = screen.getByRole('menuitem', { name: 'Edit' });
      await user.click(editMenuItem);

      // Verify modal is open
      const modal = screen.getByTestId('edit-project-modal');
      expect(modal).toBeInTheDocument();

      // Click cancel button
      const cancelButton = within(modal).getByTestId('cancel-edit-project');
      await user.click(cancelButton);

      // Verify modal closes
      await waitFor(() => {
        expect(
          screen.queryByTestId('edit-project-modal')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Contributors Management', () => {
    it('should handle empty contributors list', () => {
      // Mock loaded project data
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      // Mock empty contributors data
      mockUseProjectContributors.mockReturnValue({
        data: [],
        isLoading: false,
      });

      // Mock empty attachments
      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      // Mock empty tasks data
      mockUseProjectTasks.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should display the owner section
      expect(screen.getByText('Owner:')).toBeInTheDocument();
      expect(screen.getByTestId('project-owner-avatar')).toBeInTheDocument();

      // Should display the contributors section
      expect(screen.getByText('Contributors:')).toBeInTheDocument();

      // Should show empty contributors state
      expect(screen.getByText('No contributors yet')).toBeInTheDocument();

      // Should show the Add Contributor button
      expect(screen.getByTestId('add-contributor-button')).toBeInTheDocument();
    });

    it('should display existing contributors and allow adding more', () => {
      // Mock loaded project data
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      // Mock contributors data
      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      // Mock empty attachments
      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      // Mock empty tasks data
      mockUseProjectTasks.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should display the owner section
      expect(screen.getByText('Owner:')).toBeInTheDocument();
      expect(screen.getByTestId('project-owner-avatar')).toBeInTheDocument();

      // Should display the contributors section
      expect(screen.getByText('Contributors:')).toBeInTheDocument();

      // Should display contributor avatars
      expect(
        screen.getByTestId('project-contributor-avatar-user2')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('project-contributor-avatar-user3')
      ).toBeInTheDocument();

      // Should still show the Add Contributor button even with existing contributors
      expect(screen.getByTestId('add-contributor-button')).toBeInTheDocument();
    });

    it('should open add contributor modal when Add button is clicked', async () => {
      const user = userEvent.setup();

      // Mock loaded project data
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      // Mock empty contributors data
      mockUseProjectContributors.mockReturnValue({
        data: [],
        isLoading: false,
      });

      // Mock empty attachments
      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      // Mock empty tasks data
      mockUseProjectTasks.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should show the Add Contributor button
      const addButton = screen.getByTestId('add-contributor-button');
      expect(addButton).toBeInTheDocument();

      // Click the Add button
      await user.click(addButton);

      // Should open the modal
      expect(screen.getByText('Add Contributor')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Add a new contributor to this project by entering their email address and selecting a role.'
        )
      ).toBeInTheDocument();

      // Should show form fields
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();

      // Should show action buttons
      expect(screen.getByTestId('cancel-add-contributor')).toBeInTheDocument();
      expect(screen.getByTestId('submit-add-contributor')).toBeInTheDocument();
    });
  });

  describe('Attachments Management', () => {
    it('TODO: should display list of project attachments');
    it('TODO: should handle attachment download/view');
    it('TODO: should open attachment in new tab');
    it('TODO: should handle empty attachments list');
  });

  describe('Tasks Management', () => {
    it('should handle empty tasks list', () => {
      // Mock loaded project data
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      // Mock loaded contributors data
      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      // Mock empty attachments
      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      // Mock empty tasks data
      mockUseProjectTasks.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should display the Tasks section heading
      expect(
        screen.getByRole('heading', { name: 'Tasks' })
      ).toBeInTheDocument();

      // Should show empty tasks state
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      expect(screen.getByText('Create a first task')).toBeInTheDocument();
    });

    it('should update task status (TODO -> IN_PROGRESS -> DONE)', async () => {
      const user = userEvent.setup();
      const mockUpdateTaskStatus = vi.fn().mockResolvedValue({});

      // Mock loaded project data
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      // Mock loaded contributors data
      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      // Mock empty attachments
      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      // Mock tasks data with a TODO task
      const todoTask = {
        id: 'task1',
        title: 'Test Task',
        description: 'A test task',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        projectId: 'test-project-id',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockUseProjectTasks.mockReturnValue({
        data: [todoTask],
        isLoading: false,
      });

      mockUseUpdateTaskStatus.mockReturnValue({
        mutateAsync: mockUpdateTaskStatus,
        isPending: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should display the task
      expect(screen.getByText('Test Task')).toBeInTheDocument();

      // Should show initial TODO status
      expect(screen.getByTestId('task-status-task1')).toHaveTextContent(
        'To Do'
      );

      // Try to interact with the Select component
      // First, find the Select trigger by role
      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();

      // Click to open the dropdown
      await user.click(selectTrigger);

      // Wait for the dropdown to open and look for the "In Progress" option
      // This should work similar to how the logout dropdown works
      const inProgressOption = screen.getByText('In Progress');
      expect(inProgressOption).toBeInTheDocument();

      // Click on "In Progress" to update status
      await user.click(inProgressOption);

      // Should call updateTaskStatus with IN_PROGRESS
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith({
        projectId: 'test-project-id',
        taskId: 'task1',
        data: { status: 'IN_PROGRESS' },
      });
    });
    it('should validate task status transitions', async () => {
      const user = userEvent.setup();
      const mockUpdateTaskStatus = vi.fn().mockResolvedValue({});

      // Mock loaded project data
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      // Mock loaded contributors data
      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });

      // Mock empty attachments
      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseUpdateTaskStatus.mockReturnValue({
        mutateAsync: mockUpdateTaskStatus,
        isPending: false,
      });

      // Create 3 tasks with different statuses
      const tasks = [
        {
          id: 'todo-task',
          title: 'TODO Task',
          description: 'A task in TODO status',
          status: 'TODO' as const,
          priority: 'MEDIUM' as const,
          projectId: 'test-project-id',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'inprogress-task',
          title: 'IN_PROGRESS Task',
          description: 'A task in IN_PROGRESS status',
          status: 'IN_PROGRESS' as const,
          priority: 'MEDIUM' as const,
          projectId: 'test-project-id',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'done-task',
          title: 'DONE Task',
          description: 'A task in DONE status',
          status: 'DONE' as const,
          priority: 'MEDIUM' as const,
          projectId: 'test-project-id',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockUseProjectTasks.mockReturnValue({
        data: tasks,
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should display all tasks
      expect(screen.getByText('TODO Task')).toBeInTheDocument();
      expect(screen.getByText('IN_PROGRESS Task')).toBeInTheDocument();
      expect(screen.getByText('DONE Task')).toBeInTheDocument();

      // Get all select triggers (should be 3)
      const selectTriggers = screen.getAllByRole('combobox');
      expect(selectTriggers).toHaveLength(3);

      // Test TODO task dropdown (first select)
      await user.click(selectTriggers[0]);

      // TODO status should only show TODO and IN_PROGRESS options
      expect(
        screen.getByTestId('task-status-option-todo-task-TODO')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('task-status-option-todo-task-IN_PROGRESS')
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('task-status-option-todo-task-DONE')
      ).not.toBeInTheDocument();

      // Close dropdown by pressing Escape
      await user.keyboard('{Escape}');

      // Test IN_PROGRESS task dropdown (second select)
      await user.click(selectTriggers[1]);

      // IN_PROGRESS status should show TODO, IN_PROGRESS, and DONE options
      expect(
        screen.getByTestId('task-status-option-inprogress-task-TODO')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('task-status-option-inprogress-task-IN_PROGRESS')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('task-status-option-inprogress-task-DONE')
      ).toBeInTheDocument();

      // Close dropdown by pressing Escape
      await user.keyboard('{Escape}');

      // Test DONE task dropdown (third select)
      await user.click(selectTriggers[2]);

      // DONE status should only show IN_PROGRESS and DONE options
      expect(
        screen.queryByTestId('task-status-option-done-task-TODO')
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('task-status-option-done-task-IN_PROGRESS')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('task-status-option-done-task-DONE')
      ).toBeInTheDocument();
    });

    it('TODO: should handle task assignment');
    it('TODO: should handle task editing');
  });
});
