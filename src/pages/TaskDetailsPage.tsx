import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '@/hooks/useTasks';
import { useTranslations, type TranslationKey } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProjectDetailsSkeleton } from '@/components/projects/ProjectDetailsSkeleton';
import { ArrowLeft, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useTaskComments } from '@/hooks/useTaskComments';
import TaskComments from '../components/tasks/TaskComments';
import { useProject } from '@/hooks/useProjects';

const TaskDetailsPage = () => {
  const { id: projectId, taskId } = useParams<{ id: string; taskId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslations();

  const { data: task, isLoading, error } = useTask(projectId!, taskId!);
  const { data: project } = useProject(projectId!);
  const {
    data: comments,
    isLoading: isLoadingComments,
    error: commentsError,
  } = useTaskComments(projectId!, taskId!);

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{t('tasks.detail.loadError')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button - Full Width */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-6">
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight truncate">
              {task.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                data-testid="task-status-badge"
                variant={task.status === 'DONE' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {t(
                  `tasks.status.${task.status.toLowerCase()}` as TranslationKey
                )}
              </Badge>
              {/* You can add more metadata here if needed */}
            </div>
          </div>
          {/* Placeholder for future actions (edit, delete, etc.) */}
          <div className="mt-2 sm:mt-0 flex-shrink-0 flex gap-2 justify-end">
            {/* Future action buttons go here */}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Dates */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {t('tasks.dates.created')}
              </span>
              <Badge variant="outline" className="text-xs font-normal">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(task.createdAt, currentLanguage)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {t('tasks.dates.updated')}
              </span>
              <Badge variant="outline" className="text-xs font-normal">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(task.updatedAt, currentLanguage)}
              </Badge>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {t('tasks.dates.due')}
                </span>
                <Badge variant="outline" className="text-xs font-normal">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(task.dueDate, currentLanguage)}
                </Badge>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                {t('tasks.detail.description')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                {task.description}
              </p>
            </div>
          )}

          {/* Comments Section */}
          <TaskComments
            projectId={projectId ?? ''}
            taskId={taskId ?? ''}
            comments={comments}
            isLoading={isLoadingComments}
            error={commentsError}
            ownerId={project?.ownerId}
          />
          {/* Placeholder for editing functionality */}
          <div className="space-y-2">
            {/* TODO: Add editing form/modal here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
