import type { TaskComment as TaskCommentType } from '@/types/comment';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useCreateTaskComment } from '@/hooks/useTaskComments';
import { toast } from 'sonner';

import TaskComment from './TaskComment';
import { AnimatedList } from '@/components/ui/animated-list';

const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'tasks.comments.validation.contentRequired')
    .max(1000, 'tasks.comments.validation.contentMaxLength'),
});

type CreateCommentFormData = z.infer<typeof createCommentSchema>;

type Props = {
  comments: TaskCommentType[] | undefined;
  isLoading: boolean;
  error?: Error | null;
  ownerId?: string | undefined;
  projectId: string;
  taskId: string;
};

const TaskComments = ({
  comments,
  isLoading,
  error,
  ownerId,
  projectId,
  taskId,
}: Props) => {
  const { currentLanguage, t } = useTranslations();
  const { mutateAsync, isPending } = useCreateTaskComment();

  const form = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { content: '' },
  });

  const handleSubmit = async (data: CreateCommentFormData) => {
    try {
      await mutateAsync({ projectId, taskId, content: data.content });
      toast.success(t('tasks.comments.addSuccess'));
      form.reset();
    } catch {
      toast.error(t('tasks.comments.addError'));
    }
  };

  const handleCancel = () => {
    if (!isPending) {
      form.reset();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-base font-semibold text-foreground">
          {t('tasks.comments.title')}
        </h3>
      </div>

      {/* Inline Comment Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={t('tasks.comments.contentPlaceholder')}
                    minLength={1}
                    maxLength={1000}
                    disabled={isPending}
                    rows={3}
                    data-testid="comment-content-input"
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
              size="sm"
              data-testid="cancel-comment-button"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              size="sm"
              data-testid="confirm-add-comment"
            >
              {isPending ? t('common.saving') : t('tasks.comments.add')}
            </Button>
          </div>
        </form>
      </Form>

      {isLoading && (
        <p className="text-muted-foreground text-sm pl-4">
          {t('tasks.comments.loading')}
        </p>
      )}
      {Boolean(error) && (
        <p className="text-destructive text-sm pl-4">
          {t('tasks.comments.error')}
        </p>
      )}
      {comments?.length === 0 && !isLoading && (
        <p className="text-muted-foreground text-sm pl-4">
          {t('tasks.comments.empty')}
        </p>
      )}
      {comments && !!comments.length && (
        <AnimatedList
          items={comments}
          getKey={comment => comment.id}
          className="space-y-2"
          renderItem={comment => (
            <TaskComment
              comment={comment}
              currentLanguage={currentLanguage}
              ownerId={ownerId}
              projectId={projectId}
            />
          )}
        />
      )}
    </div>
  );
};

export default TaskComments;
