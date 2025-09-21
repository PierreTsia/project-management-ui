import { StatusSelect } from './StatusSelect';
import { AssigneeAvatar } from './AssigneeAvatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useDeleteTask } from '@/hooks/useTasks';
import { getApiErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import type { Task, TaskStatus } from '@/types/task';

type LightTaskItemProps = {
  task: Pick<Task, 'id' | 'title' | 'status' | 'assignee' | 'projectId'>;
  onStatusChange: (status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  onAssigneeChange?: (assigneeId: string | null) => void;
  onModalStateChange?: (isOpen: boolean) => void;
  onOpenAssignModal?: (taskId: string) => void;
  className?: string;
};

export const LightTaskItem = ({
  task,
  onStatusChange,
  onDelete,
  onAssigneeChange: _onAssigneeChange,
  onOpenAssignModal,
  className = '',
}: LightTaskItemProps) => {
  const { mutateAsync: deleteTask, isPending: isDeleting } = useDeleteTask();

  const handleAssigneeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenAssignModal?.(task.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Use the onDelete prop if provided (for subtasks), otherwise use direct mutation
    if (onDelete) {
      onDelete(task.id);
    } else {
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
    }
  };

  const handleStatusSelectClick = (e: React.MouseEvent) => {
    // Prevent the parent Link from navigating when clicking on StatusSelect
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 border border-border/40 rounded-md bg-card/30 hover:bg-card/60 hover:border-border/60 transition-all duration-200 ${className}`}
    >
      {/* Status Select - Smaller */}
      <div className="flex-shrink-0" onClick={handleStatusSelectClick}>
        <StatusSelect
          value={task.status}
          onValueChange={onStatusChange}
          size="sm"
        />
      </div>

      {/* Task Title - Truncated */}
      <div className="flex-1 min-w-0">
        <h6 className="text-sm font-medium text-foreground leading-tight truncate">
          {task.title}
        </h6>
      </div>

      {/* Assignee Avatar - Smaller */}
      <div
        className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleAssigneeClick}
        title="Click to change assignee"
      >
        <AssigneeAvatar assignee={task.assignee} size="sm" />
      </div>

      {/* Delete Button - Smaller */}
      <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Delete task"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
