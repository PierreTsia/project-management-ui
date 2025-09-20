import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RelatedTasksList } from './RelatedTasksList';
import { LinkCreationForm } from './LinkCreationForm';
import { useProjectTasks } from '@/hooks/useTasks';
import type { Task } from '@/types/task';
import { Link, Plus } from 'lucide-react';

interface TaskLinkManagerProps {
  projectId: string;
  taskId: string;
  currentTask: Task;
  trigger?: React.ReactNode;
  className?: string;
}

export const TaskLinkManager = ({
  projectId,
  taskId,
  currentTask,
  trigger,
  className,
}: TaskLinkManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: availableTasks, isLoading: isLoadingTasks } =
    useProjectTasks(projectId);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
  };

  if (isLoadingTasks) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className={className}>
              <Link className="h-4 w-4 mr-2" />
              Manage Links
            </Button>
          )}
        </DialogTrigger>
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <Link className="h-4 w-4 mr-2" />
            Manage Links
          </Button>
        )}
      </DialogTrigger>
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

export default TaskLinkManager;
