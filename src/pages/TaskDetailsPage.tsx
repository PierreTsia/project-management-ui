import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '@/hooks/useTasks';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProjectDetailsSkeleton } from '@/components/projects/ProjectDetailsSkeleton';
import { ArrowLeft, Calendar, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useTaskComments } from '@/hooks/useTaskComments';
import TaskComments from '../components/tasks/TaskComments';
import { useProject } from '@/hooks/useProjects';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateTaskStatus, useUpdateTask } from '@/hooks/useTasks';
import { getAvailableStatuses, getStatusLabel } from '@/lib/task-status';
import { toast } from 'sonner';
import type { TaskStatus } from '@/types/task';
import { motion } from 'framer-motion';
import { Calendar as DatePickerCalendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import type { TranslationKey } from '@/hooks/useTranslations';

const TaskDetailsPage = () => {
  const { id: projectId, taskId } = useParams<{ id: string; taskId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslations();

  const { data: task, isLoading, error } = useTask(projectId!, taskId!);
  const { data: project } = useProject(projectId!);
  const {
    data: comments,
    isLoading: isLoadingComments,
    error: commentsError,
  } = useTaskComments(projectId!, taskId!);

  const { mutateAsync: updateTaskStatus, isPending: isUpdatingStatus } =
    useUpdateTaskStatus();
  const { mutateAsync: updateTask, isPending: isUpdatingTask } =
    useUpdateTask();
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false);

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

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
      toast.success(t('tasks.detail.dueDateUpdateSuccess' as TranslationKey));
      setDueDatePickerOpen(false);
    } catch {
      toast.error(t('tasks.detail.dueDateUpdateError' as TranslationKey));
    }
  };

  if (isLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{t('tasks.detail.loadError')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button - Full Width */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-6">
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight truncate">
              {task.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {/* You can add more metadata here if needed */}
            </div>
          </div>
          {/* Status select on the right */}
          <div className="mt-2 sm:mt-0 flex-shrink-0 flex gap-2 justify-end">
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
                  className="w-40 h-9 text-base"
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

        {/* Main Content */}
        <div className="space-y-8">
          {/* Dates */}
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
                <Popover
                  open={dueDatePickerOpen}
                  onOpenChange={setDueDatePickerOpen}
                >
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
                      selected={
                        task.dueDate ? new Date(task.dueDate) : undefined
                      }
                      onSelect={handleDueDateChange}
                      disabled={date => date < new Date()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Popover
                  open={dueDatePickerOpen}
                  onOpenChange={setDueDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      disabled={isUpdatingTask}
                      data-testid="set-due-date-button"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t('tasks.detail.setDueDate' as TranslationKey)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DatePickerCalendar
                      mode="single"
                      selected={
                        task.dueDate ? new Date(task.dueDate) : undefined
                      }
                      onSelect={handleDueDateChange}
                      disabled={date => date < new Date()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
                {t('tasks.detail.description')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                {task.description}
              </p>
            </div>
          )}

          {/* Comments Section */}
          <TaskComments
            projectId={projectId ?? ''}
            taskId={taskId ?? ''}
            comments={comments}
            isLoading={isLoadingComments}
            error={commentsError}
            ownerId={project?.ownerId}
          />
          {/* Placeholder for editing functionality */}
          <div className="space-y-2">
            {/* TODO: Add editing form/modal here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
