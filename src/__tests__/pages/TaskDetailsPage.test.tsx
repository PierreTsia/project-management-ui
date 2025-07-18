import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '../../test/TestAppWithRouting';

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

vi.mock('../../hooks/useTasks', () => ({
  useTask: () => mockUseTask(),
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
    expect(
      screen.getAllByTestId('task-status-badge').length
    ).toBeGreaterThanOrEqual(1);
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
});
