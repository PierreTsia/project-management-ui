import { useState } from 'react';
import { Search, UserX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { useProjectContributors } from '@/hooks/useProjects';
import { useAssignTask } from '@/hooks/useTasks';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task } from '@/types/task';
import type { ProjectContributor } from '@/services/projects';

interface AssignTaskModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  projectId: string;
}

export function AssignTaskModal({
  isOpen,
  onOpenChange,
  task,
  projectId,
}: AssignTaskModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    task.assignee?.id || null
  );

  const { t } = useTranslations();
  const { data: contributors, isLoading } = useProjectContributors(projectId);
  const { mutateAsync: assignTask, isPending } = useAssignTask();

  // Filter contributors based on search query
  const filteredContributors =
    contributors?.filter(
      contributor =>
        contributor.user.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        contributor.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Only show contributors with WRITE, ADMIN, or OWNER roles (they can be assigned tasks)
  const assignableContributors = filteredContributors.filter(contributor =>
    ['WRITE', 'ADMIN', 'OWNER'].includes(contributor.role)
  );

  const handleAssign = async () => {
    if (!selectedUserId) return;

    try {
      await assignTask({
        projectId,
        taskId: task.id,
        data: { assigneeId: selectedUserId },
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  const handleUnassign = async () => {
    // For unassignment, we'd need an unassign endpoint or allow null assigneeId
    // For now, let's assume we can assign to empty string or handle this differently
    console.log('Unassign functionality would be implemented here');
  };

  const getContributorById = (
    userId: string
  ): ProjectContributor | undefined => {
    return contributors?.find(c => c.userId === userId);
  };

  const currentAssignee = task.assignee
    ? getContributorById(task.assignee.id)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('tasks.assign.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Assignment */}
          {currentAssignee && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('tasks.assign.current')}
              </label>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UserAvatar user={currentAssignee.user} size="sm" />
                <div className="flex-1">
                  <div className="font-medium">{currentAssignee.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentAssignee.user.email}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentAssignee.role}
                </Badge>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t('tasks.assign.selectUser')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('tasks.assign.searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Contributors List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : assignableContributors.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery
                  ? t('tasks.assign.noResults')
                  : t('tasks.assign.noContributors')}
              </div>
            ) : (
              <>
                {/* Unassign Option */}
                <button
                  onClick={() => setSelectedUserId(null)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedUserId === null
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <UserX className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">
                      {t('tasks.assign.unassign')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('tasks.assign.unassignDescription')}
                    </div>
                  </div>
                </button>

                {/* Contributors */}
                {assignableContributors.map(contributor => (
                  <button
                    key={contributor.id}
                    onClick={() => setSelectedUserId(contributor.userId)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedUserId === contributor.userId
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <UserAvatar user={contributor.user} size="sm" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{contributor.user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {contributor.user.email}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {contributor.role}
                    </Badge>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={selectedUserId === null ? handleUnassign : handleAssign}
              disabled={isPending || selectedUserId === task.assignee?.id}
              className="flex-1"
            >
              {isPending
                ? t('common.saving')
                : selectedUserId === null
                  ? t('tasks.assign.unassign')
                  : t('tasks.assign.assign')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
