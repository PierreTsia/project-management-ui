import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TasksService } from '../tasks';
import { apiClient } from '@/lib/api-client';
import { createMockTask, createMockUser } from '../../test/mock-factories';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  SearchTasksParams,
  SearchTasksResponse,
} from '@/types/task';
import type { Attachment } from '@/types/attachment';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);

describe('TasksService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjectTasks', () => {
    it('should call API client with correct endpoint', async () => {
      const projectId = 'project-123';
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Test Task 1',
          description: 'A test task',
          status: 'TODO',
          priority: 'MEDIUM',
          projectId,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'task-2',
          title: 'Test Task 2',
          description: 'Another test task',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          projectId,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ];

      mockGet.mockResolvedValue({ data: mockTasks });

      const result = await TasksService.getProjectTasks(projectId);

      expect(mockGet).toHaveBeenCalledWith(`/projects/${projectId}/tasks`);
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when API call fails', async () => {
      const projectId = 'project-123';
      const mockError = new Error('Failed to fetch tasks');
      mockGet.mockRejectedValue(mockError);

      await expect(TasksService.getProjectTasks(projectId)).rejects.toThrow(
        'Failed to fetch tasks'
      );
      expect(mockGet).toHaveBeenCalledWith(`/projects/${projectId}/tasks`);
    });
  });

  describe('searchProjectTasks', () => {
    it('should call API client with correct endpoint and no params', async () => {
      const projectId = 'project-123';
      const mockResponse: SearchTasksResponse = {
        tasks: [],
        total: 0,
        page: 1,
        limit: 6,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await TasksService.searchProjectTasks(projectId);

      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/search`,
        { params: undefined }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call API client with search parameters', async () => {
      const projectId = 'project-123';
      const params: SearchTasksParams = {
        query: 'test',
        status: 'TODO',
        priority: 'HIGH',
        page: 1,
        limit: 10,
      };

      const mockResponse: SearchTasksResponse = {
        tasks: [
          {
            id: 'task-1',
            title: 'Test Task',
            description: 'A test task',
            status: 'TODO',
            priority: 'HIGH',
            projectId,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockGet.mockResolvedValue({ data: mockResponse });

      const result = await TasksService.searchProjectTasks(projectId, params);

      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/search`,
        { params }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when API call fails', async () => {
      const projectId = 'project-123';
      const mockError = new Error('Failed to search tasks');
      mockGet.mockRejectedValue(mockError);

      await expect(TasksService.searchProjectTasks(projectId)).rejects.toThrow(
        'Failed to search tasks'
      );
      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/search`,
        { params: undefined }
      );
    });
  });

  describe('getTask', () => {
    it('should call API client with correct endpoint', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockTask = createMockTask({
        id: taskId,
        title: 'Test Task',
        description: 'A test task',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId,
      });

      mockGet.mockResolvedValue({ data: mockTask });

      const result = await TasksService.getTask(projectId, taskId);

      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}`
      );
      expect(result).toEqual(mockTask);
    });

    it('should throw error when task not found', async () => {
      const projectId = 'project-123';
      const taskId = 'non-existent';
      const mockError = new Error('Task not found');
      mockGet.mockRejectedValue(mockError);

      await expect(TasksService.getTask(projectId, taskId)).rejects.toThrow(
        'Task not found'
      );
      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}`
      );
    });
  });

  describe('createTask', () => {
    it('should call API client with correct endpoint and data', async () => {
      const projectId = 'project-123';
      const createRequest: CreateTaskRequest = {
        title: 'New Task',
        description: 'A new task',
        priority: 'HIGH',
      };

      const mockTask = createMockTask({
        id: 'new-task-123',
        title: 'New Task',
        description: 'A new task',
        status: 'TODO',
        priority: 'HIGH',
        projectId,
      });

      mockPost.mockResolvedValue({ data: mockTask });

      const result = await TasksService.createTask(projectId, createRequest);

      expect(mockPost).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks`,
        createRequest
      );
      expect(result).toEqual(mockTask);
    });

    it('should create task with minimal data', async () => {
      const projectId = 'project-123';
      const createRequest: CreateTaskRequest = {
        title: 'Minimal Task',
      };

      const mockTask = createMockTask({
        id: 'minimal-123',
        title: 'Minimal Task',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId,
      });

      mockPost.mockResolvedValue({ data: mockTask });

      const result = await TasksService.createTask(projectId, createRequest);

      expect(mockPost).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks`,
        createRequest
      );
      expect(result).toEqual(mockTask);
    });

    it('should throw error when API call fails', async () => {
      const projectId = 'project-123';
      const createRequest: CreateTaskRequest = {
        title: 'Invalid Task',
      };

      const mockError = new Error('Validation failed');
      mockPost.mockRejectedValue(mockError);

      await expect(
        TasksService.createTask(projectId, createRequest)
      ).rejects.toThrow('Validation failed');
      expect(mockPost).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks`,
        createRequest
      );
    });
  });

  describe('updateTask', () => {
    it('should call API client with correct endpoint and data', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const updateRequest: UpdateTaskRequest = {
        title: 'Updated Task',
        description: 'Updated description',
        priority: 'HIGH',
      };

      const mockTask = createMockTask({
        id: taskId,
        title: 'Updated Task',
        description: 'Updated description',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId,
        updatedAt: '2024-01-02T00:00:00Z',
      });

      mockPut.mockResolvedValue({ data: mockTask });

      const result = await TasksService.updateTask(
        projectId,
        taskId,
        updateRequest
      );

      expect(mockPut).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}`,
        updateRequest
      );
      expect(result).toEqual(mockTask);
    });

    it('should update task with partial data', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const updateRequest: UpdateTaskRequest = {
        priority: 'HIGH',
      };

      const mockTask = createMockTask({
        id: taskId,
        title: 'Original Title',
        description: 'Original description',
        status: 'TODO',
        priority: 'HIGH',
        projectId,
        updatedAt: '2024-01-02T00:00:00Z',
      });

      mockPut.mockResolvedValue({ data: mockTask });

      const result = await TasksService.updateTask(
        projectId,
        taskId,
        updateRequest
      );

      expect(mockPut).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}`,
        updateRequest
      );
      expect(result).toEqual(mockTask);
    });

    it('should throw error when task not found', async () => {
      const projectId = 'project-123';
      const taskId = 'non-existent';
      const updateRequest: UpdateTaskRequest = {
        title: 'Updated Title',
      };

      const mockError = new Error('Task not found');
      mockPut.mockRejectedValue(mockError);

      await expect(
        TasksService.updateTask(projectId, taskId, updateRequest)
      ).rejects.toThrow('Task not found');
      expect(mockPut).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}`,
        updateRequest
      );
    });
  });

  describe('deleteTask', () => {
    it('should call API client with correct endpoint', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';

      mockDelete.mockResolvedValue({ data: undefined });

      const result = await TasksService.deleteTask(projectId, taskId);

      expect(mockDelete).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}`
      );
      expect(result).toBeUndefined();
    });

    it('should throw error when task not found', async () => {
      const projectId = 'project-123';
      const taskId = 'non-existent';
      const mockError = new Error('Task not found');
      mockDelete.mockRejectedValue(mockError);

      await expect(TasksService.deleteTask(projectId, taskId)).rejects.toThrow(
        'Task not found'
      );
      expect(mockDelete).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}`
      );
    });

    it('should throw error when deletion fails', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockError = new Error('Failed to delete task');
      mockDelete.mockRejectedValue(mockError);

      await expect(TasksService.deleteTask(projectId, taskId)).rejects.toThrow(
        'Failed to delete task'
      );
      expect(mockDelete).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}`
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('should call API client with correct endpoint and data', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const updateRequest: UpdateTaskStatusRequest = {
        status: 'IN_PROGRESS',
      };

      const mockTask = createMockTask({
        id: taskId,
        title: 'Test Task',
        description: 'A test task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId,
        updatedAt: '2024-01-02T00:00:00Z',
      });

      mockPut.mockResolvedValue({ data: mockTask });

      const result = await TasksService.updateTaskStatus(
        projectId,
        taskId,
        updateRequest
      );

      expect(mockPut).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/status`,
        updateRequest
      );
      expect(result).toEqual(mockTask);
    });

    it('should throw error when API call fails', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const updateRequest: UpdateTaskStatusRequest = {
        status: 'DONE',
      };

      const mockError = new Error('Invalid status transition');
      mockPut.mockRejectedValue(mockError);

      await expect(
        TasksService.updateTaskStatus(projectId, taskId, updateRequest)
      ).rejects.toThrow('Invalid status transition');
      expect(mockPut).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/status`,
        updateRequest
      );
    });
  });

  describe('assignTask', () => {
    it('should call API client with correct endpoint and data', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const assignRequest: AssignTaskRequest = {
        assigneeId: 'user-789',
      };

      const mockTask = createMockTask({
        id: taskId,
        title: 'Test Task',
        description: 'A test task',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId,
        assignee: createMockUser({
          id: 'user-789',
          email: 'user789@example.com',
          name: 'Test User',
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=user789',
        }),
        updatedAt: '2024-01-02T00:00:00Z',
      });

      mockPut.mockResolvedValue({ data: mockTask });

      const result = await TasksService.assignTask(
        projectId,
        taskId,
        assignRequest
      );

      expect(mockPut).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/assign`,
        assignRequest
      );
      expect(result).toEqual(mockTask);
    });

    it('should throw error when API call fails', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const assignRequest: AssignTaskRequest = {
        assigneeId: 'invalid-user',
      };

      const mockError = new Error('User not found');
      mockPut.mockRejectedValue(mockError);

      await expect(
        TasksService.assignTask(projectId, taskId, assignRequest)
      ).rejects.toThrow('User not found');
      expect(mockPut).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/assign`,
        assignRequest
      );
    });
  });

  describe('unassignTask', () => {
    it('should call API client with correct endpoint and return unassigned task', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockTask = createMockTask({
        id: taskId,
        title: 'Test Task',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId,
        // No assignee - task is unassigned
      });

      mockDelete.mockResolvedValue({ data: mockTask });

      const result = await TasksService.unassignTask(projectId, taskId);

      expect(result).toEqual(mockTask);
      expect(mockDelete).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/assign`
      );
    });

    it('should handle API errors for unassignTask', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';

      mockDelete.mockRejectedValue(new Error('Task not found'));

      await expect(
        TasksService.unassignTask(projectId, taskId)
      ).rejects.toThrow('Task not found');
      expect(mockDelete).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/assign`
      );
    });

    it('should work with different project and task IDs', async () => {
      const projectId = 'project-999';
      const taskId = 'task-888';
      const mockTask = createMockTask({
        id: taskId,
        title: 'Different Task',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId,
        // No assignee - task is unassigned
      });

      mockDelete.mockResolvedValue({ data: mockTask });

      const result = await TasksService.unassignTask(projectId, taskId);

      expect(result).toEqual(mockTask);
      expect(mockDelete).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/assign`
      );
    });

    it('should handle unassigning already unassigned task', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockTask = createMockTask({
        id: taskId,
        title: 'Already Unassigned Task',
        status: 'TODO',
        priority: 'LOW',
        projectId,
        // Already has no assignee
      });

      mockDelete.mockResolvedValue({ data: mockTask });

      const result = await TasksService.unassignTask(projectId, taskId);

      expect(result).toEqual(mockTask);
      expect(result.assignee).toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/assign`
      );
    });
  });

  describe('getTaskAttachments', () => {
    it('should call API client with correct endpoint', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockAttachments: Attachment[] = [
        {
          id: 'attachment-1',
          filename: 'document.pdf',
          fileType: 'application/pdf',
          fileSize: 1024000,
          cloudinaryUrl: 'https://res.cloudinary.com/example/file.pdf',
          entityType: 'TASK',
          entityId: taskId,
          uploadedAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          uploadedBy: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
            provider: null,
            providerId: null,
            bio: null,
            dob: null,
            phone: null,
            avatarUrl: '',
            isEmailConfirmed: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
      ];

      mockGet.mockResolvedValue({ data: mockAttachments });

      const result = await TasksService.getTaskAttachments(projectId, taskId);

      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/attachments`
      );
      expect(result).toEqual(mockAttachments);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no attachments', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockAttachments: Attachment[] = [];

      mockGet.mockResolvedValue({ data: mockAttachments });

      const result = await TasksService.getTaskAttachments(projectId, taskId);

      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/attachments`
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error when API call fails', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const mockError = new Error('Failed to fetch attachments');
      mockGet.mockRejectedValue(mockError);

      await expect(
        TasksService.getTaskAttachments(projectId, taskId)
      ).rejects.toThrow('Failed to fetch attachments');
      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/attachments`
      );
    });
  });

  describe('getTaskAttachment', () => {
    it('should call API client with correct endpoint', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const attachmentId = 'attachment-1';
      const mockAttachment: Attachment = {
        id: attachmentId,
        filename: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
        cloudinaryUrl: 'https://res.cloudinary.com/example/file.pdf',
        entityType: 'TASK',
        entityId: taskId,
        uploadedAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        uploadedBy: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          provider: null,
          providerId: null,
          bio: null,
          dob: null,
          phone: null,
          avatarUrl: '',
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      mockGet.mockResolvedValue({ data: mockAttachment });

      const result = await TasksService.getTaskAttachment(
        projectId,
        taskId,
        attachmentId
      );

      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`
      );
      expect(result).toEqual(mockAttachment);
    });

    it('should throw error when attachment not found', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const attachmentId = 'non-existent';
      const mockError = new Error('Attachment not found');
      mockGet.mockRejectedValue(mockError);

      await expect(
        TasksService.getTaskAttachment(projectId, taskId, attachmentId)
      ).rejects.toThrow('Attachment not found');
      expect(mockGet).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`
      );
    });
  });

  describe('uploadTaskAttachment', () => {
    it('should call API client with correct endpoint and form data', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const uploadRequest = { file };

      const mockAttachment: Attachment = {
        id: 'attachment-1',
        filename: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        cloudinaryUrl: 'https://res.cloudinary.com/example/test.pdf',
        entityType: 'TASK',
        entityId: taskId,
        uploadedAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        uploadedBy: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          provider: null,
          providerId: null,
          bio: null,
          dob: null,
          phone: null,
          avatarUrl: '',
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      };

      mockPost.mockResolvedValue({ data: mockAttachment });

      const result = await TasksService.uploadTaskAttachment(
        projectId,
        taskId,
        uploadRequest
      );

      expect(mockPost).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/attachments`,
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Verify FormData was created correctly
      const formDataCall = mockPost.mock.calls[0][1] as FormData;
      expect(formDataCall.get('file')).toBe(file);

      expect(result).toEqual(mockAttachment);
    });

    it('should throw error when upload fails', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const uploadRequest = { file };

      const mockError = new Error('Upload failed');
      mockPost.mockRejectedValue(mockError);

      await expect(
        TasksService.uploadTaskAttachment(projectId, taskId, uploadRequest)
      ).rejects.toThrow('Upload failed');
      expect(mockPost).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/attachments`,
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });
  });

  describe('deleteTaskAttachment', () => {
    it('should call API client with correct endpoint', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const attachmentId = 'attachment-1';

      mockDelete.mockResolvedValue({ data: undefined });

      await TasksService.deleteTaskAttachment(projectId, taskId, attachmentId);

      expect(mockDelete).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`
      );
    });

    it('should throw error when deletion fails', async () => {
      const projectId = 'project-123';
      const taskId = 'task-456';
      const attachmentId = 'attachment-1';

      const mockError = new Error('Deletion failed');
      mockDelete.mockRejectedValue(mockError);

      await expect(
        TasksService.deleteTaskAttachment(projectId, taskId, attachmentId)
      ).rejects.toThrow('Deletion failed');
      expect(mockDelete).toHaveBeenCalledWith(
        `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`
      );
    });
  });

  describe('Service behavior', () => {
    it('should use correct HTTP methods for each operation', async () => {
      // Mock all methods
      mockGet.mockResolvedValue({ data: {} });
      mockPost.mockResolvedValue({ data: {} });
      mockPut.mockResolvedValue({ data: {} });
      mockDelete.mockResolvedValue({ data: undefined });

      // Test each method
      await TasksService.getProjectTasks('1');
      await TasksService.searchProjectTasks('1');
      await TasksService.getTask('1', '1');
      await TasksService.createTask('1', { title: 'Test' });
      await TasksService.updateTask('1', '1', { title: 'Updated' });
      await TasksService.deleteTask('1', '1');
      await TasksService.updateTaskStatus('1', '1', { status: 'DONE' });
      await TasksService.assignTask('1', '1', { assigneeId: 'user-1' });
      await TasksService.getTaskAttachments('1', '1');
      await TasksService.getTaskAttachment('1', '1', 'attachment-1');
      await TasksService.uploadTaskAttachment('1', '1', {
        file: new File([''], 'test.pdf'),
      });
      await TasksService.deleteTaskAttachment('1', '1', 'attachment-1');

      // Verify correct methods were called
      expect(mockGet).toHaveBeenCalledTimes(5); // getProjectTasks + searchProjectTasks + getTask + getTaskAttachments + getTaskAttachment
      expect(mockPost).toHaveBeenCalledTimes(2); // createTask + uploadTaskAttachment
      expect(mockPut).toHaveBeenCalledTimes(3); // updateTask + updateTaskStatus + assignTask
      expect(mockDelete).toHaveBeenCalledTimes(2); // deleteTask + deleteTaskAttachment
    });
  });
});
