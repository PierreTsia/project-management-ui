import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import partition from 'lodash.partition';
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
  useProjectContributors,
  useProjectAttachments,
} from '@/hooks/useProjects';
import {
  useProjectTasks,
  useUpdateTaskStatus,
  useDeleteTask,
} from '@/hooks/useTasks';
import type { TaskStatus } from '@/types/task';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProjectContributors } from '@/components/projects/ProjectContributors';
import { ProjectDetailsHeader } from '@/components/projects/ProjectDetailsHeader';
import { ProjectDetailsSkeleton } from '@/components/projects/ProjectDetailsSkeleton';
import { ProjectAttachments } from '@/components/projects/ProjectAttachments';
import { ProjectTasks } from '@/components/projects/ProjectTasks';
import { DeleteProjectModal } from '@/components/projects/DeleteProjectModal';
import { CreateTaskModal } from '@/components/projects/CreateTaskModal';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/utils';

import { formatDate } from '@/lib/utils';
import type { ProjectContributor } from '@/services/projects';
import type { Attachment } from '@/types/attachment';
import { toast } from 'sonner';

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslations();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  const { data: project, isLoading, error } = useProject(id!);
  const { data: contributors, isLoading: _contributorsLoading } =
    useProjectContributors(id!);

  const { data: tasks, isLoading: _tasksLoading } = useProjectTasks(id!);

  const { data: attachments, isLoading: _attachmentsLoading } =
    useProjectAttachments(id!);

  const [owners, otherContributors] = partition(
    contributors ?? [],
    (c: ProjectContributor) => c.role === 'OWNER'
  );

  const projectOwner = {
    id: owners[0]?.userId || '',
    name: owners[0]?.user.name || '',
    avatar: owners[0]?.user.avatarUrl || '',
  };

  const projectContributors = otherContributors?.map(
    (c: ProjectContributor) => ({
      id: c.user.id,
      name: c.user.name,
      ...(c.user.avatarUrl && { avatar: c.user.avatarUrl }),
    })
  );

  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: deleteProject } = useDeleteProject();
  const { mutateAsync: updateTaskStatus } = useUpdateTaskStatus();
  const { mutateAsync: deleteTask } = useDeleteTask();

  const handleBack = () => {
    navigate('/projects');
  };

  const handleEdit = () => {
    // TODO: Open edit modal or navigate to edit page
    console.log('Edit project:', id);
  };

  const handleArchive = async () => {
    if (!project) return;

    const newStatus = project.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';

    try {
      await updateProject({
        id: project.id,
        data: { status: newStatus },
      });
      toast.success(t('projects.detail.statusUpdated'));
    } catch (error) {
      console.error('Failed to update project status:', error);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      navigate('/projects');
      toast.success(t('projects.delete.success'));
    } catch (error) {
      console.error('Failed to delete project:', error);
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  };

  const handleAttachmentClick = (attachment: Attachment) => {
    // TODO: Handle attachment download/view - open cloudinaryUrl
    window.open(attachment.cloudinaryUrl, '_blank');
  };

  const handleTaskStatusChange = async (
    taskId: string,
    newStatus: TaskStatus
  ) => {
    if (!project) return;

    try {
      await updateTaskStatus({
        projectId: project.id,
        taskId,
        data: { status: newStatus },
      });
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error);
      console.error('Failed to update task status:', errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!project) return;

    try {
      await deleteTask({
        projectId: project.id,
        taskId,
      });
      toast.success('Task deleted successfully');
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error);
      console.error('Failed to delete task:', errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleAssignTask = (taskId: string) => {
    // TODO: Implement task assignment modal
    console.log('Assign task:', taskId);
  };

  const handleEditTask = (taskId: string) => {
    // TODO: Implement task edit modal
    console.log('Edit task:', taskId);
  };

  const handleCreateTask = () => {
    setShowCreateTaskModal(true);
  };

  const handleCloseCreateTaskModal = () => {
    setShowCreateTaskModal(false);
  };

  if (isLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{t('projects.detail.loadError')}</AlertDescription>
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
        <ProjectDetailsHeader
          projectName={project.name}
          status={project.status}
          isDeleting={isDeleting}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />

        {/* Main Content */}
        <div className="space-y-8">
          {/* People Section */}
          <div className="bg-card border border-border/50 rounded-lg p-6 space-y-6">
            <ProjectContributors
              owner={projectOwner}
              contributors={projectContributors}
            />
          </div>

          {/* Dates */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {t('projects.dates.created')}
              </span>
              <Badge variant="outline" className="text-xs font-normal">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(project.createdAt, currentLanguage)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {t('projects.dates.updated')}
              </span>
              <Badge variant="outline" className="text-xs font-normal">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(project.updatedAt, currentLanguage)}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                {t('projects.detail.description')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                {project.description}
              </p>
            </div>
          )}

          {/* Attachments */}
          <ProjectAttachments
            attachments={attachments ?? []}
            onAttachmentClick={handleAttachmentClick}
          />

          {/* Tasks Section */}
          <ProjectTasks
            tasks={tasks ?? []}
            onTaskStatusChange={handleTaskStatusChange}
            onDeleteTask={handleDeleteTask}
            onAssignTask={handleAssignTask}
            onEditTask={handleEditTask}
            onCreateTask={handleCreateTask}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteProjectModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        projectName={project.name}
        isDeleting={isDeleting}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={handleCloseCreateTaskModal}
        projectId={project.id}
      />
    </div>
  );
};
