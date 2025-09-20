import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestWrapper } from '@/test/TestWrapper';
import { SmartTaskList } from '../SmartTaskList';
import { createMockTask } from '@/test/mock-factories';
import type { Task } from '@/types/task';

// Mock the useDebounce hook
vi.mock('use-debounce', () => ({
  useDebounce: (value: unknown) => [value],
}));

// Mock the useIntersectionObserver hook
vi.mock('@uidotdev/usehooks', () => ({
  useIntersectionObserver: () => [
    null, // ref
    { isIntersecting: false, entry: null }, // entry
  ],
}));

const renderWithProviders = (ui: React.ReactNode) =>
  render(<TestWrapper>{ui}</TestWrapper>);

describe('SmartTaskList', () => {
  const mockTasks: Task[] = [
    createMockTask({
      id: 'task-1',
      title: 'First Task',
      description: 'First task description',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: '2024-12-31T23:59:59Z',
    }),
    createMockTask({
      id: 'task-2',
      title: 'Second Task',
      description: 'Second task description',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: '2024-12-30T23:59:59Z',
    }),
    createMockTask({
      id: 'task-3',
      title: 'Third Task',
      description: 'Third task description',
      status: 'DONE',
      priority: 'LOW',
    }),
  ];

  const defaultProps = {
    tasks: mockTasks,
    onStatusChange: vi.fn(),
    onDelete: vi.fn(),
    onAssign: vi.fn(),
    onEdit: vi.fn(),
    onCreate: vi.fn(),
    renderItem: (task: Task) => (
      <div key={task.id} data-testid={`task-item-${task.id}`}>
        {task.title}
      </div>
    ),
    ctaLabel: 'Add Task',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task list with all tasks', () => {
    renderWithProviders(<SmartTaskList {...defaultProps} />);

    expect(screen.getByTestId('task-item-task-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-item-task-2')).toBeInTheDocument();
    expect(screen.getByTestId('task-item-task-3')).toBeInTheDocument();
  });

  it('renders empty state when no tasks provided', () => {
    renderWithProviders(<SmartTaskList {...defaultProps} tasks={[]} />);

    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText('Create a first task')).toBeInTheDocument();
  });

  it('renders custom empty message and CTA label', () => {
    renderWithProviders(
      <SmartTaskList
        {...defaultProps}
        tasks={[]}
        emptyMessage="No tasks available"
        emptyCtaLabel="Create Task"
      />
    );

    expect(screen.getByText('No tasks available')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('calls onCreate when empty state CTA is clicked', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    renderWithProviders(
      <SmartTaskList {...defaultProps} tasks={[]} onCreate={onCreate} />
    );

    const createButton = screen.getByText('Create a first task');
    await user.click(createButton);

    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('shows search input when showSearch is true', () => {
    renderWithProviders(<SmartTaskList {...defaultProps} showSearch={true} />);

    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
  });

  it('hides search input when showSearch is false', () => {
    renderWithProviders(<SmartTaskList {...defaultProps} showSearch={false} />);

    expect(
      screen.queryByPlaceholderText('Search tasks...')
    ).not.toBeInTheDocument();
  });

  it('shows sort controls when showSort is true', () => {
    renderWithProviders(<SmartTaskList {...defaultProps} showSort={true} />);

    expect(screen.getByText('Created Newest')).toBeInTheDocument();
  });

  it('hides sort controls when showSort is false', () => {
    renderWithProviders(<SmartTaskList {...defaultProps} showSort={false} />);

    expect(screen.queryByText('Sort by...')).not.toBeInTheDocument();
  });

  it('shows filter controls when showFilters is true', () => {
    renderWithProviders(<SmartTaskList {...defaultProps} showFilters={true} />);

    expect(screen.getByText('All Statuses')).toBeInTheDocument();
    expect(screen.getByText('All Priorities')).toBeInTheDocument();
  });

  it('hides filter controls when showFilters is false', () => {
    renderWithProviders(
      <SmartTaskList {...defaultProps} showFilters={false} />
    );

    expect(screen.queryByText('All Statuses')).not.toBeInTheDocument();
    expect(screen.queryByText('All Priorities')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <SmartTaskList {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
