import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import { TestAppWithRouting } from '../../test/TestAppWithRouting';

// Mock the global tasks search hook used by Tasks page
const mockUseSearchAllUserTasks = vi.fn();

vi.mock('../../hooks/useTasks', async () => {
  const actual = await vi.importActual<typeof import('../../hooks/useTasks')>(
    '../../hooks/useTasks'
  );
  return {
    ...actual,
    useSearchAllUserTasks: () => mockUseSearchAllUserTasks(),
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
    mockUseSearchAllUserTasks.mockReturnValue({
      tasks: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      isLoading: false,
      error: null,
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
});
