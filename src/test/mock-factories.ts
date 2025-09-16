import type { User } from '../types/user';
import type { Task } from '../types/task';
import type { TaskComment } from '../types/comment';

/**
 * Generic factory function that creates mock objects with default values and allows overrides
 * @param defaults - Default values for the object
 * @param overrides - Partial object to override default values
 * @returns Complete typed object
 */
export function createMock<T>(defaults: T, overrides: Partial<T> = {}): T {
  return { ...defaults, ...overrides };
}

/**
 * Creates an array of mock objects with optional overrides for each item
 * @param defaults - Default values for each object
 * @param count - Number of objects to create
 * @param overridesArray - Array of partial objects to override defaults for each item
 * @returns Array of typed objects
 */
export function createMockArray<T>(
  defaults: T,
  count: number,
  overridesArray: Partial<T>[] = []
): T[] {
  return Array.from({ length: count }, (_, index) => {
    const overrides = overridesArray[index] || {};
    return createMock(defaults, overrides);
  });
}

/**
 * Creates an array of mock objects using a factory function
 * @param factory - Factory function that takes an index and returns an object
 * @param count - Number of objects to create
 * @returns Array of typed objects
 */
export function createMockArrayWithFactory<T>(
  factory: (index: number) => T,
  count: number
): T[] {
  return Array.from({ length: count }, (_, index) => factory(index));
}

// Default User template
const DEFAULT_USER: User = {
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
};

// Default Task template
const DEFAULT_TASK: Task = {
  id: 'task-123',
  title: 'Test Task',
  description: 'A test task description',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '2024-12-31T23:59:59.999Z',
  projectId: 'project-123',
  projectName: 'Test Project',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Creates a mock User with optional overrides
 * @param overrides - Partial User object to override defaults
 * @returns Complete User object
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return createMock(DEFAULT_USER, overrides);
}

/**
 * Creates an array of mock Users
 * @param count - Number of users to create
 * @param overridesArray - Array of partial User objects to override defaults for each user
 * @returns Array of User objects
 */
export function createMockUsers(
  count: number,
  overridesArray: Partial<User>[] = []
): User[] {
  return createMockArrayWithFactory(index => {
    const overrides = overridesArray[index] || {};
    return createMockUser({
      id: `user-${index + 1}`,
      email: `user${index + 1}@example.com`,
      name: `Test User ${index + 1}`,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=user${index + 1}`,
      ...overrides,
    });
  }, count);
}

/**
 * Creates a mock Task with optional overrides
 * @param overrides - Partial Task object to override defaults
 * @returns Complete Task object
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
  return createMock(DEFAULT_TASK, overrides);
}

/**
 * Creates an array of mock Tasks
 * @param count - Number of tasks to create
 * @param overridesArray - Array of partial Task objects to override defaults for each task
 * @returns Array of Task objects
 */
export function createMockTasks(
  count: number,
  overridesArray: Partial<Task>[] = []
): Task[] {
  return createMockArrayWithFactory(index => {
    const overrides = overridesArray[index] || {};
    return createMockTask({
      id: `task-${index + 1}`,
      title: `Test Task ${index + 1}`,
      description: `Description for test task ${index + 1}`,
      ...overrides,
    });
  }, count);
}

/**
 * Creates a mock Task without an assignee
 * @param overrides - Partial Task object to override defaults
 * @returns Complete Task object without assignee
 */
export function createMockTaskWithoutAssignee(
  overrides: Partial<Task> = {}
): Task {
  return createMockTask(overrides);
}

/**
 * Creates a mock Task with a specific assignee
 * @param assignee - User to assign to the task
 * @param overrides - Partial Task object to override defaults
 * @returns Complete Task object with assignee
 */
export function createMockTaskWithAssignee(
  assignee: User,
  overrides: Partial<Task> = {}
): Task {
  return createMockTask({
    assignee,
    ...overrides,
  });
}

// Default TaskComment template
const DEFAULT_TASK_COMMENT: TaskComment = {
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
};

/**
 * Creates a mock TaskComment with optional overrides
 * @param overrides - Partial TaskComment object to override defaults
 * @returns Complete TaskComment object
 */
export function createMockTaskComment(
  overrides: Partial<TaskComment> = {}
): TaskComment {
  return createMock(DEFAULT_TASK_COMMENT, overrides);
}

/**
 * Creates an array of mock TaskComments
 * @param count - Number of comments to create
 * @param overridesArray - Array of partial TaskComment objects to override defaults for each comment
 * @returns Array of TaskComment objects
 */
export function createMockTaskComments(
  count: number,
  overridesArray: Partial<TaskComment>[] = []
): TaskComment[] {
  return createMockArrayWithFactory(index => {
    const overrides = overridesArray[index] || {};
    return createMockTaskComment({
      id: `comment-${index + 1}`,
      content: `Test comment ${index + 1}`,
      user: createMockUser({
        id: `user-${index + 1}`,
        email: `user${index + 1}@example.com`,
        name: `Test User ${index + 1}`,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=user${index + 1}`,
      }),
      ...overrides,
    });
  }, count);
}

/**
 * Creates a mock TaskComment with a specific user
 * @param user - User to associate with the comment
 * @param overrides - Partial TaskComment object to override defaults
 * @returns Complete TaskComment object with user
 */
export function createMockTaskCommentWithUser(
  user: User,
  overrides: Partial<TaskComment> = {}
): TaskComment {
  return createMockTaskComment({
    user,
    userId: user.id,
    ...overrides,
  });
}
