import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useUpdateTask } from '@/hooks/useTasks';
import { toast } from 'sonner';
import type { Task } from '@/types/task';

type Props = {
  task: Task;
  projectId: string;
  taskId: string;
};

const TaskDescriptionSection = ({ task, projectId, taskId }: Props) => {
  const { t } = useTranslations();
  const { mutateAsync: updateTask, isPending: isUpdatingTask } =
    useUpdateTask();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');

  const handleStartEditDescription = () => {
    if (!task) return;
    setDescriptionDraft(task.description || '');
    setIsEditingDescription(true);
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
    setDescriptionDraft('');
  };

  const handleSaveDescription = async () => {
    if (!task || !projectId || !taskId) return;
    try {
      await updateTask({
        projectId,
        taskId,
        data: { description: descriptionDraft },
      });
      toast.success(t('tasks.detail.descriptionUpdateSuccess'));
      setIsEditingDescription(false);
      setDescriptionDraft('');
    } catch {
      toast.error(t('tasks.detail.descriptionUpdateError'));
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditDescription();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
        {t('tasks.detail.description')}
      </h3>
      {isEditingDescription ? (
        <div className="space-y-3">
          <Textarea
            value={descriptionDraft}
            onChange={e => setDescriptionDraft(e.target.value)}
            onKeyDown={handleDescriptionKeyDown}
            placeholder={t('tasks.detail.descriptionPlaceholder')}
            className="min-h-[100px] resize-none"
            data-testid="description-textarea"
            autoFocus
          />
          <div className="flex gap-1">
            <Button
              onClick={handleSaveDescription}
              disabled={isUpdatingTask}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              data-testid="save-description-button"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancelEditDescription}
              disabled={isUpdatingTask}
              size="sm"
              className="h-8 w-8 p-0"
              data-testid="cancel-description-button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : task.description ? (
        <div
          className="group cursor-pointer rounded-md p-2 -m-2 hover:bg-muted/50 transition-colors"
          onClick={handleStartEditDescription}
          data-testid="description-container"
        >
          <p className="text-sm text-muted-foreground leading-relaxed pl-4">
            {task.description}
          </p>
        </div>
      ) : (
        <div
          className="group cursor-pointer rounded-md p-2 -m-2 hover:bg-muted/50 transition-colors"
          onClick={handleStartEditDescription}
          data-testid="add-description-container"
        >
          <p className="text-sm text-muted-foreground hover:text-foreground pl-4">
            {t('tasks.detail.addDescription')}
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskDescriptionSection;
