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

vi.mock('../../hooks/useTasks', () => ({
  useTask: () => mockUseTask(),
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
});
