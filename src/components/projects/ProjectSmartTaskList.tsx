import type { ReactNode } from 'react';
import type { Task, TaskStatus } from '@/types/task';
import { useTranslations } from '@/hooks/useTranslations';
import { SmartTaskList } from '@/components/tasks/SmartTaskList';
import { TaskCard } from '@/components/tasks/TaskCard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus } from 'lucide-react';

type Props = {
  tasks: ReadonlyArray<Task>;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onCreate: () => void;
  className?: string;
  maxHeight?: string | number;
  onGenerateAi?: () => void;
};

export const ProjectSmartTaskList = ({
  tasks,
  onStatusChange,
  onDelete,
  onAssign,
  onEdit,
  onCreate,
  className,
  maxHeight,
  onGenerateAi,
}: Props): ReactNode => {
  const { t } = useTranslations();
  const navigate = useNavigate();

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-border/50 rounded-lg p-8 text-center space-y-4">
        <div className="text-sm text-muted-foreground">
          {t('projects.detail.noTasksYet')}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {onGenerateAi && (
            <Button onClick={onGenerateAi}>
              <Sparkles className="w-4 h-4 mr-2" />
              {t('projects.detail.generateWithAi')}
            </Button>
          )}
          <Button variant="outline" onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t('projects.detail.createFirstTask')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SmartTaskList
      tasks={tasks}
      defaultSort={'dueDate-ASC'}
      onStatusChange={onStatusChange}
      onDelete={onDelete}
      onAssign={onAssign}
      onEdit={onEdit}
      onCreate={onCreate}
      renderItem={task => (
        <div
          onClick={() => navigate(`/projects/${task.projectId}/${task.id}`)}
          className="cursor-pointer"
          role="button"
          aria-label={task.title}
          data-testid={`task-card-${task.id}`}
        >
          <TaskCard
            task={task}
            onStatusChange={status => onStatusChange(task.id, status)}
            onOpenAssignModal={onAssign}
            disableStatusForNonAssignee
          />
        </div>
      )}
      ctaLabel={t('projects.detail.createTask')}
      emptyMessage={t('projects.detail.noTasksYet')}
      emptyCtaLabel={t('projects.detail.createFirstTask')}
      showSearch
      showSort
      showFilters
      {...(className !== undefined ? { className } : {})}
      {...(maxHeight !== undefined ? { maxHeight } : {})}
    />
  );
};

export default ProjectSmartTaskList;
