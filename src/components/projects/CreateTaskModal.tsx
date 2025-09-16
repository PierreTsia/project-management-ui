import { useState, useMemo, useEffect } from 'react';
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
import { useCreateTask } from '@/hooks/useTasks';
import { useUser } from '@/hooks/useUser';
import { useProjectContributors, useProjects } from '@/hooks/useProjects';
import { TASK_PRIORITIES, type CreateTaskRequest } from '@/types/task';
import { cn, getApiErrorMessage } from '@/lib/utils';
import { CheckSquare, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

// Types for assignee selection
type AssigneeItem = {
  id: string;
  user: {
    id: string;
    name: string;
  };
};

type AssigneeSelectItemsProps = {
  contributorsLoading: boolean;
  showProjectSelector: boolean;
  selectedProjectId: string | undefined;
  availableAssignees?: AssigneeItem[];
};

const AssigneeSelectItems = ({
  contributorsLoading,
  showProjectSelector,
  selectedProjectId,
  availableAssignees,
}: AssigneeSelectItemsProps) => {
  if (contributorsLoading) {
    return (
      <SelectItem value="loading" disabled>
        Loading assignees...
      </SelectItem>
    );
  }

  if (showProjectSelector && !selectedProjectId) {
    return (
      <SelectItem value="no-project" className="text-muted-foreground" disabled>
        Please select a project first
      </SelectItem>
    );
  }

  return (
    <>
      {availableAssignees?.map(contributor => (
        <SelectItem key={contributor.id} value={contributor.user.id}>
          {contributor.user.name}
        </SelectItem>
      ))}
    </>
  );
};

// Base schema for project mode (projectId provided)
const baseCreateTaskSchema = z.object({
  title: z
    .string()
    .min(2, 'tasks.create.validation.titleMinLength')
    .max(255, 'tasks.create.validation.titleMaxLength'),
  description: z
    .string()
    .max(5000, 'tasks.create.validation.descriptionMaxLength')
    .optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: z.date().optional(),
  assigneeId: z.string().optional(), // Optional per API contract
});

// Global mode schema (projectId required)
const globalCreateTaskSchema = baseCreateTaskSchema.extend({
  projectId: z.string().min(1, 'tasks.create.validation.projectRequired'),
});

type CreateTaskFormData = z.infer<typeof baseCreateTaskSchema> & {
  projectId?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string; // Optional - if provided, hide project selector
};

export const CreateTaskModal = ({ isOpen, onClose, projectId }: Props) => {
  const { t } = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: createTask } = useCreateTask();
  const { data: currentUser } = useUser();

  // Conditional data fetching based on mode
  const showProjectSelector = !projectId;
  const { data: userProjects } = useProjects();

  // Use appropriate schema based on mode
  const formSchema = showProjectSelector
    ? globalCreateTaskSchema
    : baseCreateTaskSchema;

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM' as const,
      dueDate: undefined,
      assigneeId: currentUser?.id || '',
      ...(showProjectSelector && { projectId: '' }),
    },
  });

  // Get selected project ID for contributors fetching
  const selectedProjectId = projectId || form.watch('projectId');
  const { data: contributors, isLoading: contributorsLoading } =
    useProjectContributors(selectedProjectId || '');

  // Create a list of all possible assignees (contributors + current user if not already included)
  const availableAssignees = useMemo(() => {
    if (!contributors || !currentUser) return [];

    // Check if current user is already in contributors
    const currentUserInContributors = contributors.some(
      c => c.user.id === currentUser.id
    );

    // If current user is not in contributors, add them
    if (!currentUserInContributors) {
      return [
        {
          id: `current-${currentUser.id}`,
          userId: currentUser.id,
          role: 'READ' as const,
          joinedAt: new Date().toISOString(),
          user: currentUser,
        },
        ...contributors,
      ];
    }

    return contributors;
  }, [contributors, currentUser]);

  // Clear assignee when project changes in global mode
  useEffect(() => {
    if (showProjectSelector && selectedProjectId) {
      form.setValue('assigneeId', '');
    }
  }, [selectedProjectId, showProjectSelector, form]);

  const handleSubmit = async (data: CreateTaskFormData) => {
    setIsSubmitting(true);
    try {
      const taskData: CreateTaskRequest = {
        title: data.title,
        ...(data.description && { description: data.description }),
        ...(data.priority && { priority: data.priority }),
        ...(data.dueDate && { dueDate: data.dueDate.toISOString() }),
        ...(data.assigneeId && { assigneeId: data.assigneeId }),
      };

      // Use projectId from prop or form data
      const targetProjectId = projectId || data.projectId;

      if (!targetProjectId) {
        throw new Error('Project ID is required');
      }

      await createTask({
        projectId: targetProjectId,
        data: taskData,
      });

      form.reset();
      toast.success(t('tasks.create.success'));
      onClose();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      console.error('Failed to create task:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-left">
                {t('tasks.create.title')}
              </DialogTitle>
              <DialogDescription className="text-left">
                {t('tasks.create.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tasks.create.titleLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('tasks.create.titlePlaceholder')}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showProjectSelector && (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tasks.create.projectLabel')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('tasks.create.projectPlaceholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userProjects?.projects?.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tasks.create.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('tasks.create.descriptionPlaceholder')}
                      className="min-h-[80px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tasks.create.priorityLabel')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('tasks.create.priorityPlaceholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_PRIORITIES.map(priority => (
                          <SelectItem key={priority} value={priority}>
                            {t(`tasks.priority.${priority}`)}
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
                name="assigneeId"
                render={({ field }) => {
                  const isAssigneeDisabled =
                    isSubmitting ||
                    contributorsLoading ||
                    (showProjectSelector && !selectedProjectId);

                  const getAssigneePlaceholder = () => {
                    if (contributorsLoading) return 'Loading assignees...';
                    if (showProjectSelector && !selectedProjectId)
                      return 'Select a project first';
                    return t('tasks.create.assigneePlaceholder');
                  };

                  return (
                    <FormItem>
                      <FormLabel>{t('tasks.create.assigneeLabel')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        disabled={isAssigneeDisabled}
                      >
                        <FormControl>
                          <SelectTrigger className="min-w-[100px]">
                            <SelectValue
                              placeholder={getAssigneePlaceholder()}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <AssigneeSelectItems
                            contributorsLoading={contributorsLoading}
                            showProjectSelector={showProjectSelector}
                            selectedProjectId={selectedProjectId}
                            availableAssignees={availableAssignees}
                          />
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('tasks.create.dueDateLabel')}</FormLabel>
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
                          disabled={date => date < new Date()}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="mt-3 sm:mt-0"
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t('tasks.create.creating')
                  : t('tasks.create.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
