import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '../../test/TestAppWithRouting';

// Mock the current date to be deterministic
const mockDate = new Date('2025-07-18T12:00:00.000Z');
vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());

// Test date constants for due date tests

const JULY_19_2025_IN_LOCAL_TIME = '2025-07-18T22:00:00.000Z';
const JULY_20_2025_IN_LOCAL_TIME = '2025-07-19T22:00:00.000Z';

const mockTask = {
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
};

const mockUseTask = vi.fn();
const mockUseTaskComments = vi.fn();
const mockMutateAsync = vi.fn();
const mockUseCreateTaskComment = vi.fn(() => ({
  mutateAsync: mockMutateAsync,
  isPending: false,
}));
const mockUseDeleteTaskComment = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));
const mockUseUpdateTaskComment = vi.fn();
const mockUseUpdateTaskStatus = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));
const mockUseUpdateTask = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

vi.mock('../../hooks/useTasks', () => ({
  useTask: () => mockUseTask(),
  useUpdateTaskStatus: () => mockUseUpdateTaskStatus(),
  useUpdateTask: () => mockUseUpdateTask(),
}));

vi.mock('../../hooks/useTaskComments', () => ({
  useTaskComments: () => mockUseTaskComments(),
  useCreateTaskComment: () => mockUseCreateTaskComment(),
  useDeleteTaskComment: () => mockUseDeleteTaskComment(),
  useUpdateTaskComment: () => mockUseUpdateTaskComment(),
}));

// Mock react-router-dom to control URL params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-project-id', taskId: 'task1' }),
  };
});

vi.mock('../../services/projects', () => ({
  getProject: vi.fn(() =>
    Promise.resolve({
      id: 'test-project-id',
      name: 'Test Project',
      ownerId: 'user1',
    })
  ),
}));

