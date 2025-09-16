import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import { TestAppWithRouting } from '../../test/TestAppWithRouting';

// Mock the global tasks search hook used by Tasks page
const mockUseSearchAllUserTasks = vi.fn();
const mockUseCreateTask = vi.fn();

vi.mock('../../hooks/useTasks', async () => {
  const actual = await vi.importActual<typeof import('../../hooks/useTasks')>(
    '../../hooks/useTasks'
  );
  return {
    ...actual,
    useSearchAllUserTasks: () => mockUseSearchAllUserTasks(),
    useCreateTask: () => mockUseCreateTask(),
  };
});

// Mock user and projects hooks used by CreateTaskModal
const mockUseUser = vi.fn();
const mockUseProjects = vi.fn();
const mockUseProjectContributors = vi.fn();

vi.mock('../../hooks/useUser', () => ({
  useUser: () => mockUseUser(),
}));

vi.mock('../../hooks/useProjects', async () => {
  const actual = await vi.importActual<
    typeof import('../../hooks/useProjects')
  >('../../hooks/useProjects');
  return {
    ...actual,
    useProjects: () => mockUseProjects(),
    useProjectContributors: () => mockUseProjectContributors(),
  };
});

// Stub DnD/board mapping hook to avoid animation/listener loops
vi.mock('../../hooks/useTasksKanban', () => ({
  useTasksKanban: () => ({
    items: [],
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
  }),
}));

