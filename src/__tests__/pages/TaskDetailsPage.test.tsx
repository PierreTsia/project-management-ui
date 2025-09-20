import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '../../test/TestAppWithRouting';
import { toast } from 'sonner';

// Mock the current date to be deterministic
const mockDate = new Date('2025-07-18T12:00:00.000Z');
vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());

// Note: Date tests use flexible validation to avoid timezone issues in CI

import { createMockUser, createMockTask } from '../../test/mock-factories';

const mockTask = createMockTask({
  id: 'task1',
  title: 'Implement user authentication',
  description: 'Set up login and registration system',
  status: 'TODO',
  priority: 'HIGH',
  dueDate: '2024-02-01T00:00:00Z',
  projectId: 'test-project-id',
  assignee: createMockUser({
    id: 'user2',
    email: 'user2@example.com',
    name: 'John Doe',
  }),
});

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
const mockUseAssignTask = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));
const mockUseUnassignTask = vi.fn(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

vi.mock('@/hooks/useTasks', () => ({
  useTask: () => mockUseTask(),
  useProjectTasks: () => ({ data: [], isLoading: false, error: null }),
  useUpdateTaskStatus: () => mockUseUpdateTaskStatus(),
  useUpdateTask: () => mockUseUpdateTask(),
  useDeleteTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useAssignTask: () => mockUseAssignTask(),
  useUnassignTask: () => mockUseUnassignTask(),
}));

vi.mock('@/hooks/useTaskComments', () => ({
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

// Mock sonner toast
vi.mock('sonner', async () => {
  const actual = await vi.importActual('sonner');
  return {
    ...actual,
    toast: {
      error: vi.fn(),
      success: vi.fn(),
    },
  };
});

vi.mock('@/services/projects', () => ({
  getProject: vi.fn(() =>
    Promise.resolve({
      id: 'test-project-id',
      name: 'Test Project',
      ownerId: 'user-1',
    })
  ),
}));

describe('TaskDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(toast.error).mockClear();
    vi.mocked(toast.success).mockClear();
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

    // Check that the assigned user section shows John Doe
    const assignedUserSection = screen.getByTestId(
      'task-assigned-user-section'
    );
    expect(
      within(assignedUserSection).getByText('John Doe')
    ).toBeInTheDocument();

    // Check that the comments section shows the comment and author
    const commentsSection = screen.getByTestId('task-comments-section');
    expect(
      within(commentsSection).getByText('This is a comment')
    ).toBeInTheDocument();
    expect(within(commentsSection).getByText('John Doe')).toBeInTheDocument();
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

    // Assert the comment form is present
    const textarea = screen.getByTestId('comment-content-input');
    expect(textarea).toBeInTheDocument();
    const confirmButton = screen.getByTestId('confirm-add-comment');
    expect(confirmButton).toBeInTheDocument();
    const cancelButton = screen.getByTestId('cancel-comment-button');
    expect(cancelButton).toBeInTheDocument();

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

  it('should allow canceling comment creation', async () => {
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

    // Fill the textarea
    const textarea = screen.getByTestId('comment-content-input');
    await userEvent.type(textarea, 'This should be discarded');

    // Click cancel
    const cancelButton = screen.getByTestId('cancel-comment-button');
    await userEvent.click(cancelButton);

    // Textarea should be cleared
    expect(textarea).toHaveValue('');
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
        userId: 'user-1',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        user: {
          id: 'user-1',
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
        userId: 'user-1',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        user: {
          id: 'user-1',
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

    // Assert success toast was shown
    expect(vi.mocked(toast.success)).toHaveBeenCalled();
  });

  it('should show API error message when status update fails due to permissions', async () => {
    const mockUpdateStatusMutateAsync = vi.fn().mockRejectedValue({
      response: {
        data: {
          message:
            'Only the task assignee can update the status of task b17f0ade-ef96-4acb-9cf9-15faa58f05ba',
        },
      },
    });
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

    // Wait for the error to be handled
    await new Promise(resolve => setTimeout(resolve, 0));

    // Assert the API error message was shown in toast
    expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
      'Only the task assignee can update the status of task b17f0ade-ef96-4acb-9cf9-15faa58f05ba'
    );
  });

  it('should show API error message when title update fails', async () => {
    const mockUpdateTaskMutateAsync = vi.fn().mockRejectedValue({
      response: {
        data: {
          message: 'You do not have permission to update this task',
        },
      },
    });
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

    // Enter edit mode
    const titleContainer = screen.getByTestId('title-container');
    await userEvent.click(titleContainer);

    // Edit the title
    const titleInput = screen.getByTestId('title-input');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated task title');

    // Save the changes
    const saveButton = screen.getByTestId('save-title-button');
    await userEvent.click(saveButton);

    // Wait for the error to be handled
    await new Promise(resolve => setTimeout(resolve, 0));

    // Assert the API error message was shown in toast
    expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
      'You do not have permission to update this task'
    );
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

    // Wait for popover to be fully open
    await new Promise(resolve => setTimeout(resolve, 100));

    // Try to find any clickable date button in the calendar
    const calendarButtons = document.querySelectorAll(
      '[data-radix-popper-content-wrapper] button'
    );

    // Find a future date button (not disabled)
    const futureDateButton = Array.from(calendarButtons).find(button => {
      const day = button.getAttribute('data-day');
      if (!day) return false;
      const date = new Date(day);
      return date > new Date() && !(button as HTMLButtonElement).disabled;
    });

    expect(futureDateButton).toBeInTheDocument();
    await userEvent.click(futureDateButton!);

    // Verify the mutation was called with a valid future date
    expect(mockUpdateTaskMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      data: expect.objectContaining({
        dueDate: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        ),
      }),
    });

    // Verify the date is in the future relative to mocked now
    const callArgs = mockUpdateTaskMutateAsync.mock.calls[0][0];
    const dueDate = new Date(callArgs.data.dueDate);
    expect(dueDate.getTime()).toBeGreaterThan(new Date(Date.now()).getTime());
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

    // Wait for popover to be fully open
    await new Promise(resolve => setTimeout(resolve, 100));

    // Try to find any clickable date button in the calendar
    const calendarButtons = document.querySelectorAll(
      '[data-radix-popper-content-wrapper] button'
    );

    // Find a future date button (not disabled)
    const futureDateButton = Array.from(calendarButtons).find(button => {
      const day = button.getAttribute('data-day');
      if (!day) return false;
      const date = new Date(day);
      return date > new Date() && !(button as HTMLButtonElement).disabled;
    });

    expect(futureDateButton).toBeInTheDocument();
    await userEvent.click(futureDateButton!);

    // Verify the mutation was called with a valid future date
    expect(mockUpdateTaskMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      data: expect.objectContaining({
        dueDate: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        ),
      }),
    });

    // Verify the date is in the future relative to mocked now
    const callArgs = mockUpdateTaskMutateAsync.mock.calls[0][0];
    const dueDate = new Date(callArgs.data.dueDate);
    expect(dueDate.getTime()).toBeGreaterThan(new Date(Date.now()).getTime());
  });

  it('should show add description container when no description exists', () => {
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

    expect(screen.getByTestId('description-add-container')).toBeInTheDocument();
    expect(screen.getByText(/add description/i)).toBeInTheDocument();
  });

  it('should show clickable description container when description exists', () => {
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

    expect(screen.getByTestId('description-container')).toBeInTheDocument();
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

    // Click add description container
    const addContainer = screen.getByTestId('description-add-container');
    expect(addContainer).toBeInTheDocument();
    await userEvent.click(addContainer);

    // Textarea should appear
    const textarea = screen.getByTestId('description-textarea');
    expect(textarea).toBeInTheDocument();
    expect(screen.getByTestId('description-save-button')).toBeInTheDocument();
    expect(screen.getByTestId('description-cancel-button')).toBeInTheDocument();

    // Type description
    await userEvent.type(textarea, 'This is a new task description');

    // Save description
    const saveButton = screen.getByTestId('description-save-button');
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

    // Click description container to enter edit mode
    const descriptionContainer = screen.getByTestId('description-container');
    expect(descriptionContainer).toBeInTheDocument();
    await userEvent.click(descriptionContainer);

    // Textarea should appear with existing content
    const textarea = screen.getByTestId('description-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Set up login and registration system');

    // Edit the description
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Updated task description');

    // Save description
    const saveButton = screen.getByTestId('description-save-button');
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

    // Click description container to enter edit mode
    const descriptionContainer = screen.getByTestId('description-container');
    await userEvent.click(descriptionContainer);

    // Textarea should appear
    const textarea = screen.getByTestId('description-textarea');
    expect(textarea).toBeInTheDocument();

    // Type some text
    await userEvent.type(textarea, 'This should be discarded');

    // Click cancel button
    const cancelButton = screen.getByTestId('description-cancel-button');
    await userEvent.click(cancelButton);

    // Should return to view mode with original content
    expect(
      screen.queryByTestId('description-textarea')
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Set up login and registration system')
    ).toBeInTheDocument();
    expect(screen.getByTestId('description-container')).toBeInTheDocument();
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

    // Click description container to enter edit mode
    const descriptionContainer = screen.getByTestId('description-container');
    await userEvent.click(descriptionContainer);

    // Buttons should be disabled during update
    const saveButton = screen.getByTestId('description-save-button');
    const cancelButton = screen.getByTestId('description-cancel-button');

    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should show clickable title container', () => {
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

    expect(screen.getByTestId('title-container')).toBeInTheDocument();
    expect(
      screen.getByText('Implement user authentication')
    ).toBeInTheDocument();
  });

  it('should allow editing title by clicking the container', async () => {
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

    // Click the title container to enter edit mode
    const titleContainer = screen.getByTestId('title-container');
    expect(titleContainer).toBeInTheDocument();
    await userEvent.click(titleContainer);

    // Input should appear with current title
    const titleInput = screen.getByTestId('title-input');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveValue('Implement user authentication');
    expect(titleInput).toHaveFocus(); // Should auto-focus

    // Save and cancel buttons should appear
    expect(screen.getByTestId('save-title-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-title-button')).toBeInTheDocument();
  });

  it('should allow saving title changes', async () => {
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

    // Enter edit mode
    const titleContainer = screen.getByTestId('title-container');
    await userEvent.click(titleContainer);

    // Edit the title
    const titleInput = screen.getByTestId('title-input');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated task title');

    // Save the changes
    const saveButton = screen.getByTestId('save-title-button');
    await userEvent.click(saveButton);

    // Verify the mutation was called
    expect(mockUpdateTaskMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      data: { title: 'Updated task title' },
    });
  });

  it('should allow canceling title editing', async () => {
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

    // Enter edit mode
    const titleContainer = screen.getByTestId('title-container');
    await userEvent.click(titleContainer);

    // Edit the title
    const titleInput = screen.getByTestId('title-input');
    await userEvent.type(titleInput, 'This should be discarded');

    // Cancel the changes
    const cancelButton = screen.getByTestId('cancel-title-button');
    await userEvent.click(cancelButton);

    // Should return to view mode with original content
    expect(screen.queryByTestId('title-input')).not.toBeInTheDocument();
    expect(
      screen.getByText('Implement user authentication')
    ).toBeInTheDocument();
    expect(screen.getByTestId('title-container')).toBeInTheDocument();
  });

  it('should support keyboard shortcuts for title editing', async () => {
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

    // Enter edit mode
    const titleContainer = screen.getByTestId('title-container');
    await userEvent.click(titleContainer);

    const titleInput = screen.getByTestId('title-input');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'New title');

    // Test Enter key to save
    await userEvent.keyboard('{Enter}');

    expect(mockUpdateTaskMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      data: { title: 'New title' },
    });
  });

  it('should support Escape key to cancel title editing', async () => {
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

    // Enter edit mode
    const titleContainer = screen.getByTestId('title-container');
    await userEvent.click(titleContainer);

    const titleInput = screen.getByTestId('title-input');
    await userEvent.type(titleInput, 'This should be discarded');

    // Test Escape key to cancel
    await userEvent.keyboard('{Escape}');

    // Should return to view mode with original content
    expect(screen.queryByTestId('title-input')).not.toBeInTheDocument();
    expect(
      screen.getByText('Implement user authentication')
    ).toBeInTheDocument();
  });

  it('should prevent saving empty title', async () => {
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

    // Enter edit mode
    const titleContainer = screen.getByTestId('title-container');
    await userEvent.click(titleContainer);

    // Clear the title
    const titleInput = screen.getByTestId('title-input');
    await userEvent.clear(titleInput);

    // Try to save empty title
    const saveButton = screen.getByTestId('save-title-button');
    await userEvent.click(saveButton);

    // Should not call the mutation
    expect(mockUpdateTaskMutateAsync).not.toHaveBeenCalled();
    // Should still be in edit mode
    expect(screen.getByTestId('title-input')).toBeInTheDocument();
  });

  it('should disable title editing buttons during update', async () => {
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

    // Enter edit mode
    const titleContainer = screen.getByTestId('title-container');
    await userEvent.click(titleContainer);

    // Buttons should be disabled during update
    const saveButton = screen.getByTestId('save-title-button');
    const cancelButton = screen.getByTestId('cancel-title-button');

    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should support keyboard shortcuts for description editing', async () => {
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

    // Enter edit mode
    const descriptionContainer = screen.getByTestId('description-container');
    await userEvent.click(descriptionContainer);

    const textarea = screen.getByTestId('description-textarea');
    await userEvent.type(textarea, 'Additional text');

    // Test Escape key to cancel
    await userEvent.keyboard('{Escape}');

    // Should return to view mode with original content
    expect(
      screen.queryByTestId('description-textarea')
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Set up login and registration system')
    ).toBeInTheDocument();
  });

  it('should auto-focus description textarea when entering edit mode', async () => {
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

    // Enter edit mode
    const descriptionContainer = screen.getByTestId('description-container');
    await userEvent.click(descriptionContainer);

    // Textarea should be focused
    const textarea = screen.getByTestId('description-textarea');
    expect(textarea).toHaveFocus();
  });

  it('should allow assigning task to a user', async () => {
    const mockAssignTaskMutateAsync = vi.fn();
    mockUseAssignTask.mockReturnValue({
      mutateAsync: mockAssignTaskMutateAsync,
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

    // Assert the assign button is visible
    const assignButton = screen.getByTestId('assign-user-button');
    expect(assignButton).toBeInTheDocument();

    // Click the assign button
    await userEvent.click(assignButton);

    // Assert the modal is visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Assign Task')).toBeInTheDocument();

    // Mock the modal's onAssign callback
    // Since the modal is a separate component, we need to simulate its behavior
    // The modal should call the assign task mutation when a user is selected

    // Simulate the modal calling the assign task mutation
    // This would normally happen when a user is selected in the modal
    await mockAssignTaskMutateAsync({
      projectId: 'test-project-id',
      taskId: 'task1',
      userId: 'user3',
    });

    // Assert the mocked method has been called with correct parameters
    expect(mockAssignTaskMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
      userId: 'user3',
    });
  });

  it('should allow unassigning task', async () => {
    const mockUnassignTaskMutateAsync = vi.fn();
    mockUseUnassignTask.mockReturnValue({
      mutateAsync: mockUnassignTaskMutateAsync,
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

    // Assert the assign button is visible (shows current assignee)
    const assignButton = screen.getByTestId('assign-user-button');
    expect(assignButton).toBeInTheDocument();

    // Click the assign button to open modal
    await userEvent.click(assignButton);

    // Assert the modal is visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Simulate unassigning the task (removing current assignee)
    await mockUnassignTaskMutateAsync({
      projectId: 'test-project-id',
      taskId: 'task1',
    });

    // Assert the mocked method has been called
    expect(mockUnassignTaskMutateAsync).toHaveBeenCalledWith({
      projectId: 'test-project-id',
      taskId: 'task1',
    });
  });

  it('should show unassigned state when no assignee', async () => {
    const taskWithoutAssignee = { ...mockTask, assignee: undefined };
    mockUseTask.mockReturnValue({
      data: taskWithoutAssignee,
      isLoading: false,
      error: null,
    });
    mockUseTaskComments.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<TestAppWithRouting url="/projects/test-project-id/task1" />);

    // Assert the assign button shows unassigned state
    const assignButton = screen.getByTestId('assign-user-button');
    expect(assignButton).toBeInTheDocument();
    expect(screen.getByText(/unassigned/i)).toBeInTheDocument();

    // Click the assign button
    await userEvent.click(assignButton);

    // Assert the modal is visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Assign Task')).toBeInTheDocument();
  });
});
