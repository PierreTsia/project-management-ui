import { useState, useMemo, useCallback, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutList, FolderKanban } from 'lucide-react';
import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import ProjectTasksKanbanView from './ProjectTasksKanbanView';
import ProjectSmartTaskList from './ProjectSmartTaskList';
import { TASK_STATUSES, type TaskStatus, type Task } from '@/types/task';
import { isTaskStatus } from '@/types/guards';
import { useTranslations, type TranslationKey } from '@/hooks/useTranslations';

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
  const columns = useMemo(() => {
    const statusKeyByStatus: Record<TaskStatus, TranslationKey> = {
      TODO: 'tasks.status.todo',
      IN_PROGRESS: 'tasks.status.in_progress',
      DONE: 'tasks.status.done',
    } as const;
    return TASK_STATUSES.map(status => ({
      id: status,
      name: t(statusKeyByStatus[status]),
      count: tasks.filter(task => task.status === status).length,
    }));
  }, [t, tasks]);

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
        return Promise.resolve(onTaskStatusChange(taskId, newStatus));
      } catch {
        return Promise.reject(new Error('Failed to update task status'));
      }
    },
    [mappedTasks, onTaskStatusChange, tasks]
  );

  const VIEWS: Record<TaskViewMode, ReactNode> = useMemo(
    () => ({
      kanban: (
        <ProjectTasksKanbanView
          key={`kanban`}
          columns={columns}
          mappedTasks={mappedTasks}
          onDragEnd={handleKanbanDragEnd}
          onDragStart={() => {}}
          onEdit={onEditTask}
          onAssign={onAssignTask}
          onDelete={onDeleteTask}
        />
      ),
      list: (
        <ProjectSmartTaskList
          tasks={tasks}
          onStatusChange={onTaskStatusChange}
          onDelete={onDeleteTask}
          onAssign={onAssignTask}
          onEdit={onEditTask}
          onCreate={onCreateTask}
        />
      ),
    }),
    [
      columns,
      mappedTasks,
      handleKanbanDragEnd,
      tasks,
      onTaskStatusChange,
      onDeleteTask,
      onAssignTask,
      onEditTask,
      onCreateTask,
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
