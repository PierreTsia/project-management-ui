import { useState } from 'react';
import { SectionHeader } from '@/components/ui/section-header';
import { CreateSubtaskModal } from './CreateSubtaskModal';
import { SmartTaskList } from './SmartTaskList';
import { LightTaskItem } from './LightTaskItem';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task } from '@/types/task';
import { cn } from '@/lib/utils';

interface TaskSubtasksProps {
  projectId: string;
  taskId: string;
  task: Task;
  availableTasks: Task[];
  onStatusChange: (taskId: string, status: string) => void;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  className?: string;
}

export const TaskSubtasks = ({
  projectId,
  taskId,
  task,
  availableTasks,
  onStatusChange,
  onDelete,
  onAssign,
  onEdit,
  className,
}: TaskSubtasksProps) => {
  const { t } = useTranslations();

  // Extract subtasks from hierarchy
  const subtasks = (task.hierarchy?.children
    ?.map(item => item.childTask)
    .filter(Boolean) || []) as Task[];

  // Add subtask modal state
  const [showCreateSubtaskModal, setShowCreateSubtaskModal] = useState(false);

  // Get current task for the modal
  const currentTask = availableTasks.find(task => task.id === taskId);

  return (
    <div className={cn('space-y-3', className)}>
      <SectionHeader title={t('tasks.detail.subtasks')} />

      <SmartTaskList
        tasks={subtasks}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onAssign={onAssign}
        onEdit={onEdit}
        onCreate={() => setShowCreateSubtaskModal(true)}
        renderItem={subtask => (
          <LightTaskItem
            key={subtask.id}
            task={subtask}
            onStatusChange={status => onStatusChange(subtask.id, status)}
            onDelete={() => onDelete(subtask.id)}
            onOpenAssignModal={() => onAssign(subtask.id)}
          />
        )}
        ctaLabel={t('tasks.detail.addSubtask')}
        emptyMessage={t('tasks.detail.noSubtasks')}
        emptyCtaLabel={t('tasks.detail.addSubtask')}
        showSearch={true}
        showSort={true}
        showFilters={true}
        showFloatingButton={true}
      />

      {/* Add Subtask Modal */}
      {currentTask && (
        <CreateSubtaskModal
          isOpen={showCreateSubtaskModal}
          onClose={() => setShowCreateSubtaskModal(false)}
          parentTask={currentTask}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default TaskSubtasks;
