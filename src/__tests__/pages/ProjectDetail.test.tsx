import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestAppWithRouting } from '../../test/TestAppWithRouting';

// Mock the hooks used by ProjectDetail component
const mockUseProject = vi.fn();
const mockUseUpdateProject = vi.fn();
const mockUseDeleteProject = vi.fn();
const mockUseProjectContributors = vi.fn();
const mockUseProjectAttachments = vi.fn();

vi.mock('../../hooks/useProjects', () => ({
  useProject: () => mockUseProject(),
  useUpdateProject: () => mockUseUpdateProject(),
  useDeleteProject: () => mockUseDeleteProject(),
  useProjectContributors: () => mockUseProjectContributors(),
  useProjectAttachments: () => mockUseProjectAttachments(),
}));

const mockUseProjectTasks = vi.fn();
const mockUseUpdateTaskStatus = vi.fn();
const mockUseDeleteTask = vi.fn();
const mockUseCreateTask = vi.fn();

vi.mock('../../hooks/useTasks', () => ({
  useProjectTasks: () => mockUseProjectTasks(),
  useUpdateTaskStatus: () => mockUseUpdateTaskStatus(),
  useDeleteTask: () => mockUseDeleteTask(),
  useCreateTask: () => mockUseCreateTask(),
}));

// Mock react-router-dom to control URL params
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-project-id' }),
    useNavigate: () => mockNavigate,
  };
});

describe('ProjectDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Setup default mocks for all hooks
    mockUseProject.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    mockUseUpdateProject.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseDeleteProject.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseProjectContributors.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    mockUseProjectAttachments.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    mockUseProjectTasks.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    mockUseUpdateTaskStatus.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseDeleteTask.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseCreateTask.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  describe('Project Loading & Data Fetching', () => {
    it('should mount the component', () => {
      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should render the loading skeleton when component mounts
      expect(
        screen.getByTestId('project-details-skeleton')
      ).toBeInTheDocument();
    });
    it('should load project data on mount', () => {
      const mockProject = {
        id: 'test-project-id',
        name: 'E-commerce Platform',
        description: 'Modern React-based shopping platform',
        status: 'ACTIVE' as const,
        ownerId: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      // Mock the project data to be loaded
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });

      // Mock empty contributors, attachments, and tasks for now
      mockUseProjectContributors.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseProjectAttachments.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseProjectTasks.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<TestAppWithRouting url="/projects/test-project-id" />);

      // Should display the project name in the main heading
      expect(
        screen.getByRole('heading', { name: 'E-commerce Platform' })
      ).toBeInTheDocument();

      // Should display the project description
      expect(
        screen.getByText('Modern React-based shopping platform')
      ).toBeInTheDocument();

      // Should display back button
      expect(screen.getByText('Back')).toBeInTheDocument();

      // Should not show loading skeleton anymore
      expect(
        screen.queryByTestId('project-details-skeleton')
      ).not.toBeInTheDocument();
    });
    it('should load project contributors');
    it('should load project attachments');
    it('should load project tasks');
    it('should handle project not found error');
    it('should handle API errors gracefully');
  });

  describe('Project Information Management', () => {
    it('should display project basic information (name, description, status)');
    it('should display project owner and creation dates');
    it('should handle project editing');
    it('should toggle project status (active/archived)');
    it('should delete project with confirmation');
    it('should navigate back to projects list after deletion');
  });

  describe('Contributors Management', () => {
    it('should display project owner in contributors section');
    it('should display list of project contributors');
    it('should separate owner from other contributors');
    it('should handle empty contributors list');
  });

  describe('Attachments Management', () => {
    it('should display list of project attachments');
    it('should handle attachment download/view');
    it('should open attachment in new tab');
    it('should handle empty attachments list');
  });

  describe('Tasks Management', () => {
    it('should display list of project tasks');
    it('should handle empty tasks list');
    it('should open create task modal');
    it('should create new task successfully');
    it('should update task status (TODO -> IN_PROGRESS -> DONE)');
    it('should validate task status transitions');
    it('should delete task with confirmation');
    it('should handle task assignment');
    it('should handle task editing');
    it('should show proper error messages for task operations');
  });

  describe('Modal State Management', () => {
    it('should manage create task modal state');
    it('should manage delete project modal state');
    it('should prevent modal close during async operations');
  });

  describe('Error Handling & User Feedback', () => {
    it('should extract and display API error messages');
    it('should show success toast for successful operations');
    it('should show error toast for failed operations');
    it('should handle network connectivity issues');
  });
});
