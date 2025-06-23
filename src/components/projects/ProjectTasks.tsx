import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  CheckSquare,
  MoreHorizontal,
  User,
  SquareCheckBig,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task } from '@/types/task';

type Props = {
  tasks: Task[];
  onTaskToggle?: (taskId: string) => void;
  onTaskAction?: (taskId: string) => void;
  onCreateTask?: () => void;
};

export const ProjectTasks = ({
  tasks,
  onTaskToggle,
  onTaskAction,
  onCreateTask,
}: Props) => {
  const { t } = useTranslations();

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    return {
      formatted: date.toLocaleDateString(),
      isToday,
    };
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
        {t('projects.detail.tasks')}
      </h3>

      {tasks.length > 0 ? (
        <div className="space-y-3 pl-4">
          {tasks.map(task => {
            const dueDateInfo = formatDueDate(task.dueDate);

            return (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border border-border/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    className="flex items-center justify-center w-5 h-5 border border-border rounded bg-background hover:bg-muted transition-colors"
                    onClick={() => onTaskToggle?.(task.id)}
                  >
                    {task.status === 'DONE' && (
                      <CheckSquare className="h-3 w-3 text-primary" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {task.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(task.status)}`}
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <span
                        className={`text-xs font-medium ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {task.assigneeId && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Assigned</span>
                    </div>
                  )}

                  {dueDateInfo && (
                    <Badge
                      variant={dueDateInfo.isToday ? 'destructive' : 'outline'}
                      className="text-xs font-normal"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {dueDateInfo.isToday ? 'Today' : dueDateInfo.formatted}
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                    onClick={() => onTaskAction?.(task.id)}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}

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
