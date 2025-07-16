import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event'; // Removed unused import
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

vi.mock('../../hooks/useTasks', () => ({
  useTask: () => mockUseTask(),
}));

vi.mock('../../hooks/useTaskComments', () => ({
  useTaskComments: () => mockUseTaskComments(),
  useCreateTaskComment: () => mockUseCreateTaskComment(),
  useDeleteTaskComment: () => mockUseDeleteTaskComment(),
}));

// Mock react-router-dom to control URL params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-project-id', taskId: 'task1' }),
  };
});

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
});
