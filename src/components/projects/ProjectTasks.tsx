import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { SquareCheckBig, LayoutList, FolderKanban } from 'lucide-react';
import KanbanProvider, {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
} from '@/components/ui/shadcn-io/kanban';
import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TASK_STATUSES, type TaskStatus, type Task } from '@/types/task';
import { useTranslations, type TranslationKey } from '@/hooks/useTranslations';
import { AnimatedList } from '@/components/ui/animated-list';
import { TaskListItem } from './TaskListItem';

type Props = {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void;
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
  const statusKeyByStatus: Record<TaskStatus, TranslationKey> = {
    TODO: 'tasks.status.todo',
    IN_PROGRESS: 'tasks.status.in_progress',
    DONE: 'tasks.status.done',
  } as const;
  const columns = TASK_STATUSES.map(status => ({
    id: status,
    name: t(statusKeyByStatus[status]),
  }));
  const mappedTasks = tasks.map(task => ({
    id: task.id,
    name: task.title,
    column: task.status,
    assignee: task.assignee,
    dueDate: task.dueDate,
    raw: task,
  }));

  const handleKanbanDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const taskId = String(active.id);
    const overId = String(over.id);
    const isOverColumn = columns.some(c => c.id === overId);
    const targetColumn = isOverColumn
      ? overId
      : mappedTasks.find(item => item.id === overId)?.column;
    if (!targetColumn) {
      return;
    }
    const newStatus = targetColumn;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) {
      return;
    }
    onTaskStatusChange(taskId, newStatus);
  };

  let body: ReactNode;
  if (viewMode === 'kanban') {
    body = (
      <div className="space-y-3">
        <KanbanProvider
          columns={columns}
          data={mappedTasks}
          onDragEnd={handleKanbanDragEnd}
        >
          {column => (
            <KanbanBoard id={column.id} key={column.id}>
              <KanbanHeader>
                <div className="flex items-center gap-2">
                  <span>{column.name}</span>
                </div>
              </KanbanHeader>
              <KanbanCards id={column.id}>
                {(item: (typeof mappedTasks)[number]) => (
                  <KanbanCard
                    column={column.id}
                    id={item.id}
                    key={item.id}
                    name={item.name}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="m-0 flex-1 font-medium text-sm">
                          {item.name}
                        </p>
                      </div>
                      {item.assignee && (
                        <Avatar className="h-4 w-4 shrink-0">
                          <AvatarImage src={item.assignee.avatarUrl} />
                          <AvatarFallback>
                            {item.assignee.name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    {item.dueDate && (
                      <p className="m-0 text-muted-foreground text-xs">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </KanbanCard>
                )}
              </KanbanCards>
            </KanbanBoard>
          )}
        </KanbanProvider>
      </div>
    );
  } else if (tasks.length > 0) {
    body = (
      <div className="space-y-3 px-2 sm:px-4">
        <AnimatedList
          items={tasks}
          getKey={task => task.id}
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

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => onCreateTask?.()}
          >
            <SquareCheckBig className="h-3 w-3 mr-1" />
            {t('projects.detail.createTask')}
          </Button>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="flex items-center justify-center py-8 pl-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('projects.detail.noTasksYet')}
          </p>
          <Button variant="outline" size="sm" onClick={() => onCreateTask?.()}>
            <SquareCheckBig className="h-4 w-4 mr-2" />
            {t('projects.detail.createFirstTask')}
          </Button>
        </div>
      </div>
    );
  }

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

      {body}
    </div>
  );
};
