import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { CheckCircle, X, MoreHorizontal, User, Trash2 } from 'lucide-react';
import {
  useBulkUpdateStatus,
  useBulkAssignTasks,
  useBulkDeleteTasks,
} from '@/hooks/useTasks';
import { useUser } from '@/hooks/useUser';
import { TASK_STATUSES } from '@/types/task';

interface TaskBulkActionsProps {
  selectedTasks: string[];
  onClearSelection: () => void;
}

export const TaskBulkActions = ({
  selectedTasks,
  onClearSelection,
}: TaskBulkActionsProps) => {
  const { data: user } = useUser();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const bulkUpdateStatus = useBulkUpdateStatus();
  const bulkAssignTasks = useBulkAssignTasks();
  const bulkDeleteTasks = useBulkDeleteTasks();

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await bulkUpdateStatus.mutateAsync({
        taskIds: selectedTasks,
        status: status as 'TODO' | 'IN_PROGRESS' | 'DONE',
        reason: `Bulk status update to ${status}`,
      });
      onClearSelection();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleBulkAssign = async () => {
    if (!user?.id) return;

    try {
      await bulkAssignTasks.mutateAsync({
        taskIds: selectedTasks,
        assigneeId: user.id,
        reason: 'Bulk assignment to me',
      });
      onClearSelection();
    } catch (error) {
      console.error('Failed to assign tasks:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteTasks.mutateAsync({
        taskIds: selectedTasks,
        reason: 'Bulk deletion',
      });
      onClearSelection();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    }
  };

  const isLoading =
    bulkUpdateStatus.isPending ||
    bulkAssignTasks.isPending ||
    bulkDeleteTasks.isPending;

  return (
    <>
      <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            {selectedTasks.length} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Clear selection
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bulk Status Update */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {TASK_STATUSES.map(status => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleBulkStatusUpdate(status)}
                  disabled={isLoading}
                >
                  {status.replace('_', ' ')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk Assign */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkAssign}
            disabled={isLoading || !user?.id}
          >
            <User className="h-4 w-4 mr-2" />
            Assign to Me
          </Button>

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Tasks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tasks</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTasks.length} task(s)?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete Tasks'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
