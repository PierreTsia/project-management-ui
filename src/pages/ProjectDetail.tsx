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
import ProjectDescriptionSection from '@/components/projects/ProjectDescriptionSection';
import { ProjectTasks } from '@/components/projects/ProjectTasks';
import { AssignTaskModal } from '@/components/projects/AssignTaskModal';
import { DeleteProjectModal } from '@/components/projects/DeleteProjectModal';
import { CreateTaskModal } from '@/components/projects/CreateTaskModal';
import { EditProjectInfosModal } from '@/components/projects/EditProjectInfosModal';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { ProjectContributor } from '@/services/projects';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslations();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<string | null>(null);

  const { data: project, isLoading, error } = useProject(id!);
  const { data: contributors, isLoading: _contributorsLoading } =
    useProjectContributors(id!);
  const { data: currentUser } = useUser();

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
      email: c.user.email,
      projectContributorId: c.id,
      role: c.role,
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
    setShowEditProjectModal(true);
  };

  const currentUserRole = (() => {
    if (!currentUser) return undefined;
    // Fallback to project.ownerId when contributors list is empty/not loaded
    if (project?.ownerId === currentUser.id) return 'OWNER' as const;
    if (owners[0]?.userId === currentUser.id) return 'OWNER' as const;
    const match = (contributors ?? []).find(
      (c: ProjectContributor) => c.userId === currentUser.id
    );
    return match?.role;
  })();

  const canManageContributors = ['ADMIN', 'OWNER'].includes(
    currentUserRole ?? ''
  );

  const handleCloseEditModal = () => {
    setShowEditProjectModal(false);
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
      throw error;
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
    setTaskToAssign(taskId);
    setShowAssignTaskModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignTaskModal(false);
    setTaskToAssign(null);
  };

  const handleEditTask = (taskId: string) => {
    navigate(`/projects/${id}/${taskId}`);
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
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <ProjectDetailsHeader
          projectName={project.name}
          status={project.status}
          isDeleting={isDeleting}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />

        <div className="space-y-8">
          <div className="bg-card border border-border/50 rounded-lg p-6 space-y-6">
            <ProjectContributors
              owner={projectOwner}
              contributors={projectContributors}
              projectId={project.id}
              canManage={!!canManageContributors}
            />
          </div>

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

          <ProjectDescriptionSection project={project} />

          <ProjectAttachments
            projectId={project.id}
            attachments={attachments ?? []}
          />

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

      <DeleteProjectModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        projectName={project.name}
        isDeleting={isDeleting}
      />

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={handleCloseCreateTaskModal}
        projectId={project.id}
      />

      <EditProjectInfosModal
        isOpen={showEditProjectModal}
        onClose={handleCloseEditModal}
        project={project}
      />

      {taskToAssign && tasks && (
        <AssignTaskModal
          isOpen={showAssignTaskModal}
          onOpenChange={open => {
            if (!open) handleCloseAssignModal();
          }}
          task={tasks.find(t => t.id === taskToAssign)!}
          projectId={project.id}
        />
      )}
    </div>
  );
};
