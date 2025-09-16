import { render, screen } from '@testing-library/react';
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

describe('Tasks page - smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    // Create Task button (label is hidden on mobile but present on desktop; use accessible name)
    expect(
      screen.getByRole('button', { name: /create task/i })
    ).toBeInTheDocument();
  });
});
