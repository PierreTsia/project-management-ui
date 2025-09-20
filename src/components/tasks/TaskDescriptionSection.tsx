import { useTranslations } from '@/hooks/useTranslations';
import { useUpdateTask } from '@/hooks/useTasks';
import { toast } from 'sonner';
import type { Task } from '@/types/task';
import EditableContent from '@/components/ui/editable-content';
import { SectionHeader } from '@/components/ui/section-header';

type Props = {
  task: Task;
  projectId: string;
  taskId: string;
};

const TaskDescriptionSection = ({ task, projectId, taskId }: Props) => {
  const { t } = useTranslations();
  const { mutateAsync: updateTask, isPending: isUpdatingTask } =
    useUpdateTask();

  const handleSaveDescription = async (content: string) => {
    if (!task || !projectId || !taskId) return;
    try {
      await updateTask({
        projectId,
        taskId,
        data: { description: content },
      });
      toast.success(t('tasks.detail.descriptionUpdateSuccess'));
    } catch {
      toast.error(t('tasks.detail.descriptionUpdateError'));
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title={t('tasks.detail.description')} />
      <EditableContent
        content={task.description}
        placeholder={t('tasks.detail.descriptionPlaceholder')}
        onSave={handleSaveDescription}
        isPending={isUpdatingTask}
        addText={t('tasks.detail.addDescription')}
        data-testid="description"
      />
    </div>
  );
};

export default TaskDescriptionSection;