describe('TaskDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUseTask.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    mockUseUpdateTaskComment.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  it('should show loading skeleton when loading', () => {
    mockUseTask.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);
    expect(screen.getByTestId('project-details-skeleton')).toBeInTheDocument();
  });

  it('should show error alert if task fails to load', () => {
    mockUseTask.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    });
    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);
    expect(screen.getByText(/failed to load task/i)).toBeInTheDocument();
    expect(screen.getByText(/back/i)).toBeInTheDocument();
  });

  it('should render task details when loaded', () => {
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);
    expect(
      screen.getByText('Implement user authentication')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Set up login and registration system')
    ).toBeInTheDocument();
    expect(screen.getByTestId('task-status-select')).toBeInTheDocument();
    expect(screen.getByText(/created:/i)).toBeInTheDocument();
    expect(screen.getByText(/updated:/i)).toBeInTheDocument();
    expect(screen.getByText(/due:/i)).toBeInTheDocument();
    expect(screen.getByText(/back/i)).toBeInTheDocument();
  });

  it('should show loading state for comments', () => {
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);
    expect(screen.getByText('Loading comments...')).toBeInTheDocument();
  });

  it('should show error state for comments', () => {
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed'),
    });
    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);
    expect(screen.getByText('Failed to load comments')).toBeInTheDocument();
  });

  it('should render comments when loaded', () => {
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    const comments = [
      {
        id: 'c1',
        content: 'This is a comment',
        taskId: 'task1',
        userId: 'user1',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    ];
    mockUseTaskComments.mockReturnValue({
      data: comments,
      isLoading: false,
      error: null,
    });
    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);
    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('This is a comment')).toBeInTheDocument();
  });

  it('should allow adding a new comment', async () => {
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    mockMutateAsync.mockResolvedValueOnce({});

    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    // Assert the add comment button is present
    const addButton = screen.getByTestId('add-comment-button');
    expect(addButton).toBeInTheDocument();

    // Open the modal
    await userEvent.click(addButton);

    // Modal and fields should appear
    const textarea = await screen.findByTestId('comment-content-input');
    expect(textarea).toBeInTheDocument();
    const confirmButton = screen.getByTestId('confirm-add-comment');
    expect(confirmButton).toBeInTheDocument();

    // Fill the textarea
    await userEvent.type(textarea, 'A new comment');

    // Confirm add
    await userEvent.click(confirmButton);

    // Assert the create comment mock was called
    expect(mockMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      content: 'A new comment',
    });
  });

  it('should allow deleting a comment', async () => {
    const mockDeleteMutateAsync = vi.fn();
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    const comments = [
      {
        id: 'c1',
        content: 'This is a comment',
        taskId: 'task1',
        userId: 'user1',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    ];
    mockUseTaskComments.mockReturnValue({
      data: comments,
      isLoading: false,
      error: null,
    });
    mockUseDeleteTaskComment.mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    });

    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    // Find the delete button for the comment
    const deleteBtn = await screen.findByTestId('delete-comment-button');
    expect(deleteBtn).toBeInTheDocument();

    // Click delete button
    await userEvent.click(deleteBtn);

    // Confirm modal should appear (look for the confirm button)
    const confirmBtn = await screen.findByRole('button', { name: /delete/i });
    expect(confirmBtn).toBeInTheDocument();

    // Click confirm
    await userEvent.click(confirmBtn);

    // Assert the delete comment mock was called
    expect(mockDeleteMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      commentId: 'c1',
    });
  });

  it('should allow editing a comment', async () => {
    const mockUpdateMutateAsync = vi.fn();
    mockUseUpdateTaskComment.mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false,
    });
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    const comments = [
      {
        id: 'c1',
        content: 'This is a comment',
        taskId: 'task1',
        userId: 'user1',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    ];
    mockUseTaskComments.mockReturnValue({
      data: comments,
      isLoading: false,
      error: null,
    });
    mockUseDeleteTaskComment.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    // Click edit button
    const editBtn = await screen.findByTestId('edit-comment-button');
    expect(editBtn).toBeInTheDocument();
    await userEvent.click(editBtn);

    // Edit textarea should appear
    const textarea = await screen.findByTestId('edit-comment-textarea');
    expect(textarea).toBeInTheDocument();
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Updated comment');

    // Click save
    const saveBtn = screen.getByTestId('save-edit-comment');
    expect(saveBtn).toBeInTheDocument();
    await userEvent.click(saveBtn);

    // Assert the update comment mock was called
    expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      commentId: 'c1',
      content: 'Updated comment',
    });
  });

  it('should show status select dropdown', () => {
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    expect(screen.getByTestId('task-status-select')).toBeInTheDocument();
  });

  it('should allow changing task status', async () => {
    const mockUpdateStatusMutateAsync = vi.fn();
    mockUseUpdateTaskStatus.mockReturnValue({
      mutateAsync: mockUpdateStatusMutateAsync,
      isPending: false,
    });
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    const statusSelect = screen.getByTestId('task-status-select');
    expect(statusSelect).toBeInTheDocument();

    // Click to open dropdown
    await userEvent.click(statusSelect);

    // Select IN_PROGRESS option
    const inProgressOption = screen.getByTestId(
      'task-status-option-IN_PROGRESS'
    );
    await userEvent.click(inProgressOption);

    expect(mockUpdateStatusMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      data: { status: 'IN_PROGRESS' },
    });
  });

  it('should show edit due date button when due date exists', () => {
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    expect(screen.getByTestId('edit-due-date-button')).toBeInTheDocument();
  });

  it('should show set due date button when no due date exists', () => {
    const taskWithoutDueDate = { ...mockTask, dueDate: undefined };
    mockUseTask.mockReturnValue({
      data: taskWithoutDueDate,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    expect(screen.getByTestId('set-due-date-button')).toBeInTheDocument();
  });

  it('should allow editing due date', async () => {
    const mockUpdateTaskMutateAsync = vi.fn();
    mockUseUpdateTask.mockReturnValue({
      mutateAsync: mockUpdateTaskMutateAsync,
      isPending: false,
    });
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    const editDueDateButton = screen.getByTestId('edit-due-date-button');
    expect(editDueDateButton).toBeInTheDocument();

    // Click to open date picker
    await userEvent.click(editDueDateButton);

    // Find and click a specific future date using data-day attribute
    // July 19, 2025 is available (not disabled)
    const futureDateButton = document.querySelector(
      'button[data-day="7/19/2025"]'
    );
    expect(futureDateButton).toBeInTheDocument();
    await userEvent.click(futureDateButton!);

    // Verify the mutation was called with the new date
    expect(mockUpdateTaskMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      data: expect.objectContaining({
        dueDate: JULY_19_2025_IN_LOCAL_TIME,
      }),
    });
  });

  it('should allow setting due date when none exists', async () => {
    const mockUpdateTaskMutateAsync = vi.fn();
    mockUseUpdateTask.mockReturnValue({
      mutateAsync: mockUpdateTaskMutateAsync,
      isPending: false,
    });
    const taskWithoutDueDate = { ...mockTask, dueDate: undefined };
    mockUseTask.mockReturnValue({
      data: taskWithoutDueDate,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    const setDueDateButton = screen.getByTestId('set-due-date-button');
    expect(setDueDateButton).toBeInTheDocument();

    // Click to open date picker
    await userEvent.click(setDueDateButton);

    // Find and click a specific future date using data-day attribute
    // July 20, 2025 is available (not disabled)
    const futureDateButton = document.querySelector(
      'button[data-day="7/20/2025"]'
    );
    expect(futureDateButton).toBeInTheDocument();
    await userEvent.click(futureDateButton!);

    // Verify the mutation was called with the new date
    expect(mockUpdateTaskMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      data: expect.objectContaining({
        dueDate: JULY_20_2025_IN_LOCAL_TIME,
      }),
    });
  });

  it('should show add description button when no description exists', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    mockUseTask.mockReturnValue({
      data: taskWithoutDescription,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    expect(screen.getByTestId('add-description-button')).toBeInTheDocument();
    expect(screen.getByText(/add description/i)).toBeInTheDocument();
  });

  it('should show edit description button when description exists', () => {
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    expect(screen.getByTestId('edit-description-button')).toBeInTheDocument();
    expect(
      screen.getByText('Set up login and registration system')
    ).toBeInTheDocument();
  });

  it('should allow adding a description when none exists', async () => {
    const mockUpdateTaskMutateAsync = vi.fn();
    mockUseUpdateTask.mockReturnValue({
      mutateAsync: mockUpdateTaskMutateAsync,
      isPending: false,
    });
    const taskWithoutDescription = { ...mockTask, description: undefined };
    mockUseTask.mockReturnValue({
      data: taskWithoutDescription,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    // Click add description button
    const addButton = screen.getByTestId('add-description-button');
    expect(addButton).toBeInTheDocument();
    await userEvent.click(addButton);

    // Textarea should appear
    const textarea = screen.getByTestId('description-textarea');
    expect(textarea).toBeInTheDocument();
    expect(screen.getByTestId('save-description-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-description-button')).toBeInTheDocument();

    // Type description
    await userEvent.type(textarea, 'This is a new task description');

    // Save description
    const saveButton = screen.getByTestId('save-description-button');
    await userEvent.click(saveButton);

    // Verify the mutation was called
    expect(mockUpdateTaskMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      data: { description: 'This is a new task description' },
    });
  });

  it('should allow editing an existing description', async () => {
    const mockUpdateTaskMutateAsync = vi.fn();
    mockUseUpdateTask.mockReturnValue({
      mutateAsync: mockUpdateTaskMutateAsync,
      isPending: false,
    });
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    // Click edit description button
    const editButton = screen.getByTestId('edit-description-button');
    expect(editButton).toBeInTheDocument();
    await userEvent.click(editButton);

    // Textarea should appear with existing content
    const textarea = screen.getByTestId('description-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Set up login and registration system');

    // Edit the description
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Updated task description');

    // Save description
    const saveButton = screen.getByTestId('save-description-button');
    await userEvent.click(saveButton);

    // Verify the mutation was called
    expect(mockUpdateTaskMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      data: { description: 'Updated task description' },
    });
  });

  it('should allow canceling description editing', async () => {
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    // Click edit description button
    const editButton = screen.getByTestId('edit-description-button');
    await userEvent.click(editButton);

    // Textarea should appear
    const textarea = screen.getByTestId('description-textarea');
    expect(textarea).toBeInTheDocument();

    // Type some text
    await userEvent.type(textarea, 'This should be discarded');

    // Click cancel button
    const cancelButton = screen.getByTestId('cancel-description-button');
    await userEvent.click(cancelButton);

    // Should return to view mode with original content
    expect(
      screen.queryByTestId('description-textarea')
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Set up login and registration system')
    ).toBeInTheDocument();
    expect(screen.getByTestId('edit-description-button')).toBeInTheDocument();
  });

  it('should disable buttons during description update', async () => {
    const mockUpdateTaskMutateAsync = vi.fn();
    mockUseUpdateTask.mockReturnValue({
      mutateAsync: mockUpdateTaskMutateAsync,
      isPending: true, // Simulate loading state
    });
    mockUseTask.mockReturnValue({
      data: mockTask,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    // Click edit description button
    const editButton = screen.getByTestId('edit-description-button');
    await userEvent.click(editButton);

    // Buttons should be disabled during update
    const saveButton = screen.getByTestId('save-description-button');
    const cancelButton = screen.getByTestId('cancel-description-button');

    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });
});
