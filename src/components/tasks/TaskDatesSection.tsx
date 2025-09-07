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
import { getApiErrorMessage } from '@/lib/utils';

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
    } catch (error) {
      const message =
        getApiErrorMessage(error) || t('tasks.detail.dueDateUpdateError');
      toast.error(message);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
          <Calendar className="h-4 w-4 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Task Dates</h3>
      </div>

      <div className="space-y-4">
        {/* Created Date */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {t('tasks.dates.created')}
          </span>
          <Badge variant="secondary" className="text-xs font-normal">
            {formatDate(task.createdAt, currentLanguage)}
          </Badge>
        </div>

        {/* Updated Date */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {t('tasks.dates.updated')}
          </span>
          <Badge variant="secondary" className="text-xs font-normal">
            {formatDate(task.updatedAt, currentLanguage)}
          </Badge>
        </div>

        {/* Due Date */}
        {task.dueDate ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {t('tasks.dates.due')}
            </span>
            <Popover
              open={dueDatePickerOpen}
              onOpenChange={setDueDatePickerOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-xs cursor-pointer hover:bg-accent border-orange-200 hover:border-orange-300"
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
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {t('tasks.dates.due')}
            </span>
            <Popover
              open={dueDatePickerOpen}
              onOpenChange={setDueDatePickerOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-xs hover:bg-green-500/10 hover:border-green-300 hover:text-green-600"
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
    </div>
  );
};

export default TaskDatesSection;
