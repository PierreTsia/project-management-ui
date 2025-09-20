import { useState } from 'react';
import {
  useTask,
  useProjectTasks,
  useUpdateTaskStatus,
  useDeleteTask,
  useAssignTask,
  useUnassignTask,
} from '@/hooks/useTasks';
import { useProject } from '@/hooks/useProjects';
import { useTaskComments } from '@/hooks/useTaskComments';
import { AssignTaskModal } from '@/components/projects/AssignTaskModal';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils';
import type { TaskStatus } from '@/types/task';
import { ProjectDetailsSkeleton } from '@/components/projects/ProjectDetailsSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from '@/hooks/useTranslations';
import TaskDetailsHeader from './TaskDetailsHeader';
import TaskDatesSection from './TaskDatesSection';
import TaskDescriptionSection from './TaskDescriptionSection';
import TaskComments from './TaskComments';
import TaskRelatedTasks from './TaskRelatedTasks';
import TaskSubtasks from './TaskSubtasks';

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

  // Mutations
  const updateStatusMutation = useUpdateTaskStatus();
  const deleteTaskMutation = useDeleteTask();
  const assignTaskMutation = useAssignTask();
  const unassignTaskMutation = useUnassignTask();

  // Modal state for assign task
  const [assignModalTaskId, setAssignModalTaskId] = useState<string | null>(
    null
  );

  // Handler functions
  const handleSubtaskStatusChange = async (
    subtaskId: string,
    status: string
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        projectId,
        taskId: subtaskId,
        data: { status: status as TaskStatus },
        parentTaskId: taskId,
      });

      toast.success('Task status updated successfully');
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to update status: ${errorMessage}`);
    }
  };

  const handleSubtaskDelete = async (subtaskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync({
        projectId,
        taskId: subtaskId,
        parentTaskId: taskId,
      });

      toast.success('Task deleted successfully');
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to delete task: ${errorMessage}`);
    }
  };

  const handleSubtaskAssign = (subtaskId: string) => {
    setAssignModalTaskId(subtaskId);
  };

  const handleAssign = async (subtaskId: string, assigneeId: string) => {
    await assignTaskMutation.mutateAsync({
      projectId,
      taskId: subtaskId,
      data: { assigneeId },
      parentTaskId: taskId,
    });
  };

  const handleUnassign = async (subtaskId: string) => {
    await unassignTaskMutation.mutateAsync({
      projectId,
      taskId: subtaskId,
      parentTaskId: taskId,
    });
  };

  const handleSubtaskEdit = (subtaskId: string) => {
    console.log('Edit task:', subtaskId);
  };

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
          {/* 1. Related Tasks Section */}
          <TaskRelatedTasks projectId={projectId} taskId={taskId} task={task} />

          {/* 2. Description Section */}
          <TaskDescriptionSection
            task={task}
            projectId={projectId}
            taskId={taskId}
          />

          {/* 3. Subtasks Section */}
          {availableTasks && (
            <TaskSubtasks
              projectId={projectId}
              taskId={taskId}
              task={task}
              availableTasks={availableTasks}
              onStatusChange={handleSubtaskStatusChange}
              onDelete={handleSubtaskDelete}
              onAssign={handleSubtaskAssign}
              onEdit={handleSubtaskEdit}
            />
          )}

          {/* 4. Comments Section */}
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

      {/* Assign Task Modal */}
      {assignModalTaskId && availableTasks && (
        <AssignTaskModal
          isOpen={!!assignModalTaskId}
          onOpenChange={open => !open && setAssignModalTaskId(null)}
          task={availableTasks.find(t => t.id === assignModalTaskId) || task}
          projectId={projectId}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
        />
      )}
    </div>
  );
};

export default TaskDetailsContainer;
