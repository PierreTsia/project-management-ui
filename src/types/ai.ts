export type AiPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type GenerateTasksRequest = {
  prompt: string;
  projectId?: string;
  locale?: string;
  options?: Record<string, string | number | boolean>;
};

export type GeneratedTask = {
  title: string;
  description?: string;
  priority?: AiPriority;
};

export type GenerateTasksResponse = {
  tasks: ReadonlyArray<GeneratedTask>;
  meta?: {
    model?: string;
    provider?: string;
    degraded?: boolean;
    locale?: string;
    options?: Record<string, string | number | boolean>;
  };
};
