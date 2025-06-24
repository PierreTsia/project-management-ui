import { Button } from '@/components/ui/button';
import { SquareCheckBig } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task, TaskStatus } from '@/types/task';
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

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
        {t('projects.detail.tasks')}
      </h3>

      {tasks.length > 0 ? (
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
      ) : (
        <div className="flex items-center justify-center py-8 pl-4">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('projects.detail.noTasksYet')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCreateTask?.()}
            >
              <SquareCheckBig className="h-4 w-4 mr-2" />
              {t('projects.detail.createFirstTask')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
