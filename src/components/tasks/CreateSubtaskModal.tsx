import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AsyncSelect } from '@/components/ui/async-select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTranslations } from '@/hooks/useTranslations';
import { useCreateTask, useCreateTaskHierarchy } from '@/hooks/useTasks';
import { useUser } from '@/hooks/useUser';
import { useProjectContributors } from '@/hooks/useProjects';
import type { CreateTaskRequest, Task } from '@/types/task';
import { getApiErrorMessage, cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

// Types
type AssigneeItem = {
  id: string;
  user: {
    id: string;
    name: string;
  };
  userId?: string;
  role?: string;
  joinedAt?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  parentTask: Task;
  projectId: string;
};

// Form schema for both modes
const createSubtaskSchema = z
  .object({
    mode: z.enum(['new', 'existing']),
    title: z.string().optional(),
    taskId: z.string().optional(),
  })
  .refine(
    data => {
      if (data.mode === 'new') {
        return data.title && data.title.length > 0;
      }
      if (data.mode === 'existing') {
        return data.taskId && data.taskId.length > 0;
      }
      return false;
    },
    {
      message:
        'Please provide either a title for new task or select an existing task',
    }
  );

type CreateSubtaskFormData = z.infer<typeof createSubtaskSchema>;

// Default limit for task search results
const DEFAULT_TASK_SEARCH_LIMIT = 50;

export const CreateSubtaskModal = ({
  isOpen,
  onClose,
  parentTask,
  projectId,
}: Props) => {
  const { t } = useTranslations();
  const { mutateAsync: createTask, isPending: isCreatingTask } =
    useCreateTask();
  const { mutateAsync: createHierarchy, isPending: isCreatingHierarchy } =
    useCreateTaskHierarchy();
  const { data: currentUser } = useUser();
  const { data: contributors } = useProjectContributors(projectId);

  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const form = useForm<CreateSubtaskFormData>({
    resolver: zodResolver(createSubtaskSchema),
    defaultValues: {
      mode: 'new',
      title: '',
      taskId: '',
    },
  });

  const currentMode = form.watch('mode');

  // Create async task search fetcher
  const searchTasks = async (query?: string): Promise<Task[]> => {
    const { TasksService } = await import('@/services/tasks');
    const searchResult = await TasksService.searchProjectTasks(projectId, {
      ...(query && { query }),
      limit: DEFAULT_TASK_SEARCH_LIMIT,
    });

    // Filter out current task and any existing children
    const existingChildIds =
      parentTask.hierarchy?.children?.map(c => c.childTaskId) || [];
    const filteredTasks = searchResult.tasks
      .filter(
        task => task.id !== parentTask.id && !existingChildIds.includes(task.id)
      )
      .sort((a, b) => a.title.localeCompare(b.title));

    return filteredTasks;
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

  // Create assignee list
  const assigneeItems: AssigneeItem[] = [];
  if (contributors) {
    contributors.forEach(contributor => {
      assigneeItems.push({
        id: contributor.id,
        user: {
          id: contributor.userId || contributor.user.id,
          name: contributor.user.name,
        },
        userId: contributor.userId,
        role: contributor.role,
        joinedAt: contributor.joinedAt,
      });
    });

    // Add current user if not already in contributors
    if (
      currentUser &&
      !assigneeItems.some(item => item.user.id === currentUser.id)
    ) {
      assigneeItems.unshift({
        id: currentUser.id,
        user: {
          id: currentUser.id,
          name: currentUser.name,
        },
      });
    }
  }

  const handleClose = () => {
    form.reset();
    setSelectedTaskId('');
    onClose();
  };

  const onSubmit = async (data: CreateSubtaskFormData) => {
    try {
      if (data.mode === 'new') {
        // Create new task
        const newTaskData: CreateTaskRequest = {
          title: data.title!,
          priority: 'MEDIUM',
          ...(currentUser?.id && { assigneeId: currentUser.id }),
        };

        const newTask = await createTask({
          projectId,
          data: newTaskData,
        });

        // Create hierarchy relationship
        await createHierarchy({
          projectId,
          parentTaskId: parentTask.id,
          data: {
            childTaskId: newTask.id,
          },
        });

        toast.success(t('tasks.subtasks.add.success'));
      } else {
        // Add existing task as child
        await createHierarchy({
          projectId,
          parentTaskId: parentTask.id,
          data: {
            childTaskId: data.taskId!,
          },
        });

        toast.success(t('tasks.subtasks.add.existingSuccess'));
      }

      handleClose();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage || t('tasks.subtasks.add.error'));
    }
  };

  const isSubmitting = isCreatingTask || isCreatingHierarchy;

  const getButtonText = () => {
    if (isSubmitting) return t('tasks.subtasks.add.adding');
    if (currentMode === 'new') return t('tasks.subtasks.add.addButton');
    return t('tasks.subtasks.add.addExistingButton');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="w-[95vw] max-w-md sm:max-w-lg mx-2 sm:mx-0"
        data-testid="create-subtask-modal"
      >
        <DialogHeader>
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-left text-lg sm:text-xl">
                {t('tasks.subtasks.add.title')}
              </DialogTitle>
              <DialogDescription className="text-left text-sm">
                {t('tasks.subtasks.add.description')} "{parentTask.title}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Mode Selection */}
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tasks.subtasks.add.modeLabel')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value);
                        // Reset form fields when switching modes
                        form.setValue('title', '');
                        form.setValue('taskId', '');
                        setSelectedTaskId('');
                      }}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id="new" />
                        <Label htmlFor="new">
                          {t('tasks.subtasks.add.optionNew')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="existing" id="existing" />
                        <Label htmlFor="existing">
                          {t('tasks.subtasks.add.optionExisting')}
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional Form Fields */}
            {currentMode === 'new' && (
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tasks.subtasks.add.titleLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('tasks.subtasks.add.titlePlaceholder')}
                        disabled={isSubmitting}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentMode === 'existing' && (
              <div className="space-y-2">
                <Label>{t('tasks.subtasks.add.existingTaskLabel')}</Label>
                <AsyncSelect<Task>
                  fetcher={searchTasks}
                  renderOption={task => (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{task.title}</span>
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
                  )}
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
                  placeholder={t('tasks.subtasks.add.existingTaskPlaceholder')}
                  value={selectedTaskId}
                  onChange={value => {
                    setSelectedTaskId(value);
                    form.setValue('taskId', value);
                  }}
                  width="100%"
                  noResultsMessage={t('tasks.subtasks.add.noTasksFound')}
                />
                {form.formState.errors.taskId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.taskId.message}
                  </p>
                )}
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  (currentMode === 'existing' && !selectedTaskId)
                }
                className="flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                {getButtonText()}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {t('tasks.subtasks.add.cancelButton')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubtaskModal;
