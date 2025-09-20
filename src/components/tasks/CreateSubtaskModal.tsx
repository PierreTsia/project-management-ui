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
import { getApiErrorMessage } from '@/lib/utils';
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

// Simple form schema
const createSubtaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

type CreateSubtaskFormData = z.infer<typeof createSubtaskSchema>;

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

  const form = useForm<CreateSubtaskFormData>({
    resolver: zodResolver(createSubtaskSchema),
    defaultValues: {
      title: '',
    },
  });

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
    onClose();
  };

  const onSubmit = async (data: CreateSubtaskFormData) => {
    try {
      // Create new task
      const newTaskData: CreateTaskRequest = {
        title: data.title,
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
                Create a new subtask for "{parentTask.title}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

export default CreateSubtaskModal;
