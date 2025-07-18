import { useTask } from '@/hooks/useTasks';
import { useProject } from '@/hooks/useProjects';
import { useTaskComments } from '@/hooks/useTaskComments';
import { ProjectDetailsSkeleton } from '@/components/projects/ProjectDetailsSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from '@/hooks/useTranslations';
import TaskDetailsHeader from './TaskDetailsHeader';
import TaskDatesSection from './TaskDatesSection';
import TaskDescriptionSection from './TaskDescriptionSection';
import TaskComments from './TaskComments';

type Props = {
  projectId: string;
  taskId: string;
};

const TaskDetailsContainer = ({ projectId, taskId }: Props) => {
  const { t } = useTranslations();
  const { data: task, isLoading, error } = useTask(projectId, taskId);
  const { data: project } = useProject(projectId);
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
    <div className="max-w-4xl mx-auto space-y-8">
      <TaskDetailsHeader task={task} projectId={projectId} taskId={taskId} />

      <div className="space-y-8">
        <TaskDatesSection task={task} projectId={projectId} taskId={taskId} />

        <TaskDescriptionSection
          task={task}
          projectId={projectId}
          taskId={taskId}
        />

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
  );
};

export default TaskDetailsContainer;
