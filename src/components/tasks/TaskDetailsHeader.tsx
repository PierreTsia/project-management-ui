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
import { UserAvatar } from '@/components/ui/user-avatar';
import { Badge } from '@/components/ui/badge';
import { AssignTaskModal } from '@/components/projects/AssignTaskModal';
import { getApiErrorMessage } from '@/lib/utils';
import { PriorityBadge } from '@/components/ui/priority-badge';

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
  const [showAssignModal, setShowAssignModal] = useState(false);

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
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage);
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
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage);
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

  const handleAssignClick = () => {
    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
  };

  const handlePriorityChange = async (newPriority: Task['priority']) => {
    if (!task || !projectId || !taskId) return;
    if (newPriority === task.priority) return;
    try {
      await updateTask({
        projectId,
        taskId,
        data: { priority: newPriority },
      });
      toast.success(t('tasks.detail.statusUpdateSuccess'));
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6 pb-8 border-b border-border">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Title Section */}
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="space-y-3">
              <PriorityBadge
                priority={task.priority}
                onPriorityChange={handlePriorityChange}
                size="md"
              />
              <div className="flex items-start gap-3">
                <Input
                  value={titleDraft}
                  onChange={e => setTitleDraft(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  placeholder={t('tasks.detail.titlePlaceholder')}
                  className="text-2xl lg:text-3xl xl:text-4xl font-bold h-auto py-3 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                  data-testid="title-input"
                  autoFocus
                />
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSaveTitle}
                    disabled={isUpdatingTask}
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 p-0 hover:bg-green-500/10 hover:text-green-500"
                    data-testid="save-title-button"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCancelEditTitle}
                    disabled={isUpdatingTask}
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500"
                    data-testid="cancel-title-button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <PriorityBadge
                priority={task.priority}
                onPriorityChange={handlePriorityChange}
                size="md"
              />
              <div
                className="group cursor-pointer rounded-lg p-3 -m-3 hover:bg-muted/30 transition-all duration-200"
                onClick={handleStartEditTitle}
                data-testid="title-container"
              >
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight break-words text-foreground">
                  {task.title}
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* Status Section */}
        <div className="flex-shrink-0">
          <motion.div
            animate={isUpdatingStatus ? { scale: 0.95 } : { scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Select
              value={task.status}
              onValueChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger
                className="w-40 lg:w-48 h-11 text-sm font-medium shadow-sm border-2 hover:border-primary/50 transition-colors"
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

      {/* Assigned User Section */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-4"
        data-testid="task-assigned-user-section"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              {t('tasks.detail.assignedTo')}
            </span>
            {task.assignee ? (
              <button
                onClick={handleAssignClick}
                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 -m-2"
                data-testid="assign-user-button"
              >
                <UserAvatar user={task.assignee} size="md" showName />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground">
                    Click to change
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={handleAssignClick}
                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 -m-2"
                data-testid="assign-user-button"
              >
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {t('tasks.detail.unassigned')}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground">
                    Click to assign
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      <AssignTaskModal
        isOpen={showAssignModal}
        onOpenChange={handleCloseAssignModal}
        task={task}
        projectId={projectId}
      />
    </div>
  );
};

export default TaskDetailsHeader;
