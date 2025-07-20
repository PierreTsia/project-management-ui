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
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  Calendar,
  MoreHorizontal,
  Trash2,
  UserPlus,
  Edit3,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task, TaskStatus } from '@/types/task';
import { Link } from 'react-router-dom';

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
        return t('tasks.status.in_progress');
      case 'DONE':
        return t('tasks.status.done');
    }
  };

  const getPriorityLabel = (priority: Task['priority']): string => {
    return t(`tasks.priority.${priority}`);
  };

  return (
    <div className="flex items-start gap-3 p-3 sm:p-4 border border-border/30 rounded-lg hover:bg-secondary/50 transition-all duration-200 group">
      {/* Status Dropdown - Compact */}
      <div className="flex-shrink-0 pt-0.5">
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

      {/* Main Content Area */}
      <Link
        to={`/projects/${task.projectId}/${task.id}`}
        data-testid={`task-link-${task.id}`}
        className="flex-1 min-w-0 group-hover:bg-muted/20 rounded-md p-2 -m-2 transition-colors"
      >
        <div className="space-y-1.5">
          {/* Title and Priority Row */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Badge
                variant={getPriorityVariant(task.priority)}
                className="h-5 px-2 text-xs font-medium"
              >
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
            <h4 className="text-sm font-medium text-foreground flex-1 leading-tight">
              {task.title}
            </h4>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </Link>
      {/* Right Side Actions - Properly Aligned */}
      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
        {/* Assignee Avatar - Consistent Size */}
        {task.assignee && (
          <div className="flex-shrink-0">
            <UserAvatar user={task.assignee} size="sm" />
          </div>
        )}

        {/* Due Date Badge - Consistent Height */}
        {dueDateInfo && (
          <div className="flex-shrink-0">
            <Badge
              variant={dueDateInfo.isToday ? 'destructive' : 'outline'}
              className="h-6 px-2 text-xs font-normal flex items-center gap-1"
            >
              <Calendar className="h-3 w-3" />
              <span>
                {dueDateInfo.isToday ? 'Today' : dueDateInfo.formatted}
              </span>
            </Badge>
          </div>
        )}

        {/* Actions Menu - Consistent Positioning */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100 hover:bg-muted/50 transition-all duration-200"
                data-testid={`task-${task.id}-actions-button`}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => onEdit?.(task.id)}
                className="cursor-pointer"
                data-testid={`task-${task.id}-edit-option`}
              >
                <Edit3 className="h-3 w-3 mr-2" />
                {t('tasks.actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAssign?.(task.id)}
                className="cursor-pointer"
                data-testid={`task-${task.id}-assign-option`}
              >
                <UserPlus className="h-3 w-3 mr-2" />
                {t('tasks.actions.assign')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(task.id)}
                className="cursor-pointer text-destructive focus:text-destructive"
                data-testid={`task-${task.id}-delete-option`}
              >
                <Trash2 className="h-3 w-3 mr-2 text-destructive" />
                {t('tasks.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
