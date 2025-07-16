import type { TaskComment as TaskCommentType } from '@/types/comment';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import TaskComment from './TaskComment';
import CreateCommentModal from './CreateCommentModal';
import { AnimatedList } from '@/components/ui/animated-list';

type Props = {
  comments: TaskCommentType[] | undefined;
  isLoading: boolean;
  error?: Error | null;
  ownerId?: string | undefined;
  projectId: string;
};

const TaskComments = ({
  comments,
  isLoading,
  error,
  ownerId,
  projectId,
}: Props) => {
  const { currentLanguage, t } = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-base font-semibold text-foreground">
          {t('tasks.comments.title')}
        </h3>
        <Button
          variant="accent"
          size="icon"
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <CreateCommentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        projectId={projectId}
        taskId={comments?.[0]?.taskId ?? ''}
      />
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
            />
          )}
        />
      )}
    </div>
  );
};

export default TaskComments;
