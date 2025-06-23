import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, CheckSquare, MoreHorizontal } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

type TaskAssignee = {
  id: string;
  name: string;
  avatar: string;
};

type Task = {
  id: string;
  name: string;
  completed: boolean;
  assignees: TaskAssignee[];
  dueDate: string;
  isToday: boolean;
};

type Props = {
  tasks: Task[];
  onTaskToggle?: (taskId: string) => void;
  onTaskAction?: (taskId: string) => void;
};

export const ProjectTasks = ({ tasks, onTaskToggle, onTaskAction }: Props) => {
  const { t } = useTranslations();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
          {t('projects.detail.tasks')}
        </h3>

        <div className="bg-card border border-border/50 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-8 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span className="flex-1">{t('projects.detail.subtask')}</span>
            <span className="w-24 text-center">
              {t('projects.detail.activity')}
            </span>
          </div>

          <div className="space-y-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between py-3 hover:bg-secondary/80 rounded-md px-3 -mx-1 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    className="flex items-center justify-center w-4 h-4 border border-border rounded-sm bg-background hover:bg-muted transition-colors"
                    onClick={() => onTaskToggle?.(task.id)}
                  >
                    {task.completed && (
                      <CheckSquare className="h-3 w-3 text-primary" />
                    )}
                  </button>
                  <span className="text-sm text-foreground font-medium">
                    {task.name}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-1">
                    {task.assignees.map(assignee => (
                      <Avatar
                        key={assignee.id}
                        className="h-6 w-6 border-2 border-background"
                      >
                        <AvatarImage
                          src={assignee.avatar}
                          alt={assignee.name}
                        />
                        <AvatarFallback className="text-xs">
                          {assignee.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>

                  <Badge
                    variant={task.isToday ? 'destructive' : 'outline'}
                    className="text-xs font-normal min-w-[70px] justify-center"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {task.dueDate}
                  </Badge>

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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
