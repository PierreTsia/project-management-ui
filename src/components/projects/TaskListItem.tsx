import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import {
  getPriorityVariant,
  formatDueDate,
  getAvailableStatuses,
} from '@/lib/task-helpers';
import { useUser } from '@/hooks/useUser';

type Props = {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  onAssign?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
};

export const TaskListItem = ({
  task,
  onStatusChange,
  onDelete,
  onAssign,
  onEdit,
}: Props) => {
  const { t } = useTranslations();
  const { data: currentUser } = useUser();
  const dueDateInfo = formatDueDate(task.dueDate);

  const isAssignee =
    currentUser && task.assignee && currentUser.id === task.assignee.id;

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
    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-4 border border-border/30 rounded-lg hover:bg-secondary/50 transition-all duration-200 group">
      {/* Status Dropdown - Smaller on mobile */}
      <div className="flex-shrink-0 pt-0.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Select
                  value={task.status}
                  onValueChange={(newStatus: TaskStatus) =>
                    onStatusChange?.(task.id, newStatus)
                  }
                  disabled={!isAssignee}
                >
                  <SelectTrigger
                    className="w-16 sm:w-20 h-6 sm:h-7 text-xs px-1 sm:px-2"
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
            </TooltipTrigger>
            {!isAssignee && task.assignee && (
              <TooltipContent>
                <p>{t('tasks.status.onlyAssigneeCanUpdate')}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Main Content Area */}
      <Link
        to={`/projects/${task.projectId}/${task.id}`}
        data-testid={`task-link-${task.id}`}
        className="flex-1 min-w-0 group-hover:bg-muted/20 rounded-md p-1 sm:p-2 -m-1 sm:-m-2 transition-colors"
      >
        <div className="space-y-1 sm:space-y-1.5">
          {/* Title and Priority Row - Stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <div className="flex-shrink-0 order-2 sm:order-1">
              <Badge
                variant={getPriorityVariant(task.priority)}
                className="h-5 px-2 text-xs font-medium"
              >
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
            <h4 className="text-sm font-medium text-foreground flex-1 leading-tight order-1 sm:order-2">
              {task.title}
            </h4>
          </div>

          {/* Description - More truncated on mobile */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </Link>

      {/* Right Side Actions - Stack on mobile */}
      <div className="flex flex-col items-end sm:flex-row sm:items-center sm:justify-end gap-1 sm:gap-3 flex-shrink-0 ml-1 sm:ml-2">
        {/* Actions Menu - Top on mobile */}
        <div className="flex-shrink-0 order-1 sm:order-3">
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

        {/* Assignee Avatar - Middle on mobile */}
        <div className="flex-shrink-0 order-2 sm:order-1">
          {task.assignee ? (
            <UserAvatar user={task.assignee} size="sm" />
          ) : (
            <div className="w-6 h-6" />
          )}
        </div>

        {/* Due Date Badge - Bottom on mobile */}
        <div className="flex-shrink-0 order-3 sm:order-2">
          {dueDateInfo && (
            <Badge
              variant={dueDateInfo.isToday ? 'destructive' : 'outline'}
              className="h-6 px-1.5 sm:px-2 text-xs font-normal flex items-center gap-1"
            >
              <Calendar className="h-3 w-3" />
              <span className="text-xs hidden sm:inline">
                {dueDateInfo.formatted}
              </span>
              <span className="text-xs sm:hidden">
                {dueDateInfo.isToday
                  ? 'Today'
                  : dueDateInfo.formatted.split('/')[0]}
              </span>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
