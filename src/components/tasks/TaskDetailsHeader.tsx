import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useUpdateTask } from '@/hooks/useTasks';
import { toast } from 'sonner';
import type { Task } from '@/types/task';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateTaskStatus } from '@/hooks/useTasks';
import { getAvailableStatuses, getStatusLabel } from '@/lib/task-status';
import { motion } from 'framer-motion';
import type { TaskStatus } from '@/types/task';

type Props = {
  task: Task;
  projectId: string;
  taskId: string;
};

const TaskDetailsHeader = ({ task, projectId, taskId }: Props) => {
  const { t } = useTranslations();
  const { mutateAsync: updateTask, isPending: isUpdatingTask } =
    useUpdateTask();
  const { mutateAsync: updateTaskStatus, isPending: isUpdatingStatus } =
    useUpdateTaskStatus();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task || !projectId || !taskId) return;
    if (newStatus === task.status) return;
    try {
      await updateTaskStatus({
        projectId,
        taskId,
        data: { status: newStatus },
      });
      toast.success(t('tasks.detail.statusUpdateSuccess'));
    } catch {
      toast.error(t('tasks.detail.statusUpdateError'));
    }
  };

  const handleStartEditTitle = () => {
    if (!task) return;
    setTitleDraft(task.title);
    setIsEditingTitle(true);
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
    setTitleDraft('');
  };

  const handleSaveTitle = async () => {
    if (!task || !projectId || !taskId) return;
    if (!titleDraft.trim()) {
      toast.error(t('tasks.detail.titleRequired'));
      return;
    }
    try {
      await updateTask({
        projectId,
        taskId,
        data: { title: titleDraft.trim() },
      });
      toast.success(t('tasks.detail.titleUpdateSuccess'));
      setIsEditingTitle(false);
      setTitleDraft('');
    } catch {
      toast.error(t('tasks.detail.titleUpdateError'));
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditTitle();
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-4 mb-6">
      {/* Title Section */}
      <div className="min-w-0 flex-1">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              placeholder={t('tasks.detail.titlePlaceholder')}
              className="text-xl sm:text-2xl lg:text-3xl font-bold h-auto py-2 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              data-testid="title-input"
              autoFocus
            />
            <div className="flex gap-1">
              <Button
                onClick={handleSaveTitle}
                disabled={isUpdatingTask}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                data-testid="save-title-button"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancelEditTitle}
                disabled={isUpdatingTask}
                size="sm"
                className="h-8 w-8 p-0"
                data-testid="cancel-title-button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="group cursor-pointer rounded-md p-2 -m-2 hover:bg-muted/50 transition-colors"
            onClick={handleStartEditTitle}
            data-testid="title-container"
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight break-words">
              {task.title}
            </h1>
          </div>
        )}
      </div>

      {/* Status Section */}
      <div className="flex justify-start sm:justify-end flex-shrink-0">
        <motion.div
          animate={isUpdatingStatus ? { scale: 0.5 } : { scale: 1 }}
          transition={{ duration: 0.1 }}
        >
          <Select
            value={task.status}
            onValueChange={handleStatusChange}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger
              className="w-32 sm:w-40 h-9 text-sm sm:text-base"
              data-testid="task-status-select"
            >
              <SelectValue>{getStatusLabel(task.status, t)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {getAvailableStatuses(task.status).map(status => (
                <SelectItem
                  key={status}
                  value={status}
                  data-testid={`task-status-option-${status}`}
                >
                  {getStatusLabel(status, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>
    </div>
  );
};

export default TaskDetailsHeader;
