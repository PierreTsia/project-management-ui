import { Badge } from '@/components/ui/badge';
import { KanbanTaskCard } from '@/components/tasks/KanbanTaskCard';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task } from '@/types/task';
import { TASK_STATUSES } from '@/types/task';

interface TaskBoardProps {
  tasks: Task[];
  selectedTasks: string[];
  onTaskSelect: (taskId: string, selected: boolean) => void;
}

export const TaskBoard = ({
  tasks,
  selectedTasks,
  onTaskSelect,
}: TaskBoardProps) => {
  const { t } = useTranslations();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-muted/50 border-border hover:bg-muted/70';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15';
      case 'DONE':
        return 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15';
      default:
        return 'bg-muted/50 border-border hover:bg-muted/70';
    }
  };

  const groupTasksByStatus = () => {
    const grouped: Record<string, Task[]> = {};
    TASK_STATUSES.forEach(status => {
      grouped[status] = tasks.filter(task => task.status === status);
    });
    return grouped;
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'TODO':
        return t('tasks.status.todo');
      case 'IN_PROGRESS':
        return t('tasks.status.inProgress');
      case 'DONE':
        return t('tasks.status.done');
      default:
        return status;
    }
  };

  const groupedTasks = groupTasksByStatus();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {TASK_STATUSES.map(status => (
        <div key={status} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{getStatusTitle(status)}</h3>
            <Badge variant="outline" className="text-xs">
              {groupedTasks[status].length}
            </Badge>
          </div>

          <div className="space-y-3 min-h-[400px]">
            {groupedTasks[status].length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                {t('tasks.board.noTasks')}
              </div>
            ) : (
              groupedTasks[status].map(task => (
                <KanbanTaskCard
                  key={task.id}
                  task={task}
                  selected={selectedTasks.includes(task.id)}
                  onSelect={onTaskSelect}
                  statusClass={getStatusColor(task.status)}
                  onClick={() => {
                    /* no-op for now; wire to drawer/modal where needed */
                  }}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
