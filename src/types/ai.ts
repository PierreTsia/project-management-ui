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

// Linked tasks preview/confirm types

export type RelationshipType =
  | 'BLOCKS'
  | 'IS_BLOCKED_BY'
  | 'DUPLICATES'
  | 'IS_DUPLICATED_BY'
  | 'SPLITS_TO'
  | 'SPLITS_FROM'
  | 'RELATES_TO';

export type PlaceholderId = string; // e.g., "task_1"

export type TaskRelationshipPreview = {
  sourceTask: PlaceholderId;
  targetTask: PlaceholderId;
  type: RelationshipType;
};

export type GenerateLinkedTasksPreviewRequest = {
  prompt: string;
  projectId: string;
  locale?: string;
  options?: Record<string, string | number | boolean>;
};

export type GenerateLinkedTasksPreviewResponse = {
  tasks: ReadonlyArray<GeneratedTask & { id: PlaceholderId }>;
  relationships: ReadonlyArray<TaskRelationshipPreview>;
  meta?: {
    model?: string;
    provider?: string;
    locale?: string;
    placeholderMode?: boolean;
    options?: Record<string, string | number | boolean>;
  };
};

export type ConfirmLinkedTasksRequest = {
  projectId: string;
  tasks: ReadonlyArray<GeneratedTask>;
  relationships: ReadonlyArray<{
    sourceTask: string;
    targetTask: string;
    type: RelationshipType;
  }>;
};

export type ConfirmLinkedTasksResponse = {
  createdTaskIds: ReadonlyArray<string>;
  createdRelationships: ReadonlyArray<{
    fromTaskId: string;
    toTaskId: string;
    type: RelationshipType;
  }>;
  rejectedRelationships: ReadonlyArray<{
    from: PlaceholderId | string;
    to: PlaceholderId | string;
    type: RelationshipType;
    reason: string;
  }>;
  counts: {
    totalLinks: number;
    createdLinks: number;
    rejectedLinks: number;
  };
};
