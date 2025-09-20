import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LinkCreationForm } from './LinkCreationForm';
import type { Task } from '@/types/task';

interface TaskAddLinkModalProps {
  projectId: string;
  taskId: string;
  currentTask: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskAddLinkModal = ({
  projectId,
  taskId,
  currentTask,
  isOpen,
  onClose,
}: TaskAddLinkModalProps) => {
  const handleCreateSuccess = () => {
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-2 sm:mx-0">
        <DialogHeader>
          <DialogTitle>Add Task Link</DialogTitle>
        </DialogHeader>

        <LinkCreationForm
          projectId={projectId}
          taskId={taskId}
          currentTask={currentTask}
          onSuccess={handleCreateSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskAddLinkModal;
