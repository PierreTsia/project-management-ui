import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, MoreHorizontal, User, SquareCheckBig } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task, TaskStatus } from '@/types/task';

type Props = {
  tasks: Task[];
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onTaskAction?: (taskId: string) => void;
  onCreateTask?: () => void;
};

export const ProjectTasks = ({
  tasks,
  onTaskStatusChange,
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

  // Get available status transitions for a given current status
  const getAvailableStatuses = (currentStatus: TaskStatus): TaskStatus[] => {
    switch (currentStatus) {
      case 'TODO':
        return ['TODO', 'IN_PROGRESS'];
      case 'IN_PROGRESS':
        return ['TODO', 'IN_PROGRESS', 'DONE'];
      case 'DONE':
        return ['IN_PROGRESS', 'DONE'];
      default:
        return [currentStatus];
    }
  };

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case 'TODO':
        return t('tasks.status.todo');
      case 'IN_PROGRESS':
        return t('tasks.status.inProgress');
      case 'DONE':
        return t('tasks.status.done');
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
                className="flex items-start gap-3 p-3 border border-border/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                {/* Status Dropdown - Fixed Width */}
                <div className="flex-shrink-0">
                  <Select
                    value={task.status}
                    onValueChange={(newStatus: TaskStatus) =>
                      onTaskStatusChange?.(task.id, newStatus)
                    }
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableStatuses(task.status).map(status => (
                        <SelectItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Task Content - Takes Available Space */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground flex-1 truncate">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs font-medium ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Right Side Actions - Fixed Width */}
                <div className="flex items-center gap-3 flex-shrink-0">
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