describe('Tasks page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default mock for tasks search
    mockUseSearchAllUserTasks.mockReturnValue({
      data: {
        tasks: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      error: null,
    });

    // Default mocks for create task modal
    mockUseCreateTask.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseUser.mockReturnValue({
      data: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      },
    });

    mockUseProjects.mockReturnValue({
      data: {
        projects: [
          { id: 'project-1', name: 'Project Alpha' },
          { id: 'project-2', name: 'Project Beta' },
        ],
      },
    });

    mockUseProjectContributors.mockReturnValue({
      data: [
        {
          id: 'contributor-1',
          userId: 'user-1',
          user: { id: 'user-1', name: 'Test User' },
          role: 'ADMIN',
        },
        {
          id: 'contributor-2',
          userId: 'user-2',
          user: { id: 'user-2', name: 'Another User' },
          role: 'WRITE',
        },
      ],
      isLoading: false,
    });
  });

  it('should render title and create task button', async () => {
    render(<TestAppWithRouting url="/tasks" />);

    // Title
    expect(
      await screen.findByRole('heading', { name: /tasks/i })
    ).toBeInTheDocument();

    // Create Task button (accessible name)
    expect(
      screen.getByRole('button', { name: /create task/i })
    ).toBeInTheDocument();
  });

  it('toggles between table and board views', async () => {
    const user = userEvent.setup();
    render(<TestAppWithRouting url="/tasks" />);

    // Default is table view -> table role present
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Switch to board view
    await user.click(screen.getByRole('button', { name: /board view/i }));

    // Table disappears, mocked board appears
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByTestId('kanban-view')).toBeInTheDocument();

    // Switch back to table view
    await user.click(screen.getByRole('button', { name: /table view/i }));

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.queryByTestId('kanban-view')).not.toBeInTheDocument();
  });

  it('persists selected view in localStorage across remounts', async () => {
    const user = userEvent.setup();

    // First mount: switch to board view
    const { unmount } = render(<TestAppWithRouting url="/tasks" />);
    await user.click(screen.getByRole('button', { name: /board view/i }));

    // Assert persisted key written as 'board'
    await waitFor(() =>
      expect(localStorage.getItem('tasks:viewType')).toBe(
        JSON.stringify('board')
      )
    );

    unmount();

    // Remount: should start in board view without clicking
    render(<TestAppWithRouting url="/tasks" />);

    // Mocked board appears by default
    expect(await screen.findByTestId('kanban-view')).toBeInTheDocument();

    // Now switch to table and verify persistence again
    await user.click(screen.getByRole('button', { name: /table view/i }));
    await waitFor(() =>
      expect(localStorage.getItem('tasks:viewType')).toBe(
        JSON.stringify('table')
      )
    );
  });

  it('opens filters and applies query without error', async () => {
    const user = userEvent.setup();
    render(<TestAppWithRouting url="/tasks" />);

    await user.click(screen.getByRole('button', { name: /filters/i }));
    const search = await screen.findByLabelText(/search/i);
    await user.type(search, 'bug');
    await user.click(screen.getByTestId('filters-apply'));

    // Assert the filters header still visible via test id
    expect(
      await screen.findByTestId('filters-form-header')
    ).toBeInTheDocument();
  });

  it('selects rows and shows bulk actions, then clears selection', async () => {
    const user = userEvent.setup();
    mockUseSearchAllUserTasks.mockReturnValue({
      data: {
        tasks: [
          {
            id: 't1',
            title: 'One',
            projectId: 'p1',
            projectName: 'Alpha',
            status: 'TODO',
            priority: 'LOW',
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 't2',
            title: 'Two',
            projectId: 'p2',
            projectName: 'Beta',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            createdAt: '',
            updatedAt: '',
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      error: null,
    });

    render(<TestAppWithRouting url="/tasks" />);

    const checkboxes = await screen.findAllByRole('checkbox');

    await user.click(checkboxes[0]);

    await waitFor(() =>
      expect(screen.getByTestId('bulk-actions')).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: /clear selection/i }));
  });

  it('changes page via pagination link', async () => {
    const user = userEvent.setup();
    const page1 = {
      data: {
        tasks: Array.from({ length: 25 }, (_, i) => ({
          id: `t${i + 1}`,
          title: `Task ${i + 1}`,
          projectId: 'p1',
          projectName: 'Alpha',
          status: 'TODO',
          priority: 'LOW',
          createdAt: '',
          updatedAt: '',
        })),
        total: 25,
        page: 1,
        limit: 20,
        totalPages: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      },
      isLoading: false,
      error: null,
    };
    const page2 = {
      data: {
        ...page1.data,
        page: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
      isLoading: false,
      error: null,
    };

    mockUseSearchAllUserTasks.mockImplementationOnce(() => page1);
    mockUseSearchAllUserTasks.mockImplementation(() => page2);

    render(<TestAppWithRouting url="/tasks" />);

    await user.click(await screen.findByText('2'));
    expect(
      await screen.findByText(/21 to 25 of 25 tasks/i)
    ).toBeInTheDocument();
  });

  describe('Create Task functionality', () => {
    it('opens create task modal when create task button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/tasks" />);

      // Click create task button
      await user.click(screen.getByRole('button', { name: /create task/i }));

      // Modal should open with form fields
      expect(screen.getByTestId('create-task-modal')).toBeInTheDocument();
      expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
      expect(screen.getByTestId('project-select-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('assignee-select-trigger')).toBeInTheDocument();
    });

    it('closes modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/tasks" />);

      // Open modal
      await user.click(screen.getByRole('button', { name: /create task/i }));
      expect(screen.getByTestId('create-task-modal')).toBeInTheDocument();

      // Click cancel
      await user.click(screen.getByTestId('cancel-button'));

      // Modal should close
      expect(screen.queryByTestId('create-task-modal')).not.toBeInTheDocument();
    });

    it('shows project selection dropdown in global mode', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/tasks" />);

      // Open modal
      await user.click(screen.getByRole('button', { name: /create task/i }));

      // Project selector should be visible
      const projectSelect = screen.getByTestId('project-select-trigger');
      expect(projectSelect).toBeInTheDocument();

      // Click to open dropdown
      await user.click(projectSelect);

      // Should show available projects in the dropdown
      expect(
        screen.getByTestId('project-option-project-1')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('project-option-project-2')
      ).toBeInTheDocument();
    });

    it('shows assignee dropdown with contributors when project is selected', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/tasks" />);

      // Open modal
      await user.click(screen.getByRole('button', { name: /create task/i }));

      // Click project dropdown to open it
      await user.click(screen.getByTestId('project-select-trigger'));

      // Click on the project option
      await user.click(screen.getByTestId('project-option-project-1'));

      // Click assignee dropdown
      await user.click(screen.getByTestId('assignee-select-trigger'));

      // Should show contributors
      expect(screen.getByTestId('assignee-option-user-1')).toBeInTheDocument();
      expect(screen.getByTestId('assignee-option-user-2')).toBeInTheDocument();
    });

    it('validates required fields before submission', async () => {
      const user = userEvent.setup();
      render(<TestAppWithRouting url="/tasks" />);

      // Open modal
      await user.click(screen.getByRole('button', { name: /create task/i }));

      // Try to submit without filling required fields
      await user.click(screen.getByTestId('create-task-button'));

      // Should show validation errors
      expect(
        screen.getByText(/task title must be at least 2 characters/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/project is required/i)).toBeInTheDocument();
    });

    it('successfully creates task with valid data', async () => {
      const mockCreateTask = vi.fn().mockResolvedValue({ id: 'new-task-1' });
      mockUseCreateTask.mockReturnValue({
        mutateAsync: mockCreateTask,
        isPending: false,
      });

      const user = userEvent.setup();
      render(<TestAppWithRouting url="/tasks" />);

      // Open modal
      await user.click(screen.getByRole('button', { name: /create task/i }));

      // Fill form
      await user.type(screen.getByTestId('task-title-input'), 'New Test Task');

      // Select project
      await user.click(screen.getByTestId('project-select-trigger'));
      await user.click(screen.getByTestId('project-option-project-1'));

      // Select assignee
      await user.click(screen.getByTestId('assignee-select-trigger'));
      await user.click(screen.getByTestId('assignee-option-user-1'));

      // Submit form
      await user.click(screen.getByTestId('create-task-button'));

      // Should call create task with correct data
      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          projectId: 'project-1',
          data: {
            title: 'New Test Task',
            assigneeId: 'user-1',
            priority: 'MEDIUM',
          },
        });
      });
    });

    it('shows loading state during task creation', async () => {
      const mockCreateTask = vi
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 100))
        );
      mockUseCreateTask.mockReturnValue({
        mutateAsync: mockCreateTask,
        isPending: true,
      });

      const user = userEvent.setup();
      render(<TestAppWithRouting url="/tasks" />);

      // Open modal
      await user.click(screen.getByRole('button', { name: /create task/i }));

      // Fill and submit form
      await user.type(screen.getByTestId('task-title-input'), 'New Test Task');
      await user.click(screen.getByTestId('project-select-trigger'));
      await user.click(screen.getByTestId('project-option-project-1'));
      await user.click(screen.getByTestId('create-task-button'));

      // Should show loading state
      expect(screen.getByTestId('create-task-button')).toBeDisabled();
    });

    it('handles task creation errors gracefully', async () => {
      const mockCreateTask = vi
        .fn()
        .mockRejectedValue(new Error('Creation failed'));
      mockUseCreateTask.mockReturnValue({
        mutateAsync: mockCreateTask,
        isPending: false,
      });

      const user = userEvent.setup();
      render(<TestAppWithRouting url="/tasks" />);

      // Open modal
      await user.click(screen.getByRole('button', { name: /create task/i }));

      // Fill and submit form
      await user.type(screen.getByTestId('task-title-input'), 'New Test Task');
      await user.click(screen.getByTestId('project-select-trigger'));
      await user.click(screen.getByTestId('project-option-project-1'));
      await user.click(screen.getByTestId('create-task-button'));

      // Should handle error (modal stays open, error is shown via toast)
      await waitFor(() => {
        expect(screen.getByTestId('create-task-modal')).toBeInTheDocument();
      });
    });
  });
});
