import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestWrapper } from '@/test/TestWrapper';
import { TaskDataTable } from '@/components/tasks/datatable/TaskDataTable';
import type { GlobalSearchTasksResponse, Task } from '@/types/task';

vi.mock('@/hooks/useTasks', async orig => {
  const mod = (await orig()) as unknown as Record<string, unknown>;
  return {
    ...mod,
    useSearchAllUserTasks: vi.fn(),
  } as Record<string, unknown>;
});

const { useSearchAllUserTasks } = await import('@/hooks/useTasks');

const renderWithProviders = (ui: React.ReactNode) =>
  render(<TestWrapper>{ui}</TestWrapper>);

const sampleTasks: Task[] = [
  {
    id: 't1',
    title: 'Fix bug',
    description: 'Null crash',
    projectId: 'p1',
    projectName: 'Alpha',
    status: 'TODO',
    priority: 'HIGH',
    assignee: {
      id: 'u1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      provider: null,
      providerId: null,
      bio: null,
      dob: null,
      phone: null,
      isEmailConfirmed: true,
      createdAt: '',
      updatedAt: '',
    },
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 't2',
    title: 'Write docs',
    projectId: 'p2',
    projectName: 'Beta',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    createdAt: '',
    updatedAt: '',
  },
];

const makeResponse = (tasks: Task[]): GlobalSearchTasksResponse => ({
  tasks,
  total: tasks.length,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
});

describe('TaskDataTable', () => {
  beforeEach(() => {
    vi.mocked(useSearchAllUserTasks).mockReturnValue({
      data: makeResponse(sampleTasks),
      isLoading: false,
      isFetching: false,
    } as unknown as ReturnType<typeof useSearchAllUserTasks>);
  });

  it('renders rows and translated headers', () => {
    renderWithProviders(<TaskDataTable />);
    // headers (translated by keys) — check presence of known labels
    expect(
      screen.getByRole('columnheader', { name: /title|titre/i })
    ).toBeTruthy();
    expect(
      screen.getByRole('columnheader', { name: /project|projets/i })
    ).toBeTruthy();
    // rows
    const body = screen.getByRole('table');
    expect(within(body).getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('renders empty state when no tasks', () => {
    vi.mocked(useSearchAllUserTasks).mockReturnValue({
      data: makeResponse([]),
      isLoading: false,
      isFetching: false,
    } as unknown as ReturnType<typeof useSearchAllUserTasks>);

    renderWithProviders(<TaskDataTable />);
    expect(screen.getByText(/no results|aucun résultat/i)).toBeInTheDocument();
  });

  it('shows bulk actions when selecting rows', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskDataTable />);
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);
    expect(await screen.findByTestId('bulk-actions')).toBeInTheDocument();
  });
});
