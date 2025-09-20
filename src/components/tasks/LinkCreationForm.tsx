import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AsyncSelect } from '@/components/ui/async-select';
import { LinkTypeSelector } from './LinkTypeSelector';
import { useCreateTaskLink } from '@/hooks/useTasks';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task, TaskLinkType } from '@/types/task';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Default limit for task search results in link creation
const DEFAULT_TASK_SEARCH_LIMIT = 50;

interface LinkCreationFormProps {
  projectId: string;
  taskId: string;
  currentTask: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
  /** Maximum number of tasks to fetch when searching (default: 50) */
  searchLimit?: number;
}

export const LinkCreationForm = ({
  projectId,
  taskId,
  currentTask,
  onSuccess,
  onCancel,
  className,
  searchLimit = DEFAULT_TASK_SEARCH_LIMIT,
}: LinkCreationFormProps) => {
  const { t } = useTranslations();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedLinkType, setSelectedLinkType] = useState<
    TaskLinkType | undefined
  >();

  const createLinkMutation = useCreateTaskLink();

  // Get current task's parent IDs for sibling detection
  const currentTaskParentIds =
    currentTask.hierarchy?.parents?.map(p => p.parentTaskId) || [];

  // Create async task search fetcher
  const searchTasks = async (query?: string): Promise<Task[]> => {
    const { TasksService } = await import('@/services/tasks');
    const searchResult = await TasksService.searchProjectTasks(projectId, {
      ...(query && { query }),
      limit: searchLimit,
    });

    // Filter out current task and sort by siblings
    const filteredTasks = searchResult.tasks
      .filter(task => task.id !== taskId)
      .sort((a, b) => {
        const aIsSibling =
          a.hierarchy?.parents?.some(p =>
            currentTaskParentIds.includes(p.parentTaskId)
          ) || false;
        const bIsSibling =
          b.hierarchy?.parents?.some(p =>
            currentTaskParentIds.includes(p.parentTaskId)
          ) || false;

        // Siblings first, then others
        if (aIsSibling && !bIsSibling) return -1;
        if (!aIsSibling && bIsSibling) return 1;

        // Within same group, sort by title
        return a.title.localeCompare(b.title);
      });

    return filteredTasks;
  };

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
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create link:', error);
    }
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('tasks.links.create.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Link Type Selection */}
        <div className="space-y-2">
          <Label>{t('tasks.links.create.linkTypeLabel')}</Label>
          <LinkTypeSelector
            value={selectedLinkType}
            onValueChange={setSelectedLinkType}
            placeholder={t('tasks.links.create.linkTypePlaceholder')}
            className="w-full"
          />
        </div>

        {/* Task Selection */}
        <div className="space-y-2">
          <Label>{t('tasks.links.create.selectTaskLabel')}</Label>
          <AsyncSelect<Task>
            fetcher={searchTasks}
            renderOption={task => {
              const isSibling =
                task.hierarchy?.parents?.some(p =>
                  currentTaskParentIds.includes(p.parentTaskId)
                ) || false;

              return (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{task.title}</span>
                    {isSibling && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {t('tasks.links.create.siblingLabel')}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full ml-2',
                      getTaskStatusColor(task.status)
                    )}
                  >
                    {task.status}
                  </span>
                </div>
              );
            }}
            getOptionValue={task => task.id}
            getDisplayValue={task => (
              <div className="flex items-center gap-2">
                <span className="font-medium">{task.title}</span>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    getTaskStatusColor(task.status)
                  )}
                >
                  {task.status}
                </span>
              </div>
            )}
            label="Task"
            placeholder={t('tasks.links.create.selectTaskPlaceholder')}
            value={selectedTaskId}
            onChange={setSelectedTaskId}
            width="100%"
            noResultsMessage={t('tasks.links.create.noTasksFound')}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleCreateLink}
            disabled={
              !selectedTaskId ||
              !selectedLinkType ||
              createLinkMutation.isPending
            }
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createLinkMutation.isPending
              ? t('tasks.links.create.creating')
              : t('tasks.links.create.createButton')}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={createLinkMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            {t('tasks.links.create.cancelButton')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkCreationForm;
