import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkTypeSelector } from './LinkTypeSelector';
import { useCreateTaskLink } from '@/hooks/useTasks';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task, TaskLinkType } from '@/types/task';
import { Search, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkCreationFormProps {
  projectId: string;
  taskId: string;
  availableTasks: Task[];
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const LinkCreationForm = ({
  projectId,
  taskId,
  availableTasks,
  onSuccess,
  onCancel,
  className,
}: LinkCreationFormProps) => {
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedLinkType, setSelectedLinkType] = useState<
    TaskLinkType | undefined
  >();

  const createLinkMutation = useCreateTaskLink();

  const filteredTasks = availableTasks.filter(
    task =>
      task.id !== taskId &&
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Search Tasks */}
        <div className="space-y-2">
          <Label htmlFor="task-search">
            {t('tasks.links.create.searchLabel')}
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="task-search"
              placeholder={t('tasks.links.create.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Task Selection */}
        <div className="space-y-2">
          <Label>{t('tasks.links.create.selectTaskLabel')}</Label>
          <div className="max-h-48 overflow-y-auto border rounded-md">
            {filteredTasks.length > 0 ? (
              <div className="space-y-1 p-2">
                {filteredTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={cn(
                      'w-full text-left p-2 rounded-md hover:bg-muted transition-colors',
                      selectedTaskId === task.id && 'bg-muted'
                    )}
                  >
                    <div className="flex items-center justify-between">
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
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery
                  ? t('tasks.links.create.noTasksFound')
                  : t('tasks.links.create.noTasksAvailable')}
              </div>
            )}
          </div>
        </div>

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
