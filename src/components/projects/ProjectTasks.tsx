import { useState, useMemo, useCallback, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutList, FolderKanban } from 'lucide-react';
import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import ProjectTasksKanbanView from './ProjectTasksKanbanView';
import ProjectTasksListView from './ProjectTasksListView';
import { TASK_STATUSES, type TaskStatus, type Task } from '@/types/task';
import { useTranslations, type TranslationKey } from '@/hooks/useTranslations';
import { TaskListItem } from './TaskListItem';

const TASK_STATUS_SET: ReadonlySet<string> = new Set(TASK_STATUSES);
const isTaskStatus = (value: unknown): value is TaskStatus => {
  if (typeof value !== 'string') return false;
  return TASK_STATUS_SET.has(value);
};

type Props = {
  tasks: Task[];
  onTaskStatusChange: (
    taskId: string,
    newStatus: TaskStatus
  ) => void | Promise<void>;
  onDeleteTask: (taskId: string) => void;
  onAssignTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onCreateTask: () => void;
};

export const ProjectTasks = ({
  tasks,
  onTaskStatusChange,
  onDeleteTask,
  onAssignTask,
  onEditTask,
  onCreateTask,
}: Props) => {
  const { t } = useTranslations();
  type TaskViewMode = 'list' | 'kanban';
  const [viewMode, setViewMode] = useState<TaskViewMode>('list');
  const [kanbanNonce, setKanbanNonce] = useState<number>(0);
  const columns = useMemo(() => {
    const statusKeyByStatus: Record<TaskStatus, TranslationKey> = {
      TODO: 'tasks.status.todo',
      IN_PROGRESS: 'tasks.status.in_progress',
      DONE: 'tasks.status.done',
    } as const;
    return TASK_STATUSES.map(status => ({
      id: status,
      name: t(statusKeyByStatus[status]),
    }));
  }, [t]);
  const mappedTasks = useMemo(
    () =>
      tasks.map(task => ({
        id: task.id,
        name: task.title,
        column: task.status,
        assignee: task.assignee,
        dueDate: task.dueDate,
        raw: task,
      })),
    [tasks]
  );

  const handleKanbanDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        return;
      }
      const taskId = String(active.id);
      const overId = String(over.id);
      const targetColumn: TaskStatus | undefined = isTaskStatus(overId)
        ? overId
        : mappedTasks.find(item => item.id === overId)?.column;
      if (!targetColumn) {
        return;
      }
      const newStatus: TaskStatus = targetColumn;
      const task = tasks.find(t => t.id === taskId);
      if (!task || task.status === newStatus) {
        return;
      }
      try {
        const maybe = onTaskStatusChange(taskId, newStatus) as unknown;
        // Await if a promise was returned
        if (maybe && typeof (maybe as { then?: unknown }).then === 'function') {
          await (maybe as Promise<void>);
        }
      } catch {
        // Force remount Kanban to reset mutated in-memory board state
        setKanbanNonce(n => n + 1);
      }
    },
    [mappedTasks, onTaskStatusChange, tasks]
  );

  const VIEWS: Record<TaskViewMode, ReactNode> = useMemo(
    () => ({
      kanban: (
        <ProjectTasksKanbanView
          key={`kanban-${kanbanNonce}`}
          columns={columns}
          mappedTasks={mappedTasks}
          onDragEnd={handleKanbanDragEnd}
        />
      ),
      list: (
        <ProjectTasksListView
          tasks={tasks}
          onStatusChange={onTaskStatusChange}
          onDelete={onDeleteTask}
          onAssign={onAssignTask}
          onEdit={onEditTask}
          onCreate={onCreateTask}
          ctaLabel={t('projects.detail.createTask')}
          renderItem={task => (
            <TaskListItem
              task={task}
              onStatusChange={onTaskStatusChange}
              onDelete={onDeleteTask}
              onAssign={onAssignTask}
              onEdit={onEditTask}
            />
          )}
        />
      ),
    }),
    [
      kanbanNonce,
      columns,
      mappedTasks,
      handleKanbanDragEnd,
      tasks,
      onTaskStatusChange,
      onDeleteTask,
      onAssignTask,
      onEditTask,
      onCreateTask,
      t,
    ]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-base font-semibold text-foreground">
          {t('projects.detail.tasks')}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            data-testid="toggle-list-view"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
            size="icon"
            aria-label="Kanban view"
            aria-pressed={viewMode === 'kanban'}
            data-testid="toggle-kanban-view"
            className="h-8 w-8"
            onClick={() => setViewMode('kanban')}
          >
            <FolderKanban className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {VIEWS[viewMode]}
    </div>
  );
};
