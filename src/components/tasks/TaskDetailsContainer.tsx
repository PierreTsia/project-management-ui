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
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-12">
        <TaskDetailsHeader task={task} projectId={projectId} taskId={taskId} />
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
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

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <TaskDatesSection task={task} projectId={projectId} taskId={taskId} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsContainer;
