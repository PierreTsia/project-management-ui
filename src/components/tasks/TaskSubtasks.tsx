import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';
import { CreateSubtaskModal } from './CreateSubtaskModal';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task } from '@/types/task';
import { ExternalLink, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface TaskSubtasksProps {
  projectId: string;
  taskId: string;
  task: Task;
  availableTasks: Task[];
  className?: string;
}

export const TaskSubtasks = ({
  projectId,
  taskId,
  task,
  availableTasks,
  className,
}: TaskSubtasksProps) => {
  const { t } = useTranslations();

  // Extract data from task prop
  const children = task.hierarchy?.children || [];
  const hasSubtasks = children.length > 0;

  // Add subtask modal state
  const [showCreateSubtaskModal, setShowCreateSubtaskModal] = useState(false);

  // Get current task for the modal
  const currentTask = availableTasks.find(task => task.id === taskId);

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <SectionHeader title={t('tasks.detail.subtasks')}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateSubtaskModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('tasks.detail.addSubtask')}
        </Button>
      </SectionHeader>
      {hasSubtasks ? (
        <div className="space-y-2">
          {children?.map(hierarchyItem => {
            const subtask = hierarchyItem.childTask;
            if (!subtask) {
              console.warn(
                'Child task is undefined for hierarchy item:',
                hierarchyItem
              );
              return null;
            }

            return (
              <div
                key={hierarchyItem.id}
                className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-medium">{subtask.title}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      getTaskStatusColor(subtask.status)
                    )}
                  >
                    {subtask.status}
                  </Badge>
                </div>
                <Link to={`/projects/${projectId}/${subtask.id}`}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('tasks.detail.noSubtasks')}
        </p>
      )}

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
