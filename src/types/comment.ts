import type { User } from './user';

export type TaskComment = {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
};
