import { useTask, useProjectTasks } from '@/hooks/useTasks';
import { useProject } from '@/hooks/useProjects';
import { useTaskComments } from '@/hooks/useTaskComments';
import { ProjectDetailsSkeleton } from '@/components/projects/ProjectDetailsSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Plus } from 'lucide-react';
import TaskDetailsHeader from './TaskDetailsHeader';
import TaskDatesSection from './TaskDatesSection';
import TaskDescriptionSection from './TaskDescriptionSection';
import TaskComments from './TaskComments';
import TaskRelationships from './TaskRelationships';
import { TaskLinkManager } from './TaskLinkManager';

type Props = {
  projectId: string;
  taskId: string;
};

const TaskDetailsContainer = ({ projectId, taskId }: Props) => {
  const { t } = useTranslations();
  const { data: task, isLoading, error } = useTask(projectId, taskId);
  const { data: project } = useProject(projectId);
  const { data: availableTasks } = useProjectTasks(projectId);
  const {
    data: comments,
    isLoading: isLoadingComments,
    error: commentsError,
  } = useTaskComments(projectId, taskId);

  if (isLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (error || !task) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t('tasks.detail.loadError')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-12">
        <TaskDetailsHeader task={task} projectId={projectId} taskId={taskId} />
      </div>

      {/* Content Sections */}
      <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Dates Section - Higher on mobile */}
        <div className="lg:col-span-1 lg:order-2">
          <TaskDatesSection task={task} projectId={projectId} taskId={taskId} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 lg:order-1 space-y-8">
          {/* Add Relations Buttons - Above Description */}
          <div className="flex items-center gap-2">
            <TaskLinkManager
              projectId={projectId}
              taskId={taskId}
              currentTask={task}
              trigger={
                <Button variant="outline" size="sm">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Add relation
                </Button>
              }
            />
            <TaskLinkManager
              projectId={projectId}
              taskId={taskId}
              currentTask={task}
              trigger={
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add subtask
                </Button>
              }
            />
          </div>

          <TaskDescriptionSection
            task={task}
            projectId={projectId}
            taskId={taskId}
          />

          {/* Task Relationships Section */}
          {availableTasks && (
            <TaskRelationships
              projectId={projectId}
              taskId={taskId}
              availableTasks={availableTasks}
            />
          )}

          <TaskComments
            projectId={projectId}
            taskId={taskId}
            comments={comments}
            isLoading={isLoadingComments}
            error={commentsError}
            ownerId={project?.ownerId}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsContainer;
