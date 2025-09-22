import type { ReactNode } from 'react';
import type { Task, TaskStatus } from '@/types/task';
import { useTranslations } from '@/hooks/useTranslations';
import { SmartTaskList } from '@/components/tasks/SmartTaskList';
import { TaskCard } from '@/components/tasks/TaskCard';
import { useNavigate } from 'react-router-dom';

type Props = {
  tasks: ReadonlyArray<Task>;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onCreate: () => void;
  className?: string;
  maxHeight?: string | number;
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
}: Props): ReactNode => {
  const { t } = useTranslations();
  const navigate = useNavigate();

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
