import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  MoreHorizontal,
  User,
  Trash2,
  UserPlus,
  Edit3,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task, TaskStatus } from '@/types/task';

// Define status transition mapping
const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['TODO', 'IN_PROGRESS'],
  IN_PROGRESS: ['TODO', 'IN_PROGRESS', 'DONE'],
  DONE: ['IN_PROGRESS', 'DONE'],
};

type Props = {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  onAssign?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
};

const formatDueDate = (dueDate?: string) => {
  if (!dueDate) return null;

  const date = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) {
    return { formatted: 'Today', isToday: true };
  } else if (isTomorrow) {
    return { formatted: 'Tomorrow', isToday: false };
  } else {
    return { formatted: date.toLocaleDateString(), isToday: false };
  }
};

const getPriorityVariant = (priority: Task['priority']) => {
  switch (priority) {
    case 'HIGH':
      return 'destructive' as const;
    case 'MEDIUM':
      return 'default' as const;
    case 'LOW':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
};

// Get available status transitions for a given current status
const getAvailableStatuses = (currentStatus: TaskStatus): TaskStatus[] => {
  return STATUS_TRANSITIONS[currentStatus] || [currentStatus];
};

export const TaskListItem = ({
  task,
  onStatusChange,
  onDelete,
  onAssign,
  onEdit,
}: Props) => {
  const { t } = useTranslations();
  const dueDateInfo = formatDueDate(task.dueDate);

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

  const getPriorityLabel = (priority: Task['priority']): string => {
    return t(`tasks.priority.${priority}`);
  };

  return (
    <div className="flex items-start gap-2 p-2 sm:p-3 border border-border/30 rounded-lg hover:bg-secondary/50 transition-colors">
      {/* Status Dropdown - Compact */}
      <div className="flex-shrink-0">
        <Select
          value={task.status}
          onValueChange={(newStatus: TaskStatus) =>
            onStatusChange?.(task.id, newStatus)
          }
        >
          <SelectTrigger
            className="w-20 h-7 text-xs px-2"
            data-testid={`task-status-${task.id}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getAvailableStatuses(task.status).map(status => (
              <SelectItem
                key={status}
                value={status}
                data-testid={`task-status-option-${task.id}-${status}`}
              >
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
            <Badge
              variant={getPriorityVariant(task.priority)}
              className="h-5 px-2 text-xs"
            >
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Right Side Actions - Fixed Width */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {task.assigneeId && (
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="h-3 w-3" />
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => onEdit?.(task.id)}
              className="cursor-pointer"
            >
              <Edit3 className="h-3 w-3 mr-2" />
              {t('tasks.actions.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAssign?.(task.id)}
              className="cursor-pointer"
            >
              <UserPlus className="h-3 w-3 mr-2" />
              {t('tasks.actions.assign')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(task.id)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-2 text-destructive" />
              {t('tasks.actions.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
