import { useState } from 'react';
import { Search, UserX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { useProjectContributors } from '@/hooks/useProjects';
import { useTranslations } from '@/hooks/useTranslations';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils';
import type { Task } from '@/types/task';
import type { ProjectContributor } from '@/services/projects';

interface AssignTaskModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  projectId: string;
  onAssign: (taskId: string, assigneeId: string) => Promise<void>;
  onUnassign: (taskId: string) => Promise<void>;
}

export function AssignTaskModal({
  isOpen,
  onOpenChange,
  task,
  projectId,
  onAssign,
  onUnassign,
}: AssignTaskModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    task.assignee?.id || null
  );

  const { t } = useTranslations();
  const { data: contributors, isLoading } = useProjectContributors(projectId);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);

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
      setIsAssigning(true);
      await onAssign(task.id, selectedUserId);
      toast.success('Task assigned successfully');
      onOpenChange(false);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to assign task: ${errorMessage}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async () => {
    try {
      setIsUnassigning(true);
      await onUnassign(task.id);
      toast.success('Task unassigned successfully');
      onOpenChange(false);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to unassign task: ${errorMessage}`);
    } finally {
      setIsUnassigning(false);
    }
  };

  const getContributorById = (
    userId: string
  ): ProjectContributor | undefined => {
    return contributors?.find(c => c.userId === userId);
  };

  const getButtonText = (): string => {
    if (isAssigning || isUnassigning) {
      return t('common.saving');
    }
    if (selectedUserId === null) {
      return t('tasks.assign.unassign');
    }
    return t('tasks.assign.assign');
  };

  const renderContributorsList = () => {
    if (isLoading) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          {t('common.loading')}
        </div>
      );
    }

    if (assignableContributors.length === 0) {
      const message = searchQuery
        ? t('tasks.assign.noResults')
        : t('tasks.assign.noContributors');
      return (
        <div className="text-center py-4 text-muted-foreground">{message}</div>
      );
    }

    return (
      <>
        {/* Unassign Option */}
        <button
          data-testid="assign-modal-unassign-option"
          onClick={() => setSelectedUserId(null)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            selectedUserId === null
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-muted/50'
          }`}
        >
          <div className="p-2 rounded-full bg-muted">
            <UserX className="h-4 w-4" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">{t('tasks.assign.unassign')}</div>
            <div className="text-sm text-muted-foreground">
              {t('tasks.assign.unassignDescription')}
            </div>
          </div>
        </button>

        {/* Contributors */}
        {assignableContributors.map(contributor => (
          <button
            key={contributor.userId}
            data-testid={`assign-modal-contributor-${contributor.userId}`}
            onClick={() => setSelectedUserId(contributor.userId)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              selectedUserId === contributor.userId
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-muted/50'
            }`}
          >
            <UserAvatar user={contributor.user} showName={false} />
            <div className="flex-1 text-left">
              <div className="font-medium">{contributor.user.name}</div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {contributor.role}
                </Badge>
              </div>
            </div>
          </button>
        ))}
      </>
    );
  };

  const currentAssignee = task.assignee
    ? getContributorById(task.assignee.id)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-testid={`assign-modal-task-${task.id}`}
      >
        <DialogHeader>
          <DialogTitle>{t('tasks.assign.title')}</DialogTitle>
          <DialogDescription>{t('tasks.assign.description')}</DialogDescription>
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
            {renderContributorsList()}
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
              data-testid="assign-modal-action-button"
              onClick={selectedUserId === null ? handleUnassign : handleAssign}
              disabled={
                isAssigning ||
                isUnassigning ||
                selectedUserId === task.assignee?.id
              }
              className="flex-1"
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
