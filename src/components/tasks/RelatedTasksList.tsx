import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskLinkBadge } from './TaskLinkBadge';
import { LinkTypeSelector } from './LinkTypeSelector';
import {
  useTaskLinksDetailed,
  useCreateTaskLink,
  useDeleteTaskLink,
} from '@/hooks/useTasks';
import type { Task, TaskLinkType } from '@/types/task';
import { Plus, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelatedTasksListProps {
  projectId: string;
  taskId: string;
  availableTasks: Task[];
  className?: string;
}

export const RelatedTasksList = ({
  projectId,
  taskId,
  availableTasks,
  className,
}: RelatedTasksListProps) => {
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedLinkType, setSelectedLinkType] = useState<
    TaskLinkType | undefined
  >();

  const { data: links, isLoading: isLoadingLinks } = useTaskLinksDetailed(
    projectId,
    taskId
  );
  const createLinkMutation = useCreateTaskLink();
  const deleteLinkMutation = useDeleteTaskLink();

  const handleCreateLink = async () => {
    if (!selectedTaskId || !selectedLinkType) return;

    try {
      await createLinkMutation.mutateAsync({
        projectId,
        taskId,
        data: {
          targetTaskId: selectedTaskId,
          type: selectedLinkType,
        },
      });
      setIsCreatingLink(false);
      setSelectedTaskId('');
      setSelectedLinkType(undefined);
    } catch (error) {
      console.error('Failed to create link:', error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteLinkMutation.mutateAsync({
        projectId,
        taskId,
        linkId,
      });
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const getTaskById = (taskId: string) => {
    return availableTasks.find(task => task.id === taskId);
  };

  const getTaskDisplayName = (task: Task) => {
    return `${task.title} (${task.status})`;
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoadingLinks) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Related Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Related Tasks</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingLink(true)}
            disabled={isCreatingLink}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Link Form */}
        {isCreatingLink && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Target Task</label>
                <select
                  value={selectedTaskId}
                  onChange={e => setSelectedTaskId(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select a task</option>
                  {availableTasks
                    .filter(task => task.id !== taskId)
                    .map(task => (
                      <option key={task.id} value={task.id}>
                        {getTaskDisplayName(task)}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Link Type</label>
                <LinkTypeSelector
                  value={selectedLinkType || undefined}
                  onValueChange={setSelectedLinkType}
                  className="w-full mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateLink}
                  disabled={
                    !selectedTaskId ||
                    !selectedLinkType ||
                    createLinkMutation.isPending
                  }
                >
                  {createLinkMutation.isPending ? 'Creating...' : 'Create Link'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreatingLink(false);
                    setSelectedTaskId('');
                    setSelectedLinkType(undefined);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Links List */}
        {links && links.length > 0 ? (
          <div className="space-y-3">
            {links.map(link => {
              const targetTask =
                link.targetTask || getTaskById(link.targetTaskId);
              if (!targetTask) return null;

              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <TaskLinkBadge type={link.type} size="sm" />
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{targetTask.title}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs',
                          getTaskStatusColor(targetTask.status)
                        )}
                      >
                        {targetTask.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `/projects/${projectId}/tasks/${targetTask.id}`,
                          '_blank'
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                      disabled={deleteLinkMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No related tasks yet.</p>
            <p className="text-sm">
              Click "Add Link" to create relationships between tasks.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelatedTasksList;
