import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestWrapper } from '@/test/TestWrapper';
import { TaskCard } from '../TaskCard';
import { createMockTask, createMockUser } from '@/test/mock-factories';

// Mock the useDeleteTask hook
const mockDeleteTask = vi.fn();
vi.mock('@/hooks/useTasks', () => ({
  useDeleteTask: () => ({
    mutateAsync: mockDeleteTask,
    isPending: false,
  }),
}));

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithProviders = (ui: React.ReactNode) =>
  render(<TestWrapper>{ui}</TestWrapper>);

describe('TaskCard', () => {
  const mockTask = createMockTask({
    id: 'task-1',
    title: 'Test Task',
    description: 'Test description',
    status: 'TODO',
    priority: 'HIGH',
  });

  const defaultProps = {
    task: mockTask,
    onStatusChange: vi.fn(),
    onOpenAssignModal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task information correctly', () => {
    renderWithProviders(<TaskCard {...defaultProps} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    // Test the real StatusSelect component
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles status change', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    renderWithProviders(
      <TaskCard {...defaultProps} onStatusChange={onStatusChange} />
    );

    // Test the real StatusSelect component
    const statusSelect = screen.getByRole('combobox');
    await user.click(statusSelect);
    await user.click(screen.getByText('In Progress'));

    expect(onStatusChange).toHaveBeenCalledWith('IN_PROGRESS');
  });

  it('handles task deletion', async () => {
    const user = userEvent.setup();
    mockDeleteTask.mockResolvedValue(undefined);

    renderWithProviders(<TaskCard {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith({
        projectId: mockTask.projectId,
        taskId: mockTask.id,
      });
    });
  });

  it('handles deletion error', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Delete failed');
    mockDeleteTask.mockRejectedValue(mockError);

    renderWithProviders(<TaskCard {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalled();
    });
  });

  it('shows assignee avatar when task has assignee', () => {
    const taskWithAssignee = {
      ...mockTask,
      assignee: createMockUser({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      }),
    };

    renderWithProviders(<TaskCard {...defaultProps} task={taskWithAssignee} />);

    // Test the real AssigneeAvatar component - it shows initials, not full name
    expect(screen.getByTitle('John Doe')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('shows unassigned when task has no assignee', () => {
    const { assignee: _, ...taskWithoutAssignee } = mockTask;

    renderWithProviders(
      <TaskCard {...defaultProps} task={taskWithoutAssignee} />
    );

    // Test the real AssigneeAvatar component - it shows "U" for unassigned
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('handles assignee click to open assign modal', async () => {
    const user = userEvent.setup();
    const onOpenAssignModal = vi.fn();
    const taskWithAssignee = {
      ...mockTask,
      assignee: createMockUser({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      }),
    };

    renderWithProviders(
      <TaskCard
        {...defaultProps}
        task={taskWithAssignee}
        onOpenAssignModal={onOpenAssignModal}
      />
    );

    // Test the real AssigneeAvatar component - click on the avatar container
    const assigneeAvatar = screen.getByTitle('John Doe');
    await user.click(assigneeAvatar);

    expect(onOpenAssignModal).toHaveBeenCalledWith(mockTask.id);
  });

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <TaskCard {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays correct priority labels', () => {
    const highPriorityTask = { ...mockTask, priority: 'HIGH' as const };
    const mediumPriorityTask = { ...mockTask, priority: 'MEDIUM' as const };
    const lowPriorityTask = { ...mockTask, priority: 'LOW' as const };

    const { rerender } = renderWithProviders(
      <TaskCard {...defaultProps} task={highPriorityTask} />
    );
    expect(screen.getByText('High')).toBeInTheDocument();

    rerender(<TaskCard {...defaultProps} task={mediumPriorityTask} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    rerender(<TaskCard {...defaultProps} task={lowPriorityTask} />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('displays due date when present', () => {
    const taskWithDueDate = {
      ...mockTask,
      dueDate: '2024-12-31T23:59:59Z',
    };

    renderWithProviders(<TaskCard {...defaultProps} task={taskWithDueDate} />);

    // The due date should be formatted and displayed - check for the date pattern
    // This is more robust across different timezones
    expect(screen.getByText(/Due/)).toBeInTheDocument();
    expect(screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/)).toBeInTheDocument();
  });

  it('handles click events properly', async () => {
    const user = userEvent.setup();
    mockDeleteTask.mockResolvedValue(undefined);

    renderWithProviders(<TaskCard {...defaultProps} />);

    // Click delete button should not trigger parent click
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteTask).toHaveBeenCalled();
  });
});
