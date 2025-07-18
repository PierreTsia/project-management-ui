import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';
import { Calendar as DatePickerCalendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUpdateTask } from '@/hooks/useTasks';
import { toast } from 'sonner';
import type { Task } from '@/types/task';

type Props = {
  task: Task;
  projectId: string;
  taskId: string;
};

const TaskDatesSection = ({ task, projectId, taskId }: Props) => {
  const { t, currentLanguage } = useTranslations();
  const { mutateAsync: updateTask, isPending: isUpdatingTask } =
    useUpdateTask();
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false);

  const handleEditDueDate = () => {
    setDueDatePickerOpen(true);
  };

  const handleDueDateChange = async (date: Date | undefined) => {
    if (!task || !projectId || !taskId) return;
    try {
      await updateTask({
        projectId,
        taskId,
        data: date ? { dueDate: date.toISOString() } : {},
      });
      toast.success(t('tasks.detail.dueDateUpdateSuccess'));
      setDueDatePickerOpen(false);
    } catch {
      toast.error(t('tasks.detail.dueDateUpdateError'));
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">
          {t('tasks.dates.created')}
        </span>
        <Badge variant="outline" className="text-xs font-normal">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(task.createdAt, currentLanguage)}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">
          {t('tasks.dates.updated')}
        </span>
        <Badge variant="outline" className="text-xs font-normal">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDate(task.updatedAt, currentLanguage)}
        </Badge>
      </div>
      {task.dueDate ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {t('tasks.dates.due')}
          </span>
          <Popover open={dueDatePickerOpen} onOpenChange={setDueDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs cursor-pointer hover:bg-accent"
                disabled={isUpdatingTask}
                data-testid="edit-due-date-button"
                onClick={handleEditDueDate}
              >
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(task.dueDate, currentLanguage)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DatePickerCalendar
                mode="single"
                selected={task.dueDate ? new Date(task.dueDate) : undefined}
                onSelect={handleDueDateChange}
                disabled={date => date < new Date()}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Popover open={dueDatePickerOpen} onOpenChange={setDueDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                disabled={isUpdatingTask}
                data-testid="set-due-date-button"
              >
                <Plus className="h-3 w-3 mr-1" />
                {t('tasks.detail.setDueDate')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DatePickerCalendar
                mode="single"
                selected={task.dueDate ? new Date(task.dueDate) : undefined}
                onSelect={handleDueDateChange}
                disabled={date => date < new Date()}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default TaskDatesSection;
