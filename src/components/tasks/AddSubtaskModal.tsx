import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/useTranslations';
import {
  useCreateTask,
  useCreateTaskHierarchy,
  useSearchAllUserTasks,
} from '@/hooks/useTasks';
import { useUser } from '@/hooks/useUser';
import { useProjectContributors } from '@/hooks/useProjects';
import {
  TASK_PRIORITIES,
  type CreateTaskRequest,
  type Task,
} from '@/types/task';
import { cn, getApiErrorMessage } from '@/lib/utils';
import { CalendarIcon, Search, Plus } from 'lucide-react';
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

// Form schema
const subtaskSchema = z
  .object({
    mode: z.enum(['existing', 'new']),
    existingTaskId: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.date().optional(),
    assigneeId: z.string().optional(),
  })
  .refine(
    data => {
      if (data.mode === 'existing') {
        return data.existingTaskId && data.existingTaskId.length > 0;
      } else {
        return data.title && data.title.length > 0 && data.priority;
      }
    },
    {
      message: 'Please fill in all required fields',
      path: ['mode'],
    }
  );

type SubtaskFormData = z.infer<typeof subtaskSchema>;

// Async task search component
const TaskSearchSelect = ({
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className,
  projectId,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
  projectId: string;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslations();

  // Use the search API with debounced query
  const { data: searchResults, isLoading: isSearching } = useSearchAllUserTasks(
    {
      ...(searchQuery && { query: searchQuery }),
      projectId: projectId, // Only search within the same project
      limit: 20,
    }
  );

  const tasks = searchResults?.tasks || [];

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {value && <span>Selected Task</span>}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('tasks.subtasks.add.existingTaskPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-auto">
          {isSearching && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          {!isSearching && tasks.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery
                ? t('tasks.subtasks.add.noTasksFound')
                : t('tasks.subtasks.add.noTasksAvailable')}
            </div>
          )}
          {!isSearching &&
            tasks.length > 0 &&
            tasks.map(task => (
              <SelectItem key={task.id} value={task.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{task.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {task.projectName}
                  </span>
                </div>
              </SelectItem>
            ))}
        </div>
      </SelectContent>
    </Select>
  );
};

// Assignee selection component
const AssigneeSelect = ({
  contributors,
  contributorsLoading,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className,
}: {
  contributors: AssigneeItem[];
  contributorsLoading: boolean;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}) => {
  if (contributorsLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {contributors.map(contributor => (
          <SelectItem key={contributor.id} value={contributor.user.id}>
            {contributor.user.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const AddSubtaskModal = ({
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
  const { data: contributors, isLoading: contributorsLoading } =
    useProjectContributors(projectId);

  const [mode, setMode] = useState<'existing' | 'new'>('new');

  const form = useForm<SubtaskFormData>({
    resolver: zodResolver(subtaskSchema),
    defaultValues: {
      mode: 'new',
      existingTaskId: '',
      title: '',
      description: '',
      priority: 'MEDIUM' as const,
      dueDate: undefined,
      assigneeId: currentUser?.id || '',
    },
  });

  // Watch mode changes
  const watchedMode = form.watch('mode');
  if (watchedMode !== mode) {
    setMode(watchedMode);
    form.clearErrors();
  }

  // Create assignee list
  const assigneeItems = useMemo(() => {
    if (!contributors) return [];

    const items: AssigneeItem[] = contributors.map(contributor => ({
      id: contributor.id,
      user: {
        id: contributor.userId || contributor.user.id,
        name: contributor.user.name,
      },
      userId: contributor.userId,
      role: contributor.role,
      joinedAt: contributor.joinedAt,
    }));

    // Add current user if not already in contributors
    if (currentUser && !items.some(item => item.user.id === currentUser.id)) {
      items.unshift({
        id: currentUser.id,
        user: {
          id: currentUser.id,
          name: currentUser.name,
        },
      });
    }

    return items;
  }, [contributors, currentUser]);

  const handleClose = useCallback(() => {
    form.reset();
    setMode('new');
    onClose();
  }, [form, onClose]);

  const onSubmit = async (data: SubtaskFormData) => {
    try {
      if (data.mode === 'existing') {
        // Create hierarchy with existing task
        await createHierarchy({
          projectId,
          parentTaskId: parentTask.id,
          data: {
            childTaskId: data.existingTaskId!,
          },
        });
        toast.success(t('tasks.subtasks.add.success'));
      } else {
        // Create new task and then create hierarchy
        const newTaskData: CreateTaskRequest = {
          title: data.title!,
          ...(data.description && { description: data.description }),
          priority: data.priority!,
          ...(data.dueDate && { dueDate: format(data.dueDate, 'yyyy-MM-dd') }),
          ...(data.assigneeId && { assigneeId: data.assigneeId }),
        };

        const newTask = await createTask({
          projectId,
          data: newTaskData,
        });

        await createHierarchy({
          projectId,
          parentTaskId: parentTask.id,
          data: {
            childTaskId: newTask.id,
          },
        });
        toast.success(t('tasks.subtasks.add.success'));
      }

      handleClose();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage || t('tasks.subtasks.add.error'));
    }
  };

  const isSubmitting = isCreatingTask || isCreatingHierarchy;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl mx-2 sm:mx-0"
        data-testid="add-subtask-modal"
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
                {t('tasks.subtasks.add.description')}
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
                <FormItem className="space-y-3">
                  <FormLabel>Choose Option</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={
                          field.value === 'existing' ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => field.onChange('existing')}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {t('tasks.subtasks.add.optionExisting')}
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === 'new' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => field.onChange('new')}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {t('tasks.subtasks.add.optionNew')}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Existing Task Selection */}
            {mode === 'existing' && (
              <FormField
                control={form.control}
                name="existingTaskId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('tasks.subtasks.add.existingTaskLabel')}
                    </FormLabel>
                    <FormControl>
                      <TaskSearchSelect
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        placeholder={t(
                          'tasks.subtasks.add.existingTaskPlaceholder'
                        )}
                        disabled={isSubmitting}
                        projectId={projectId}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* New Task Form */}
            {mode === 'new' && (
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">
                  {t('tasks.subtasks.add.newTaskLabel')}
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('tasks.subtasks.add.titleLabel')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('tasks.subtasks.add.titlePlaceholder')}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('tasks.subtasks.add.descriptionLabel')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t(
                            'tasks.subtasks.add.descriptionPlaceholder'
                          )}
                          disabled={isSubmitting}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('tasks.subtasks.add.priorityLabel')}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ''}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TASK_PRIORITIES.map(priority => (
                              <SelectItem key={priority} value={priority}>
                                {priority}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          {t('tasks.subtasks.add.dueDateLabel')}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                                disabled={isSubmitting}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={date => date < new Date('1900-01-01')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('tasks.subtasks.add.assigneeLabel')}
                      </FormLabel>
                      <FormControl>
                        <AssigneeSelect
                          contributors={assigneeItems}
                          contributorsLoading={contributorsLoading}
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          placeholder="Select assignee"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isSubmitting
                  ? t('tasks.subtasks.add.adding')
                  : t('tasks.subtasks.add.addButton')}
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

export default AddSubtaskModal;
