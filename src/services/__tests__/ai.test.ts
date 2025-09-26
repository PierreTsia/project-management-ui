import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { AiService } from '../ai';
import { apiClient } from '@/lib/api-client';
import type {
  GenerateTasksRequest,
  GenerateLinkedTasksPreviewRequest,
  ConfirmLinkedTasksRequest,
} from '@/types/ai';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('AiService', () => {
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.post as Mock<typeof apiClient.post>) = mockPost;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('generateTasks', () => {
    it('should call the correct endpoint with the right payload', async () => {
      const mockResponse = {
        data: {
          tasks: [
            {
              title: 'Test Task 1',
              description: 'Test Description 1',
              priority: 'HIGH' as const,
            },
            {
              title: 'Test Task 2',
              description: 'Test Description 2',
              priority: 'MEDIUM' as const,
            },
          ],
          meta: {
            degraded: false,
          },
        },
      };

      mockPost.mockResolvedValue(mockResponse);

      const request: GenerateTasksRequest = {
        prompt: 'Create a test project',
        projectId: 'test-project-id',
        locale: 'en',
        options: {
          taskCount: 5,
          minPriority: 'HIGH',
          projectType: 'WEB_APP',
        },
      };

      const result = await AiService.generateTasks(request);

      expect(mockPost).toHaveBeenCalledWith('/ai/generate-tasks', request);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockPost.mockRejectedValue(error);

      const request: GenerateTasksRequest = {
        prompt: 'Create a test project',
        projectId: 'test-project-id',
        locale: 'en',
        options: {
          taskCount: 5,
        },
      };

      await expect(AiService.generateTasks(request)).rejects.toThrow(
        'API Error'
      );
    });
  });

  describe('generateLinkedTasksPreview', () => {
    it('should call the correct endpoint with the right payload', async () => {
      const mockResponse = {
        data: {
          tasks: [
            {
              id: 'task_1',
              title: 'Setup project structure',
              description:
                'Initialize the project with proper folder structure',
              priority: 'HIGH' as const,
            },
            {
              id: 'task_2',
              title: 'Implement authentication',
              description: 'Add user login and registration functionality',
              priority: 'MEDIUM' as const,
            },
          ],
          relationships: [
            {
              sourceTask: 'task_1',
              targetTask: 'task_2',
              type: 'BLOCKS' as const,
            },
          ],
          meta: {
            placeholderMode: true,
          },
        },
      };

      mockPost.mockResolvedValue(mockResponse);

      const request: GenerateLinkedTasksPreviewRequest = {
        prompt: 'Create a web application with authentication',
        projectId: 'test-project-id',
      };

      const result = await AiService.generateLinkedTasksPreview(request);

      expect(mockPost).toHaveBeenCalledWith(
        '/ai/generate-linked-tasks-preview',
        request
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const error = new Error('Preview API Error');
      mockPost.mockRejectedValue(error);

      const request: GenerateLinkedTasksPreviewRequest = {
        prompt: 'Create a web application',
        projectId: 'test-project-id',
      };

      await expect(
        AiService.generateLinkedTasksPreview(request)
      ).rejects.toThrow('Preview API Error');
    });
  });

  describe('confirmLinkedTasks', () => {
    it('should call the correct endpoint with the right payload', async () => {
      const mockResponse = {
        data: {
          createdTaskIds: ['task-1', 'task-2'],
          createdRelationships: [
            {
              fromTaskId: 'task-1',
              toTaskId: 'task-2',
              type: 'BLOCKS' as const,
            },
          ],
          rejectedRelationships: [],
          counts: {
            totalLinks: 1,
            createdLinks: 1,
            rejectedLinks: 0,
          },
        },
      };

      mockPost.mockResolvedValue(mockResponse);

      const request: ConfirmLinkedTasksRequest = {
        projectId: 'test-project-id',
        tasks: [
          {
            title: 'Setup project structure',
            description: 'Initialize the project',
            priority: 'HIGH' as const,
          },
          {
            title: 'Implement authentication',
            description: 'Add user login',
            priority: 'MEDIUM' as const,
          },
        ],
        relationships: [
          {
            sourceTask: 'task_1',
            targetTask: 'task_2',
            type: 'BLOCKS' as const,
          },
        ],
      };

      const result = await AiService.confirmLinkedTasks(request);

      expect(mockPost).toHaveBeenCalledWith(
        '/ai/confirm-linked-tasks',
        request
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const error = new Error('Confirm API Error');
      mockPost.mockRejectedValue(error);

      const request: ConfirmLinkedTasksRequest = {
        projectId: 'test-project-id',
        tasks: [
          {
            title: 'Test Task',
            description: 'Test Description',
            priority: 'HIGH' as const,
          },
        ],
        relationships: [],
      };

      await expect(AiService.confirmLinkedTasks(request)).rejects.toThrow(
        'Confirm API Error'
      );
    });

    it('should handle empty tasks and relationships', async () => {
      const mockResponse = {
        data: {
          createdTaskIds: [],
          createdRelationships: [],
          rejectedRelationships: [],
          counts: {
            totalLinks: 0,
            createdLinks: 0,
            rejectedLinks: 0,
          },
        },
      };

      mockPost.mockResolvedValue(mockResponse);

      const request: ConfirmLinkedTasksRequest = {
        projectId: 'test-project-id',
        tasks: [],
        relationships: [],
      };

      const result = await AiService.confirmLinkedTasks(request);

      expect(mockPost).toHaveBeenCalledWith(
        '/ai/confirm-linked-tasks',
        request
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});
