import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';
import { useTranslations } from '@/hooks/useTranslations';
import { useDeleteTaskLink } from '@/hooks/useTasks';
import { TaskAddLinkModal } from './TaskAddLinkModal';
import { UnlinkButton } from './UnlinkButton';
import type { Task } from '@/types/task';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

/**
 * Flips a relationship type when viewing from the target task's perspective
 */
const flipRelationshipType = (type: string): string => {
  switch (type) {
    case 'BLOCKS':
      return 'IS_BLOCKED_BY';
    case 'IS_BLOCKED_BY':
      return 'BLOCKS';
    case 'SPLITS_TO':
      return 'SPLITS_FROM';
    case 'SPLITS_FROM':
      return 'SPLITS_TO';
    case 'DUPLICATES':
      return 'IS_DUPLICATED_BY';
    case 'IS_DUPLICATED_BY':
      return 'DUPLICATES';
    case 'RELATES_TO':
      return 'RELATES_TO'; // Symmetric relationship
    default:
      return type;
  }
};

interface TaskRelatedTasksProps {
  projectId: string;
  taskId: string;
  task: Task;
  className?: string;
}

export const TaskRelatedTasks = ({
  projectId,
  taskId,
  task,
  className,
}: TaskRelatedTasksProps) => {
  const { t } = useTranslations();
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const deleteTaskLink = useDeleteTaskLink();

  const hasLinks = (task.links ?? []).length > 0;

  const handleDeleteLink = async (linkId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await deleteTaskLink.mutateAsync({
        projectId,
        taskId,
        linkId,
      });
    } catch (error) {
      console.error('Failed to delete task link:', error);
    }
  };

  // Process links to group bidirectional relationships
  const processedLinks = useMemo(() => {
    type ProcessedLink = {
      task: Task;
      relationshipType: string;
      isBidirectional: boolean;
      linkId: string;
    };

    return (task.links ?? []).reduce<ProcessedLink[]>((acc, link) => {
      const relatedTask =
        link.sourceTaskId === taskId ? link.targetTask : link.sourceTask;

      if (!relatedTask) {
        console.warn('Related task is undefined for link:', link);
        return acc;
      }

      // Determine the relationship from the current task's perspective
      const relationshipType =
        link.sourceTaskId === taskId
          ? link.type
          : flipRelationshipType(link.type);

      // Check if we already have this task
      const existingIndex = acc.findIndex(
        item => item.task.id === relatedTask.id
      );

      if (existingIndex === -1) {
        // New task - add it
        acc.push({
          task: relatedTask,
          relationshipType: relationshipType,
          isBidirectional: false,
          linkId: link.id,
        });
      } else {
        // Existing task - mark as bidirectional and prefer more specific relationship
        const existing = acc[existingIndex];
        existing.isBidirectional = true;

        if (
          relationshipType === 'BLOCKS' ||
          relationshipType === 'IS_BLOCKED_BY'
        ) {
          existing.relationshipType = relationshipType;
        }
        // Keep the first linkId for deletion (we'll need to handle multiple links differently)
        if (!existing.linkId) {
          existing.linkId = link.id;
        }
      }

      return acc;
    }, []);
  }, [taskId, task.links]);

  const getRelationshipBadgeColor = (type: string) => {
    switch (type) {
      case 'BLOCKS':
        return 'bg-red-100 text-red-800';
      case 'IS_BLOCKED_BY':
        return 'bg-orange-100 text-orange-800';
      case 'SPLITS_TO':
        return 'bg-purple-100 text-purple-800';
      case 'SPLITS_FROM':
        return 'bg-purple-100 text-purple-800';
      case 'DUPLICATES':
        return 'bg-gray-100 text-gray-800';
      case 'IS_DUPLICATED_BY':
        return 'bg-gray-100 text-gray-800';
      case 'RELATES_TO':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case 'BLOCKS':
        return t('tasks.relationships.blocks');
      case 'IS_BLOCKED_BY':
        return t('tasks.relationships.isBlockedBy');
      case 'SPLITS_TO':
        return t('tasks.relationships.splitsTo');
      case 'SPLITS_FROM':
        return t('tasks.relationships.splitsFrom');
      case 'DUPLICATES':
        return t('tasks.relationships.duplicates');
      case 'IS_DUPLICATED_BY':
        return t('tasks.relationships.isDuplicatedBy');
      case 'RELATES_TO':
        return t('tasks.relationships.relatesTo');
      default:
        return type;
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <SectionHeader title={t('tasks.detail.relatedTasks')}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddLinkModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('tasks.detail.addRelation')}
        </Button>
      </SectionHeader>
      {hasLinks ? (
        <div className="space-y-1">
          {processedLinks.map(linkItem => (
            <div
              key={linkItem.task.id}
              className="flex items-center justify-start py-1 text-sm"
            >
              <Link
                to={`/projects/${projectId}/${linkItem.task.id}`}
                className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group"
              >
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs px-1.5 py-0.5',
                    getRelationshipBadgeColor(linkItem.relationshipType)
                  )}
                >
                  {getRelationshipLabel(linkItem.relationshipType)}
                </Badge>
                <span className="text-muted-foreground group-hover:text-primary underline transition-colors mr-2">
                  {linkItem.task.title}
                </span>
              </Link>
              <UnlinkButton
                onClick={e => handleDeleteLink(linkItem.linkId, e)}
                disabled={deleteTaskLink.isPending}
                className="ml-1"
                mobileVisible={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('tasks.detail.noRelatedTasks')}
        </p>
      )}

      {/* Add Link Modal */}
      <TaskAddLinkModal
        isOpen={showAddLinkModal}
        onClose={() => setShowAddLinkModal(false)}
        projectId={projectId}
        taskId={taskId}
        currentTask={task}
      />
    </div>
  );
};

export default TaskRelatedTasks;
