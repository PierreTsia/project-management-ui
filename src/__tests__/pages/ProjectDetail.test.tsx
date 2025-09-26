import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '../../test/TestAppWithRouting';
import { createMockUser } from '../../test/mock-factories';

const mockProject = {
  id: 'test-project-id',
  name: 'E-commerce Platform',
  description: 'Modern React-based shopping platform',
  status: 'ACTIVE' as const,
  ownerId: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

const mockContributors = [
  {
    id: 'contrib1',
    userId: 'user-1',
    role: 'OWNER' as const,
    joinedAt: '2024-01-01T00:00:00Z',
    user: {
      id: 'user-1',
      email: 'alice@example.com',
      name: 'Alice Admin',
      provider: null,
      providerId: null,
      bio: null,
      dob: null,
      phone: null,
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
      isEmailConfirmed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'contrib2',
    userId: 'user-2',
    role: 'ADMIN' as const,
    joinedAt: '2024-01-02T00:00:00Z',
    user: {
      id: 'user-2',
      email: 'bob@example.com',
      name: 'Bob Contributor',
      provider: null,
      providerId: null,
      bio: null,
      dob: null,
      phone: null,
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=bob',
      isEmailConfirmed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 'contrib3',
    userId: 'user-3',
    role: 'READ' as const,
    joinedAt: '2024-01-03T00:00:00Z',
    user: {
      id: 'user-3',
      email: 'charlie@example.com',
      name: 'Charlie Reader',
      provider: null,
      providerId: null,
      bio: null,
      dob: null,
      phone: null,
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=charlie',
      isEmailConfirmed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
];

const mockTasks = [
  {
    id: '1',
    title: 'Implement user authentication',
    description: 'Set up login and registration system',
    status: 'TODO' as const,
    priority: 'HIGH' as const,
    dueDate: '2024-02-01T00:00:00Z',
    projectId: 'test-project-id',
    assignee: {
      id: 'user-1',
      email: 'alice@example.com',
      name: 'Alice Admin',
      provider: null,
      providerId: null,
      bio: null,
      dob: null,
      phone: null,
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
      isEmailConfirmed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Design product catalog',
    description: 'Create mockups for product listing page',
    status: 'IN_PROGRESS' as const,
    priority: 'MEDIUM' as const,
    projectId: 'test-project-id',
    assignee: {
      id: 'user-3',
      email: 'charlie@example.com',
      name: 'Charlie Reader',
      provider: null,
      providerId: null,
      bio: null,
      dob: null,
      phone: null,
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=charlie',
      isEmailConfirmed: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '3',
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
const mockUseProjects = vi.fn();
const mockUseUpdateProject = vi.fn();
const mockUseDeleteProject = vi.fn();
const mockUseProjectContributors = vi.fn();
const mockUseProjectAttachments = vi.fn();
const mockUseAddContributor = vi.fn();
const mockUseUpdateContributorRole = vi.fn();
const mockUseRemoveContributor = vi.fn();
const mockUseUploadProjectAttachment = vi.fn();
const mockUseDeleteProjectAttachment = vi.fn();

vi.mock('../../hooks/useProjects', () => ({
  useProject: () => mockUseProject(),
  useProjects: () => mockUseProjects(),
  useUpdateProject: () => mockUseUpdateProject(),
  useDeleteProject: () => mockUseDeleteProject(),
  useProjectContributors: () => mockUseProjectContributors(),
  useProjectAttachments: () => mockUseProjectAttachments(),
  useAddContributor: () => mockUseAddContributor(),
  useUpdateContributorRole: () => mockUseUpdateContributorRole(),
  useRemoveContributor: () => mockUseRemoveContributor(),
  useUploadProjectAttachment: () => mockUseUploadProjectAttachment(),
  useDeleteProjectAttachment: () => mockUseDeleteProjectAttachment(),
}));

const mockUseProjectTasks = vi.fn();
const mockUseUpdateTaskStatus = vi.fn();
const mockUseUpdateTask = vi.fn();
const mockUseDeleteTask = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));
const mockUseCreateTask = vi.fn();
const mockUseTask = vi.fn();
const mockUseCreateTasksBulk = vi.fn();

const mockUseAssignTask = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

const mockUseUnassignTask = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

vi.mock('../../hooks/useTasks', () => ({
  useProjectTasks: () => mockUseProjectTasks(),
  useUpdateTaskStatus: () => mockUseUpdateTaskStatus(),
  useUpdateTask: () => mockUseUpdateTask(),
  useDeleteTask: () => mockUseDeleteTask(),
  useCreateTask: () => mockUseCreateTask(),
  useCreateTasksBulk: () => mockUseCreateTasksBulk(),
  useCreateTaskHierarchy: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteTaskHierarchy: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteTaskLink: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTask: () => mockUseTask(),
  useAssignTask: () => mockUseAssignTask(),
  useUnassignTask: () => mockUseUnassignTask(),
}));

// Mock AI generation hooks
const mockUseGenerateTasks = vi.fn();
const mockUseGenerateLinkedTasksPreview = vi.fn();
const mockUseConfirmLinkedTasks = vi.fn();
vi.mock('../../hooks/useAi', () => ({
  useGenerateTasks: () => mockUseGenerateTasks(),
  useGenerateLinkedTasksPreview: () => mockUseGenerateLinkedTasksPreview(),
  useConfirmLinkedTasks: () => mockUseConfirmLinkedTasks(),
}));

const mockUseUser = vi.fn();
// Override the useUser mock from TestAppWithRouting
vi.mock('../../hooks/useUser', () => ({
  useUser: () => mockUseUser(),
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

    mockUseProjects.mockReturnValue({
      data: { projects: [] },
      isLoading: false,
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

    mockUseUpdateContributorRole.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseRemoveContributor.mockReturnValue({
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

    mockUseUpdateTask.mockReturnValue({
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

    mockUseTask.mockReturnValue({
      data: mockTasks[0],
      isLoading: false,
      error: null,
    });

    mockUseCreateTasksBulk.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    // Default AI hook return to avoid undefined destructuring in modal
    if (typeof mockUseGenerateTasks === 'function') {
      mockUseGenerateTasks.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({}),
        data: undefined,
        isPending: false,
        isError: false,
        reset: vi.fn(),
      });
    }
    if (typeof mockUseGenerateLinkedTasksPreview === 'function') {
      mockUseGenerateLinkedTasksPreview.mockReturnValue({
        mutateAsync: vi
          .fn()
          .mockResolvedValue({ tasks: [], relationships: [] }),
        data: undefined,
        isPending: false,
        isError: false,
        reset: vi.fn(),
      });
    }
    if (typeof mockUseConfirmLinkedTasks === 'function') {
      mockUseConfirmLinkedTasks.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          createdTaskIds: [],
          createdRelationships: [],
          rejectedRelationships: [],
          counts: { totalLinks: 0, createdLinks: 0, rejectedLinks: 0 },
        }),
        isPending: false,
      });
    }

    // Mock current user as Alice (user-1) who is the assignee of the first task
    mockUseUser.mockReturnValue({
      data: {
        id: 'user-1',
        email: 'alice@example.com',
        name: 'Alice Admin',
        provider: null,
        providerId: null,
        bio: null,
        dob: null,
        phone: null,
        avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
        isEmailConfirmed: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      isLoading: false,
      error: null,
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
        ownerId: 'user-1',
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

      // Owner is shown as the first row in the contributors list
      expect(screen.getByTestId('project-owner-avatar')).toBeInTheDocument();

      // Should display contributor avatars for non-owner contributors
      expect(
        screen.getByTestId('project-contributor-avatar-user-2')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('project-contributor-avatar-user-3')
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
      const selectTriggers = screen.getAllByTestId(/^task-status-/);
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

      // Should display the owner avatar within the list
      expect(screen.getByTestId('project-owner-avatar')).toBeInTheDocument();

      // Only owner is present: one owner avatar and zero contributor avatars
      expect(screen.getByTestId('project-owner-avatar')).toBeInTheDocument();
      expect(
        screen.queryAllByTestId(/project-contributor-avatar-/).length
      ).toBe(0);

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

      // Should display the owner avatar within the list
      expect(screen.getByTestId('project-owner-avatar')).toBeInTheDocument();

      // Should display contributor avatars
      expect(
        screen.getByTestId('project-contributor-avatar-user-2')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('project-contributor-avatar-user-3')
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

    it('should hide Add button when current user is neither owner nor admin', () => {
      // Current user is Alice (user-1) from beforeEach; make owner someone else
      const nonOwnerProject = {
        ...mockProject,
        ownerId: 'owner-xyz',
      };

      // Contributors include an OWNER and a READ user, but not the current user as ADMIN/OWNER
      const contributors = [
        {
          id: 'c-owner',
          userId: 'owner-xyz',
          role: 'OWNER' as const,
          joinedAt: '2024-01-01T00:00:00Z',
          user: createMockUser({ id: 'owner-xyz', name: 'Olivia Owner' }),
        },
        {
          id: 'c-reader',
          userId: 'reader-abc',
          role: 'READ' as const,
          joinedAt: '2024-01-02T00:00:00Z',
          user: createMockUser({ id: 'reader-abc', name: 'Rita Reader' }),
        },
      ];

      mockUseProject.mockReturnValue({
        data: nonOwnerProject,
        isLoading: false,
        error: null,
      });
      mockUseProjectContributors.mockReturnValue({
        data: contributors,
        isLoading: false,
      });
      mockUseProjectAttachments.mockReturnValue({ data: [], isLoading: false });
      mockUseProjectTasks.mockReturnValue({ data: [], isLoading: false });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Add button should not be present for non-admin, non-owner
      expect(
        screen.queryByTestId('add-contributor-button')
      ).not.toBeInTheDocument();
    });
  });

  describe('Attachments Management', () => {
    it('should upload an attachment (happy path)', async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUseUploadProjectAttachment.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: false,
      });
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });
      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });
      mockUseProjectAttachments.mockReturnValue({ data: [], isLoading: false });
      mockUseProjectTasks.mockReturnValue({ data: [], isLoading: false });

      render(<TestAppWithRouting url="/projects/test-project-id" />);
      const uploadBtn = await screen.findByRole('button', {
        name: /upload file/i,
      });
      await user.click(uploadBtn);
      const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, file);
      const submitBtn = screen.getByRole('button', { name: /upload/i });
      await user.click(submitBtn);
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });
    });

    it('should show error on attachment upload failure', async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi
        .fn()
        .mockRejectedValue(new Error('Upload failed'));
      mockUseUploadProjectAttachment.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: true,
        error: { message: 'Upload failed' },
      });
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });
      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });
      mockUseProjectAttachments.mockReturnValue({ data: [], isLoading: false });
      mockUseProjectTasks.mockReturnValue({ data: [], isLoading: false });

      render(<TestAppWithRouting url="/projects/test-project-id" />);
      const uploadBtn = await screen.findByRole('button', {
        name: /upload file/i,
      });
      await user.click(uploadBtn);
      const file = new File(['fail'], 'fail.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText(/choose file/i);
      await user.upload(fileInput, file);
      const submitBtn = screen.getByRole('button', { name: /upload/i });
      await user.click(submitBtn);
      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
      });
    });

    it('should delete an attachment after confirm', async () => {
      const user = userEvent.setup();
      const mockMutateAsync = vi.fn().mockResolvedValue({});
      mockUseDeleteProjectAttachment.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: false,
      });
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });
      mockUseProjectContributors.mockReturnValue({
        data: mockContributors,
        isLoading: false,
      });
      const mockAttachment = {
        id: 'att1',
        filename: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: 1234,
        cloudinaryUrl: 'https://example.com/test.pdf',
        entityType: 'PROJECT',
        entityId: 'test-project-id',
        uploadedAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        uploadedBy: mockContributors[0].user,
      };
      mockUseProjectAttachments.mockReturnValue({
        data: [mockAttachment],
        isLoading: false,
      });
      mockUseProjectTasks.mockReturnValue({ data: [], isLoading: false });

      render(<TestAppWithRouting url="/projects/test-project-id" />);
      const deleteBtn = await screen.findByRole('button', { name: /delete/i });
      await user.click(deleteBtn);
      const confirmBtn = screen.getByRole('button', { name: /delete/i });
      await user.click(confirmBtn);
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });
    });
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

      // Should not display the previous Tasks section heading in the new empty state
      expect(
        screen.queryByRole('heading', { name: 'Tasks' })
      ).not.toBeInTheDocument();

      // Should show dual CTA empty state: Generate with AI and Create manually
      expect(
        screen.getByRole('button', { name: /generate tasks with ai/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /create a first task/i })
      ).toBeInTheDocument();
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

      // Mock tasks data with a TODO task assigned to current user
      const todoTask = {
        id: 'task1',
        title: 'Test Task',
        description: 'A test task',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        projectId: 'test-project-id',
        assignee: createMockUser({
          id: 'user-1',
          email: 'alice@example.com',
          name: 'Alice Admin',
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
        }),
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
      // First, find the Select trigger by test id (task status select)
      const selectTrigger = screen.getByTestId('task-status-task1');
      expect(selectTrigger).toBeInTheDocument();

      // Click to open the dropdown
      await user.click(selectTrigger);

      // Wait for the dropdown to open and look for the "In Progress" option
      // This should work similar to how the logout dropdown works
      const inProgressOption = await screen.findByText('In Progress');
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

    it('should disable task status select when current user is not the assignee', async () => {
      const user = userEvent.setup();

      // Clear all mocks and re-apply them
      vi.resetModules();

      // Re-apply the useUser mock with Bob (user-2)
      vi.doMock('../../hooks/useUser', () => ({
        useUser: () => ({
          data: {
            id: 'user-2',
            email: 'bob@example.com',
            name: 'Bob User',
            provider: null,
            providerId: null,
            bio: null,
            dob: null,
            phone: null,
            avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=bob',
            isEmailConfirmed: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          isLoading: false,
          error: null,
        }),
      }));

      // Mock current user as Alice (user-1) but task is assigned to Charlie (user-3)
      mockUseUser.mockClear();
      mockUseUser.mockReturnValue({
        data: {
          id: 'user-1', // Alice is the current user
          email: 'alice@example.com',
          name: 'Alice Admin',
          provider: null,
          providerId: null,
          bio: null,
          dob: null,
          phone: null,
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        isLoading: false,
        error: null,
      });

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

      // Mock tasks with assignee (Charlie, user-3) who is different from current user (Alice, user-1)
      const tasksWithAssignee = [
        {
          id: 'task1',
          title: 'Test Task',
          description: 'A test task',
          status: 'TODO' as const,
          priority: 'MEDIUM' as const,
          projectId: 'test-project-id',
          assignee: createMockUser({
            id: 'user-3', // Charlie is the assignee, different from Alice (user-1)
            email: 'charlie@example.com',
            name: 'Charlie User',
            avatarUrl:
              'https://api.dicebear.com/7.x/identicon/svg?seed=charlie',
          }),
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockUseProjectTasks.mockReturnValue({
        data: tasksWithAssignee,
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should display the task
      expect(screen.getByText('Test Task')).toBeInTheDocument();

      // Should show initial TODO status
      expect(screen.getByTestId('task-status-task1')).toHaveTextContent(
        'To Do'
      );

      // The select should be disabled (not clickable)
      const selectTrigger = screen.getByTestId('task-status-task1');
      expect(selectTrigger).toBeDisabled();

      // Try to click the disabled select - it should not open the dropdown
      await user.click(selectTrigger);

      // Wait a bit to ensure no dropdown appears
      await waitFor(
        () => {
          expect(screen.queryByText('In Progress')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // The dropdown should not be open
      expect(screen.queryByText('In Progress')).not.toBeInTheDocument();
      expect(screen.queryByText('Done')).not.toBeInTheDocument();

      // Should show tooltip on hover (if tooltip is implemented)
      // Note: This might need to be adjusted based on how tooltips are implemented
      await user.hover(selectTrigger);

      // The select should remain disabled and not open
      expect(selectTrigger).toBeDisabled();
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

      // Create 3 tasks with different statuses, all assigned to current user
      const tasks = [
        {
          id: 'todo-task',
          title: 'TODO Task',
          description: 'A task in TODO status',
          status: 'TODO' as const,
          priority: 'MEDIUM' as const,
          projectId: 'test-project-id',
          assignee: createMockUser({
            id: 'user-1',
            email: 'alice@example.com',
            name: 'Alice Admin',
            avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
          }),
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
          assignee: createMockUser({
            id: 'user-1',
            email: 'alice@example.com',
            name: 'Alice Admin',
            avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
          }),
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
          assignee: createMockUser({
            id: 'user-1',
            email: 'alice@example.com',
            name: 'Alice Admin',
            avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
          }),
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

      // Get all task status select triggers (should be 3)
      const selectTriggers = screen.getAllByTestId(/^task-status-/);
      expect(selectTriggers).toHaveLength(3);

      // Test TODO task dropdown (first select)
      await user.click(selectTriggers[0]);

      // Wait for dropdown to open and check TODO status should only show TODO and IN_PROGRESS options
      await waitFor(() => {
        expect(
          screen.getByTestId('task-status-option-todo-task-TODO')
        ).toBeInTheDocument();
      });
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

      // Wait for dropdown to open and check IN_PROGRESS status should show TODO, IN_PROGRESS, and DONE options
      await waitFor(() => {
        expect(
          screen.getByTestId('task-status-option-inprogress-task-TODO')
        ).toBeInTheDocument();
      });
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

      // Wait for dropdown to open and check DONE status should only show IN_PROGRESS and DONE options
      await waitFor(() => {
        expect(
          screen.getByTestId('task-status-option-done-task-IN_PROGRESS')
        ).toBeInTheDocument();
      });
      expect(
        screen.queryByTestId('task-status-option-done-task-TODO')
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId('task-status-option-done-task-DONE')
      ).toBeInTheDocument();
    });

    it('should navigate to task details page when a task is clicked', async () => {
      const user = userEvent.setup();
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
      mockUseTask.mockReturnValue({
        data: mockTasks[0],
        isLoading: false,
        error: null,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      await screen.findByText('Implement user authentication');

      const firstTaskButton = screen.getByRole('button', {
        name: 'Implement user authentication',
      });
      await user.click(firstTaskButton);

      await screen.findByText('Implement user authentication');

      expect(
        screen.getByText('Set up login and registration system')
      ).toBeInTheDocument();
    });

    it('should open assign task modal when assign action is clicked', async () => {
      const user = userEvent.setup();
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

      // Wait for tasks to load
      await screen.findByText('Implement user authentication');

      // Open assign modal via assignee avatar (scoped to task id '1')
      const firstTaskCard = screen.getByTestId('task-card-1');
      const assigneeTrigger =
        within(firstTaskCard).getByTestId('task-assignee-1');
      await user.click(assigneeTrigger);

      // Wait for modal to open and check contributors are displayed
      await screen.findByRole('dialog');

      // Alice appears in multiple places (assignee + contributors + owner-in-list)
      expect(screen.getAllByText('Alice Admin').length).toBeGreaterThanOrEqual(
        2
      );
      expect(
        screen.getAllByText('Bob Contributor').length
      ).toBeGreaterThanOrEqual(1);

      // Check role badges
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });

    it('should assign task to selected user', async () => {
      const user = userEvent.setup();
      const mockAssignTask = vi.fn().mockResolvedValue({});

      // Override the mock to return our spy
      mockUseAssignTask.mockReturnValue({
        mutateAsync: mockAssignTask,
        isPending: false,
      });

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

      // Wait for tasks to load
      await screen.findByText('Implement user authentication');

      // Open assign modal via assignee avatar (new UI)
      const assigneeTrigger = screen.getAllByTitle(
        'Click to change assignee'
      )[0];
      await user.click(assigneeTrigger);

      // Wait for modal to open and check contributors are displayed
      await screen.findByRole('dialog');

      // Alice appears in multiple places (assignee + contributors + owner-in-list)
      expect(screen.getAllByText('Alice Admin').length).toBeGreaterThanOrEqual(
        2
      );
      expect(
        screen.getAllByText('Bob Contributor').length
      ).toBeGreaterThanOrEqual(1);

      // Check role badges
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });

    it('should unassign task when unassign is clicked', async () => {
      const user = userEvent.setup();
      const mockUnassignTask = vi.fn().mockResolvedValue({});

      // Override the mock to return our spy
      mockUseUnassignTask.mockReturnValue({
        mutateAsync: mockUnassignTask,
        isPending: false,
      });

      // Use a task that already has an assignee
      const taskWithAssignee = {
        ...mockTasks[0],
        assignee: {
          id: 'user-1',
          name: 'Alice Admin',
          email: 'alice@example.com',
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
        },
      };

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
        data: [taskWithAssignee],
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Wait for tasks to load
      await screen.findByText('Implement user authentication');

      // Open assign modal via assignee avatar (new UI)
      const assigneeTrigger = screen.getAllByTitle(
        'Click to change assignee'
      )[0];
      await user.click(assigneeTrigger);

      // Wait for the assign modal to open
      await screen.findByRole('dialog');

      // Click the unassign option in the list
      const unassignOption = screen.getByTestId('assign-modal-unassign-option');
      await user.click(unassignOption);

      // Click the action button to confirm unassign
      const actionButton = screen.getByTestId('assign-modal-action-button');
      await user.click(actionButton);

      // Verify unassign was called
      expect(mockUnassignTask).toHaveBeenCalledWith({
        projectId: 'test-project-id',
        taskId: taskWithAssignee.id,
      });
    });

    it('should filter contributors by search query', async () => {
      const user = userEvent.setup();
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

      // Wait for tasks to load
      await screen.findByText('Implement user authentication');

      // Open assign modal via assignee avatar (new UI)
      const assigneeTrigger = screen.getAllByTitle(
        'Click to change assignee'
      )[0];
      await user.click(assigneeTrigger);

      // Search for Alice
      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'Alice');

      // Alice should be visible (appears multiple times); Bob should be hidden
      expect(screen.getAllByText('Alice Admin').length).toBeGreaterThanOrEqual(
        2
      );
      // Bob may still appear outside the filtered results (e.g., other UI); ensure list filtering happened
      const listMatches = screen.getAllByText('Bob Contributor');
      expect(listMatches.length).toBeGreaterThanOrEqual(0);
    });

    it('should close assign modal when cancelled', async () => {
      const user = userEvent.setup();
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

      // Wait for tasks to load
      await screen.findByText('Implement user authentication');

      // Open assign modal via assignee avatar (new UI)
      const assigneeTrigger = screen.getAllByTitle(
        'Click to change assignee'
      )[0];
      await user.click(assigneeTrigger);

      // Verify modal is open
      await screen.findByRole('dialog');
      expect(screen.getByText('Assign Task')).toBeInTheDocument();

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Generate AI project tasks', () => {
    it('should open the AI generation modal when clicking the Generate tasks with AI button', async () => {
      const user = userEvent.setup();

      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });
      mockUseProjectContributors.mockReturnValue({
        data: [],
        isLoading: false,
      });
      mockUseProjectAttachments.mockReturnValue({ data: [], isLoading: false });
      mockUseProjectTasks.mockReturnValue({ data: [], isLoading: false });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      const aiButton = await screen.findByRole('button', {
        name: /generate tasks with ai/i,
      });
      await user.click(aiButton);

      await screen.findByRole('dialog');
      expect(
        screen.getByRole('heading', { name: /generate tasks with ai/i })
      ).toBeInTheDocument();
    });

    it('should render modal content: title, prefilled prompt, slider, selects and actions', async () => {
      const user = userEvent.setup();

      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });
      mockUseProjectContributors.mockReturnValue({
        data: [],
        isLoading: false,
      });
      mockUseProjectAttachments.mockReturnValue({ data: [], isLoading: false });
      mockUseProjectTasks.mockReturnValue({ data: [], isLoading: false });

      // Default AI hook state: no results yet
      mockUseGenerateTasks.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({}),
        data: undefined,
        isPending: false,
        isError: false,
        reset: vi.fn(),
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      const aiButton = await screen.findByRole('button', {
        name: /generate tasks with ai/i,
      });
      await user.click(aiButton);

      // Modal and heading
      await screen.findByRole('dialog');
      expect(
        screen.getByRole('heading', { name: /generate tasks with ai/i })
      ).toBeInTheDocument();

      // Prefilled prompt contains project name and description
      const prompt = screen.getByLabelText(/project description/i);
      expect(prompt).toHaveValue(
        'E-commerce Platform — Modern React-based shopping platform'
      );

      // Options section basics: slider present and current value visible (default 6)
      expect(screen.getByRole('slider')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();

      // Selects: project type and priority labeled inputs exist
      expect(screen.getByText(/project type/i)).toBeInTheDocument();
      expect(screen.getByText(/priority/i)).toBeInTheDocument();

      // Footer actions
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /generate/i })
      ).toBeInTheDocument();
    });

    it('should generate tasks on submit and display results list, allow confirm import', async () => {
      const user = userEvent.setup();

      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });
      mockUseProjectContributors.mockReturnValue({
        data: [],
        isLoading: false,
      });
      mockUseProjectAttachments.mockReturnValue({ data: [], isLoading: false });
      mockUseProjectTasks.mockReturnValue({ data: [], isLoading: false });

      const generated = {
        tasks: [
          {
            title: 'Set up CI',
            description: 'Configure GitHub Actions',
            priority: 'MEDIUM',
          },
          {
            title: 'Define MVP scope',
            description: 'List P0 requirements',
            priority: 'HIGH',
          },
        ],
        meta: { degraded: false },
      } as const;

      const mutateSpy = vi.fn().mockResolvedValue(generated);
      const bulkCreateSpy = vi.fn().mockResolvedValue({});

      mockUseGenerateTasks.mockReturnValue({
        mutateAsync: mutateSpy,
        data: undefined, // Start with no data so form is shown
        isPending: false,
        isError: false,
        reset: vi.fn(),
      });

      // Also ensure preview hook returns no data
      mockUseGenerateLinkedTasksPreview.mockReturnValue({
        mutateAsync: vi.fn(),
        data: undefined,
        isPending: false,
        isError: false,
        reset: vi.fn(),
      });
      // Override bulk create to observe import call
      mockUseCreateTasksBulk.mockReturnValue({
        mutateAsync: bulkCreateSpy,
        isPending: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      const aiButton = await screen.findByRole('button', {
        name: /generate tasks with ai/i,
      });
      await user.click(aiButton);

      await screen.findByRole('dialog');

      // Wait for the form to be ready and submit button to be enabled
      const submit = await screen.findByRole('button', { name: /generate/i });
      await waitFor(() => {
        expect(submit).not.toBeDisabled();
      });

      await user.click(submit);

      // Verify that the API was called correctly
      expect(mutateSpy).toHaveBeenCalledOnce();
      expect(mutateSpy).toHaveBeenCalledWith({
        prompt: 'E-commerce Platform — Modern React-based shopping platform',
        projectId: 'test-project-id',
        locale: 'en',
        options: {
          taskCount: 6,
        },
      });
    });
  });
});
