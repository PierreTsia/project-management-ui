import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TestWrapper } from '@/test/TestWrapper';
import { TaskTable } from '@/components/tasks/TaskTable';
import type { Task } from '@/types/task';

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
    description: '',
    projectId: 'p2',
    projectName: 'Beta',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    createdAt: '',
    updatedAt: '',
  },
];

const basePagination = {
  page: 1,
  limit: 20,
  total: 2,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

describe('TaskTable', () => {
  it('renders empty state when no tasks', () => {
    const onTaskSelect = vi.fn();
    const onSelectAll = vi.fn();
    const onPageChange = vi.fn();

    renderWithProviders(
      <TaskTable
        tasks={[]}
        pagination={{ ...basePagination, total: 0 }}
        selectedTasks={[]}
        onTaskSelect={onTaskSelect}
        onSelectAll={onSelectAll}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
  });

  it('supports selecting rows and select-all', async () => {
    const user = userEvent.setup();
    const onTaskSelect = vi.fn();
    const onSelectAll = vi.fn();

    renderWithProviders(
      <TaskTable
        tasks={sampleTasks}
        pagination={basePagination}
        selectedTasks={[]}
        onTaskSelect={onTaskSelect}
        onSelectAll={onSelectAll}
        onPageChange={vi.fn()}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    expect(onSelectAll).toHaveBeenCalledWith(true);

    await user.click(checkboxes[1]);
    expect(onTaskSelect).toHaveBeenCalledWith('t1', true);
  });

  it('shows correct decorations: badges, priority icon, due date separator', () => {
    const { container } = renderWithProviders(
      <TaskTable
        tasks={sampleTasks}
        pagination={basePagination}
        selectedTasks={['t2']}
        onTaskSelect={vi.fn()}
        onSelectAll={vi.fn()}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getAllByText(/in progress|todo/i).length).toBeGreaterThan(0);

    // Priority HIGH icon uses red-500 class
    expect(container.querySelector('svg.text-red-500')).toBeTruthy();

    expect(screen.getAllByText(/\w{3} \d{2}/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });
});
