import { describe, it, expect } from 'vitest';
import {
  createMock,
  createMockArray,
  createMockArrayWithFactory,
  createMockUser,
  createMockUsers,
  createMockTask,
  createMockTasks,
  createMockTaskWithoutAssignee,
  createMockTaskWithAssignee,
  createMockTaskComment,
  createMockTaskComments,
  createMockTaskCommentWithUser,
} from '../mock-factories';
import type { User } from '../../types/user';
import type { Task } from '../../types/task';

describe('Mock Factories', () => {
  describe('createMock', () => {
    it('should create object with default values', () => {
      const defaults = { name: 'test', value: 42, active: true };
      const result = createMock(defaults);

      expect(result).toEqual(defaults);
      expect(result).not.toBe(defaults); // Should be a new object
    });

    it('should override default values', () => {
      const defaults = { name: 'test', value: 42, active: true };
      const overrides = { value: 100 };
      const result = createMock(defaults, overrides);

      expect(result).toEqual({
        name: 'test',
        value: 100,
        active: true,
      });
    });

    it('should work with empty overrides', () => {
      const defaults = { name: 'test' };
      const result = createMock(defaults, {});

      expect(result).toEqual(defaults);
    });
  });

  describe('createMockArray', () => {
    it('should create array of objects with default values', () => {
      const defaults = { name: 'test', value: 42 };
      const result = createMockArray(defaults, 3);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(defaults);
      expect(result[1]).toEqual(defaults);
      expect(result[2]).toEqual(defaults);
      // Should be different objects
      expect(result[0]).not.toBe(result[1]);
    });

    it('should apply overrides to specific items', () => {
      const defaults = { name: 'test', value: 42 };
      const overrides = [
        { name: 'first' },
        { value: 100 },
        { name: 'third', value: 200 },
      ];
      const result = createMockArray(defaults, 3, overrides);

      expect(result).toEqual([
        { name: 'first', value: 42 },
        { name: 'test', value: 100 },
        { name: 'third', value: 200 },
      ]);
    });

    it('should handle fewer overrides than count', () => {
      const defaults = { name: 'test', value: 42 };
      const overrides = [{ name: 'first' }];
      const result = createMockArray(defaults, 3, overrides);

      expect(result).toEqual([
        { name: 'first', value: 42 },
        { name: 'test', value: 42 },
        { name: 'test', value: 42 },
      ]);
    });
  });

  describe('createMockArrayWithFactory', () => {
    it('should create array using factory function', () => {
      const factory = (index: number) => ({
        id: `item-${index}`,
        value: index * 10,
      });
      const result = createMockArrayWithFactory(factory, 3);

      expect(result).toEqual([
        { id: 'item-0', value: 0 },
        { id: 'item-1', value: 10 },
        { id: 'item-2', value: 20 },
      ]);
    });

    it('should handle zero count', () => {
      const factory = (index: number) => ({ id: index });
      const result = createMockArrayWithFactory(factory, 0);

      expect(result).toEqual([]);
    });
  });

  describe('createMockUser', () => {
    it('should create user with default values', () => {
      const user = createMockUser();

      expect(user).toEqual({
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        provider: null,
        providerId: null,
        bio: null,
        dob: null,
        phone: null,
        avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=user',
        isEmailConfirmed: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });
    });

    it('should override specific user properties', () => {
      const user = createMockUser({
        id: 'custom-id',
        name: 'Custom Name',
        email: 'custom@example.com',
        provider: 'google',
      });

      expect(user.id).toBe('custom-id');
      expect(user.name).toBe('Custom Name');
      expect(user.email).toBe('custom@example.com');
      expect(user.provider).toBe('google');
      // Other properties should remain default
      expect(user.isEmailConfirmed).toBe(true);
      expect(user.bio).toBe(null);
    });

    it('should return properly typed User object', () => {
      const user: User = createMockUser();

      // TypeScript compilation test - these should not cause type errors
      expect(typeof user.id).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.isEmailConfirmed).toBe('boolean');
    });
  });

  describe('createMockUsers', () => {
    it('should create multiple users with auto-generated IDs', () => {
      const users = createMockUsers(3);

      expect(users).toHaveLength(3);
      expect(users[0].id).toBe('user-1');
      expect(users[1].id).toBe('user-2');
      expect(users[2].id).toBe('user-3');
      expect(users[0].email).toBe('user1@example.com');
      expect(users[1].email).toBe('user2@example.com');
      expect(users[2].email).toBe('user3@example.com');
    });

    it('should apply overrides to specific users', () => {
      const overrides = [
        { name: 'Alice' },
        { name: 'Bob', email: 'bob@custom.com' },
      ];
      const users = createMockUsers(3, overrides);

      expect(users[0].name).toBe('Alice');
      expect(users[0].id).toBe('user-1'); // Auto-generated ID
      expect(users[1].name).toBe('Bob');
      expect(users[1].email).toBe('bob@custom.com');
      expect(users[2].name).toBe('Test User 3'); // Default pattern
    });

    it('should handle zero count', () => {
      const users = createMockUsers(0);
      expect(users).toEqual([]);
    });
  });

  describe('createMockTask', () => {
    it('should create task with default values (no assignee)', () => {
      const task = createMockTask();

      expect(task).toEqual({
        id: 'task-123',
        title: 'Test Task',
        description: 'A test task description',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '2024-12-31T23:59:59.999Z',
        projectId: 'project-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });
      expect(task.assignee).toBeUndefined();
    });

    it('should override specific task properties', () => {
      const assignee = createMockUser({ id: 'assignee-1' });
      const task = createMockTask({
        id: 'custom-task',
        title: 'Custom Task',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee,
      });

      expect(task.id).toBe('custom-task');
      expect(task.title).toBe('Custom Task');
      expect(task.status).toBe('IN_PROGRESS');
      expect(task.priority).toBe('HIGH');
      expect(task.assignee).toEqual(assignee);
      // Other properties should remain default
      expect(task.projectId).toBe('project-123');
    });

    it('should return properly typed Task object', () => {
      const task: Task = createMockTask();

      // TypeScript compilation test
      expect(typeof task.id).toBe('string');
      expect(typeof task.title).toBe('string');
      expect(['TODO', 'IN_PROGRESS', 'DONE']).toContain(task.status);
    });
  });

  describe('createMockTasks', () => {
    it('should create multiple tasks with auto-generated IDs', () => {
      const tasks = createMockTasks(3);

      expect(tasks).toHaveLength(3);
      expect(tasks[0].id).toBe('task-1');
      expect(tasks[1].id).toBe('task-2');
      expect(tasks[2].id).toBe('task-3');
      expect(tasks[0].title).toBe('Test Task 1');
      expect(tasks[1].title).toBe('Test Task 2');
      expect(tasks[2].title).toBe('Test Task 3');
    });

    it('should apply overrides to specific tasks', () => {
      const user = createMockUser({ id: 'assignee' });
      const overrides = [
        { status: 'DONE' as const },
        { assignee: user, priority: 'HIGH' as const },
      ];
      const tasks = createMockTasks(3, overrides);

      expect(tasks[0].status).toBe('DONE');
      expect(tasks[1].assignee).toEqual(user);
      expect(tasks[1].priority).toBe('HIGH');
      expect(tasks[2].status).toBe('TODO'); // Default
    });
  });

  describe('createMockTaskWithoutAssignee', () => {
    it('should create task without assignee', () => {
      const task = createMockTaskWithoutAssignee();

      expect(task.assignee).toBeUndefined();
      expect(task.title).toBe('Test Task'); // Other defaults should apply
    });

    it('should apply overrides while keeping assignee undefined', () => {
      const task = createMockTaskWithoutAssignee({
        title: 'Unassigned Task',
        priority: 'HIGH',
      });

      expect(task.assignee).toBeUndefined();
      expect(task.title).toBe('Unassigned Task');
      expect(task.priority).toBe('HIGH');
    });
  });

  describe('createMockTaskWithAssignee', () => {
    it('should create task with specific assignee', () => {
      const assignee = createMockUser({ name: 'Assigned User' });
      const task = createMockTaskWithAssignee(assignee);

      expect(task.assignee).toEqual(assignee);
      expect(task.title).toBe('Test Task'); // Other defaults should apply
    });

    it('should apply overrides while keeping specific assignee', () => {
      const assignee = createMockUser({ name: 'Assigned User' });
      const task = createMockTaskWithAssignee(assignee, {
        title: 'Assigned Task',
        status: 'IN_PROGRESS',
      });

      expect(task.assignee).toEqual(assignee);
      expect(task.title).toBe('Assigned Task');
      expect(task.status).toBe('IN_PROGRESS');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle nested object creation', () => {
      const users = createMockUsers(2, [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' },
      ]);

      const tasks = createMockTasks(3, [
        { assignee: users[0], status: 'IN_PROGRESS' },
        { assignee: users[1], status: 'DONE' },
        { status: 'TODO' }, // No assignee
      ]);

      expect(tasks[0].assignee?.name).toBe('Alice');
      expect(tasks[1].assignee?.name).toBe('Bob');
      expect(tasks[2].assignee).toBeUndefined();
      expect(tasks[0].status).toBe('IN_PROGRESS');
      expect(tasks[1].status).toBe('DONE');
      expect(tasks[2].status).toBe('TODO');
    });

    it('should create independent objects (no shared references)', () => {
      const user1 = createMockUser({ name: 'User 1' });
      const user2 = createMockUser({ name: 'User 2' });

      expect(user1).not.toBe(user2);
      expect(user1.name).not.toBe(user2.name);

      const task1 = createMockTask({ title: 'Task 1' });
      const task2 = createMockTask({ title: 'Task 2' });

      expect(task1).not.toBe(task2);
      expect(task1.title).not.toBe(task2.title);
    });
  });

  describe('createMockTaskComment', () => {
    it('should create a task comment with default values', () => {
      const comment = createMockTaskComment();

      expect(comment).toEqual({
        id: 'comment-123',
        content: 'This is a test comment',
        taskId: 'task-123',
        userId: 'user-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          provider: null,
          providerId: null,
          bio: null,
          dob: null,
          phone: null,
          avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=user',
          isEmailConfirmed: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      });
    });

    it('should create a task comment with overrides', () => {
      const comment = createMockTaskComment({
        id: 'custom-comment',
        content: 'Custom comment content',
        taskId: 'custom-task',
      });

      expect(comment.id).toBe('custom-comment');
      expect(comment.content).toBe('Custom comment content');
      expect(comment.taskId).toBe('custom-task');
      expect(comment.userId).toBe('user-123'); // default value
    });
  });

  describe('createMockTaskComments', () => {
    it('should create an array of task comments with default values', () => {
      const comments = createMockTaskComments(3);

      expect(comments).toHaveLength(3);
      expect(comments[0].id).toBe('comment-1');
      expect(comments[0].content).toBe('Test comment 1');
      expect(comments[0].user.id).toBe('user-1');
      expect(comments[1].id).toBe('comment-2');
      expect(comments[1].content).toBe('Test comment 2');
      expect(comments[1].user.id).toBe('user-2');
    });

    it('should create an array of task comments with overrides', () => {
      const comments = createMockTaskComments(2, [
        { content: 'First custom comment' },
        { content: 'Second custom comment', taskId: 'custom-task' },
      ]);

      expect(comments).toHaveLength(2);
      expect(comments[0].content).toBe('First custom comment');
      expect(comments[1].content).toBe('Second custom comment');
      expect(comments[1].taskId).toBe('custom-task');
    });
  });

  describe('createMockTaskCommentWithUser', () => {
    it('should create a task comment with the specified user', () => {
      const user = createMockUser({ id: 'author-1', name: 'Comment Author' });
      const comment = createMockTaskCommentWithUser(user, {
        id: 'user-comment',
        content: 'Comment by specific user',
      });

      expect(comment).toEqual({
        id: 'user-comment',
        content: 'Comment by specific user',
        taskId: 'task-123',
        userId: 'author-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        user: user,
      });
    });
  });
});
