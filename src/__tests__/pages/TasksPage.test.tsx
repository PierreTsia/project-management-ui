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
});
