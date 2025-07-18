import type { TaskComment as TaskCommentType } from '@/types/comment';
import { useState } from 'react';
import { showAbsoluteForRecentDate } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ConfirmDeleteCommentModal from './ConfirmDeleteCommentModal';
import { Pencil, Trash2 } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import {
  useDeleteTaskComment,
  useUpdateTaskComment,
} from '@/hooks/useTaskComments';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/hooks/useTranslations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import type { TranslationKey } from '@/hooks/useTranslations';

type Props = {
  comment: TaskCommentType;
  currentLanguage?: 'en' | 'fr';
  ownerId?: string | undefined;
  projectId: string;
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const editCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'tasks.comments.validation.contentRequired')
    .max(1000, 'tasks.comments.validation.contentMaxLength'),
});

const TaskComment = ({
  comment,
  currentLanguage,
  ownerId,
  projectId,
}: Props) => {
  const [showDelete, setShowDelete] = useState(false);
  const { data: currentUser } = useUser();
  const { mutateAsync: deleteComment, isPending } = useDeleteTaskComment();
  const { mutateAsync: updateComment, isPending: isUpdating } =
    useUpdateTaskComment();
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<{ content: string }>({
    resolver: zodResolver(editCommentSchema),
    defaultValues: { content: comment.content },
  });
  const { t } = useTranslations();

  const handleEdit = () => {
    setIsEditing(true);
    form.reset({ content: comment.content });
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    form.reset({ content: comment.content });
  };

  const handleEditSave = async (data: { content: string }) => {
    try {
      await updateComment({
        projectId,
        taskId: comment.taskId,
        commentId: comment.id,
        content: data.content,
      });
      toast.success(t('tasks.comments.editSuccess'));
      setIsEditing(false);
    } catch {
      toast.error(t('tasks.comments.editError'));
    }
  };

  const canEdit =
    currentUser &&
    (currentUser.id === comment.user.id || currentUser.id === ownerId);

  const handleDelete = async () => {
    try {
      await deleteComment({
        projectId,
        taskId: comment.taskId,
        commentId: comment.id,
      });
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setShowDelete(false);
    }
  };

  return (
    <li className="flex items-start gap-3 p-3 rounded-md hover:bg-accent/30 transition group relative">
      <Avatar>
        {comment.user.avatarUrl ? (
          <AvatarImage
            src={comment.user.avatarUrl}
            alt={comment.user.name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
          />
        ) : null}
        <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground truncate">
            {comment.user.name}
          </span>
          <span>·</span>
          <span className="whitespace-nowrap">
            {showAbsoluteForRecentDate(
              new Date(comment.createdAt),
              currentLanguage ?? 'en'
            )}
          </span>
          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
            <>
              <span>·</span>
              <span className="whitespace-nowrap">
                {t('tasks.comments.lastModified' as TranslationKey)}:{' '}
                {showAbsoluteForRecentDate(
                  new Date(comment.updatedAt),
                  currentLanguage ?? 'en'
                )}
              </span>
            </>
          )}
        </div>
        <div className="text-sm text-foreground mt-1 break-words">
          {isEditing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleEditSave)}
                className="flex flex-col gap-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('tasks.comments.contentLabel')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          minLength={1}
                          maxLength={1000}
                          rows={4}
                          disabled={isUpdating}
                          data-testid="edit-comment-textarea"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 mt-1">
                  <Button
                    size="sm"
                    variant="success"
                    type="submit"
                    disabled={isUpdating}
                    data-testid="save-edit-comment"
                  >
                    {isUpdating ? t('common.saving') : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={handleEditCancel}
                    disabled={isUpdating}
                    data-testid="cancel-edit-comment"
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <>{comment.content}</>
          )}
        </div>
      </div>
      {canEdit && !isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition absolute right-3 top-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Edit comment"
            onClick={handleEdit}
            disabled={isPending || isEditing}
            data-testid="edit-comment-button"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            aria-label="Delete comment"
            data-testid="delete-comment-button"
            onClick={() => setShowDelete(true)}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      <ConfirmDeleteCommentModal
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
      />
    </li>
  );
};

export default TaskComment;
