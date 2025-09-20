import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RelatedTasksList } from './RelatedTasksList';
import { LinkCreationForm } from './LinkCreationForm';
import { useProjectTasks } from '@/hooks/useTasks';
import type { Task } from '@/types/task';
import { Plus } from 'lucide-react';

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
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: availableTasks, isLoading: isLoadingTasks } =
    useProjectTasks(projectId);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    onClose();
  };

  const handleCancel = () => {
    setShowCreateForm(false);
  };

  if (isLoadingTasks) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Links</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6 text-muted-foreground">
            Loading...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Links - {currentTask.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {showCreateForm ? (
            <LinkCreationForm
              projectId={projectId}
              taskId={taskId}
              availableTasks={availableTasks || []}
              onSuccess={handleCreateSuccess}
              onCancel={handleCancel}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowCreateForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Link
                </Button>
              </div>

              <RelatedTasksList
                projectId={projectId}
                taskId={taskId}
                currentTask={currentTask}
                availableTasks={availableTasks || []}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskAddLinkModal;
