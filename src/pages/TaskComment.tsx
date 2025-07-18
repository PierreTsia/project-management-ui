import type { TaskComment as TaskCommentType } from '@/types/comment';
import { useState } from 'react';
import { showAbsoluteForRecentDate } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ConfirmDeleteCommentModal from './ConfirmDeleteCommentModal';
import { Pencil, Trash2 } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useDeleteTaskComment } from '@/hooks/useTaskComments';
import { toast } from 'sonner';

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

const TaskComment = ({
  comment,
  currentLanguage,
  ownerId,
  projectId,
}: Props) => {
  const [showDelete, setShowDelete] = useState(false);
  const { data: currentUser } = useUser();
  const { mutateAsync: deleteComment, isPending } = useDeleteTaskComment();
  // const [isEditing, setIsEditing] = useState(false); // For future inline edit

  const handleEdit = () => {
    // TODO: Implement real edit logic
    console.log('Edit comment', comment.id);
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
        </div>
        <div className="text-sm text-foreground mt-1 break-words">
          {comment.content}
        </div>
      </div>
      {canEdit && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition absolute right-3 top-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Edit comment"
            onClick={handleEdit}
            disabled={isPending}
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
