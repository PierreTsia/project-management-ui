import { StatusSelect } from './StatusSelect';
import { AssigneeAvatar } from './AssigneeAvatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useDeleteTask } from '@/hooks/useTasks';
import { useUser } from '@/hooks/useUser';
import { getApiErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import type { Task, TaskStatus } from '@/types/task';

type TaskCardProps = {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onAssigneeChange?: (assigneeId: string | null) => void;
  onModalStateChange?: (isOpen: boolean) => void;
  onOpenAssignModal?: (taskId: string) => void;
  className?: string;
  disableStatusForNonAssignee?: boolean;
};

export const TaskCard = ({
  task,
  onStatusChange,
  onAssigneeChange: _onAssigneeChange,
  onModalStateChange: _onModalStateChange,
  onOpenAssignModal,
  className = '',
  disableStatusForNonAssignee = false,
}: TaskCardProps) => {
  const { mutateAsync: deleteTask, isPending: isDeleting } = useDeleteTask();
  const { data: currentUser } = useUser();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await deleteTask({
        projectId: task.projectId,
        taskId: task.id,
      });
      toast.success('Task deleted successfully');
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to delete task: ${errorMessage}`);
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'High';
      case 'MEDIUM':
        return 'Medium';
      case 'LOW':
        return 'Low';
      default:
        return priority;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'LOW':
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  const formatDueDate = (dueDate: string | undefined) => {
    if (!dueDate) return 'No due date';
    return new Date(dueDate).toLocaleDateString();
  };

  const handleAssigneeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenAssignModal?.(task.id);
  };

  const handleStatusSelectClick = (e: React.MouseEvent) => {
    // Prevent any parent click handlers from interfering with StatusSelect
    e.preventDefault();
    e.stopPropagation();
  };

  const isStatusDisabled = disableStatusForNonAssignee
    ? !task.assignee || currentUser?.id !== task.assignee.id
    : false;

  return (
    <div
      className={`flex items-start gap-4 p-5 border border-border/50 rounded-lg bg-card/50 hover:bg-card/80 hover:border-border transition-all duration-200 ${className}`}
    >
      {/* Status Select */}
      <div className="flex-shrink-0 pt-1" onClick={handleStatusSelectClick}>
        <StatusSelect
          value={task.status}
          onValueChange={onStatusChange}
          size="sm"
          dataTestId={`task-status-${task.id}`}
          optionTestIdPrefix={`task-status-option-${task.id}-`}
          disabled={isStatusDisabled}
        />
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-foreground leading-tight">
            {task.title}
          </h5>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description || ''}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityStyles(task.priority)}`}
            >
              {getPriorityLabel(task.priority)}
            </span>
            {task.dueDate && (
              <span className="text-xs text-muted-foreground">
                Due {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Assignee Avatar */}
      <div
        className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleAssigneeClick}
        title="Click to change assignee"
      >
        <AssigneeAvatar assignee={task.assignee} size="md" />
      </div>

      {/* Delete Button */}
      <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
