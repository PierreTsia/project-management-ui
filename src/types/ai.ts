export type AiPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type GenerateTasksRequest = {
  prompt: string;
  projectId?: string;
  locale?: string;
};

export type GeneratedTask = {
  title: string;
  description?: string;
  priority?: AiPriority;
};

export type GenerateTasksResponse = {
  tasks: ReadonlyArray<GeneratedTask>;
  meta?: { model?: string; provider?: string; degraded?: boolean };
};
