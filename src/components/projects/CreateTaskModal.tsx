import { useState, useMemo } from 'react';
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
import { useProjectContributors } from '@/hooks/useProjects';
import { TASK_PRIORITIES, type CreateTaskRequest } from '@/types/task';
import { cn, getApiErrorMessage } from '@/lib/utils';
import { CheckSquare, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

// Form validation schema
const createTaskSchema = z.object({
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
  assigneeId: z.string().min(1, 'tasks.create.validation.assigneeRequired'),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
};

export const CreateTaskModal = ({ isOpen, onClose, projectId }: Props) => {
  const { t } = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: createTask } = useCreateTask();
  const { data: currentUser } = useUser();
  const { data: contributors } = useProjectContributors(projectId);

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

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM' as const,
      dueDate: undefined,
      assigneeId: currentUser?.id || '',
    },
  });

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

      await createTask({
        projectId,
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tasks.create.assigneeLabel')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('tasks.create.assigneePlaceholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableAssignees?.map(contributor => (
                          <SelectItem
                            key={contributor.id}
                            value={contributor.user.id}
                          >
                            {contributor.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
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
