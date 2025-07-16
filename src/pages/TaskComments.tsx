import type { TaskComment } from '@/types/comment';
import { formatDate } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';

type Props = {
  comments: TaskComment[] | undefined;
  isLoading: boolean;
  error?: Error | null;
};

const TaskComments = ({ comments, isLoading, error }: Props) => {
  const { currentLanguage, t } = useTranslations();
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
        {t('tasks.comments.title')}
      </h3>
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
      {comments && comments.length === 0 && !isLoading && (
        <p className="text-muted-foreground text-sm pl-4">
          {t('tasks.comments.empty')}
        </p>
      )}
      {comments && comments.length > 0 && (
        <ul className="space-y-2">
          {comments.map(comment => (
            <li key={comment.id} className="pl-4 border-l-2 border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {comment.user.name}
                </span>
                <span>·</span>
                <span>{formatDate(comment.createdAt, currentLanguage)}</span>
              </div>
              <div className="text-sm text-foreground mt-1">
                {comment.content}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskComments;
