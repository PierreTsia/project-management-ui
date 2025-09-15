import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Calendar, User, AlertCircle } from 'lucide-react';
import type { Task } from '@/types/task';
import { useTranslations } from '@/hooks/useTranslations';
import { TaskActionsMenu } from '@/components/tasks/TaskActionsMenu';
import { format } from 'date-fns';

type KanbanTaskCardProps = {
  task: Task;
  selected: boolean;
  onSelect: (taskId: string, selected: boolean) => void;
  statusClass: string; // classes that color the card based on status
  onClick?: (taskId: string) => void;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return format(new Date(dateString), 'MMM dd');
};

const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

const PriorityIcon = ({ priority }: { priority: string }) => {
  if (priority === 'HIGH') {
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
  return null;
};

export function KanbanTaskCard({
  task,
  selected,
  onSelect,
  statusClass,
  onClick,
}: KanbanTaskCardProps) {
  const { t } = useTranslations();

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md hover:translate-y-[1px] rounded-lg ${statusClass} ${selected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onClick?.(task.id)}
    >
      <CardHeader className="px-3 py-2 pb-1">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 flex-1 min-w-0">
            <Checkbox
              checked={selected}
              onCheckedChange={checked => onSelect(task.id, !!checked)}
              onClick={e => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-[13px] md:text-sm font-semibold leading-snug line-clamp-2 text-foreground">
                {task.title}
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <PriorityIcon priority={task.priority} />
            <TaskActionsMenu />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-3 pb-3">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-[11px] md:text-xs text-muted-foreground truncate">
              {task.projectName}
            </span>
          </div>

          {task.description && (
            <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center space-x-2">
            <User className="h-3 w-3 text-muted-foreground" />
            {task.assignee ? (
              <div className="flex items-center gap-1 min-w-0">
                <UserAvatar user={task.assignee} size="sm" />
                <span className="text-[11px] md:text-xs truncate max-w-[140px]">
                  {task.assignee.name}
                </span>
              </div>
            ) : (
              <span className="text-[11px] md:text-xs text-muted-foreground">
                {t('tasks.common.unassigned')}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span
              className={`text-[11px] md:text-xs whitespace-nowrap ${
                task.dueDate && isOverdue(task.dueDate)
                  ? 'text-red-500 font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
