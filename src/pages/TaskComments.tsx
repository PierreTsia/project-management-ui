import type { TaskComment as TaskCommentType } from '@/types/comment';
import { useTranslations } from '@/hooks/useTranslations';

import TaskComment from './TaskComment';

type Props = {
  comments: TaskCommentType[] | undefined;
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
      {comments?.length === 0 && !isLoading && (
        <p className="text-muted-foreground text-sm pl-4">
          {t('tasks.comments.empty')}
        </p>
      )}
      {comments && !!comments.length && (
        <ul className="space-y-2">
          {comments.map(comment => (
            <TaskComment
              key={comment.id}
              comment={comment}
              currentLanguage={currentLanguage}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskComments;
