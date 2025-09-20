import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';
import { useTranslations } from '@/hooks/useTranslations';
import type { Task } from '@/types/task';
import { ExternalLink, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

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

  // Extract data from task prop
  const links = task.links || [];
  const hasLinks = links.length > 0;

  // Process links to group bidirectional relationships
  const processLinks = () => {
    const linkMap = new Map();

    links.forEach(link => {
      const relatedTask =
        link.sourceTaskId === taskId ? link.targetTask : link.sourceTask;

      if (!relatedTask) {
        console.warn('Related task is undefined for link:', link);
        return;
      }

      // Determine the relationship from the current task's perspective
      let relationshipType: string;
      if (link.sourceTaskId === taskId) {
        relationshipType = link.type;
      } else {
        // Flip the relationship type when we're the target
        switch (link.type) {
          case 'BLOCKS':
            relationshipType = 'IS_BLOCKED_BY';
            break;
          case 'IS_BLOCKED_BY':
            relationshipType = 'BLOCKS';
            break;
          case 'SPLITS_TO':
            relationshipType = 'SPLITS_FROM';
            break;
          case 'SPLITS_FROM':
            relationshipType = 'SPLITS_TO';
            break;
          case 'DUPLICATES':
            relationshipType = 'IS_DUPLICATED_BY';
            break;
          case 'IS_DUPLICATED_BY':
            relationshipType = 'DUPLICATES';
            break;
          case 'RELATES_TO':
            relationshipType = 'RELATES_TO'; // Symmetric relationship
            break;
          default:
            relationshipType = link.type;
        }
      }

      if (!linkMap.has(relatedTask.id)) {
        linkMap.set(relatedTask.id, {
          task: relatedTask,
          relationshipType: relationshipType,
          isBidirectional: false,
        });
      } else {
        // If we already have this task, it means we have both directions
        const existing = linkMap.get(relatedTask.id);
        existing.isBidirectional = true;

        // Prefer the more specific relationship type (BLOCKS over IS_BLOCKED_BY)
        if (
          relationshipType === 'BLOCKS' ||
          relationshipType === 'IS_BLOCKED_BY'
        ) {
          existing.relationshipType = relationshipType;
        }
      }
    });

    return Array.from(linkMap.values());
  };

  const processedLinks = processLinks();

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
          onClick={() => {
            /* TODO: Implement add relationship modal */
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('tasks.detail.addRelation')}
        </Button>
      </SectionHeader>
      {hasLinks ? (
        <div className="space-y-2">
          {processedLinks.map(linkItem => (
            <div
              key={linkItem.task.id}
              className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full flex-shrink-0"></div>
                <div className="flex gap-1 flex-wrap items-center">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      getRelationshipBadgeColor(linkItem.relationshipType)
                    )}
                  >
                    {getRelationshipLabel(linkItem.relationshipType)}
                  </Badge>
                  <span className="text-sm font-medium">
                    {linkItem.task.title}
                  </span>
                </div>
              </div>
              <Link to={`/projects/${projectId}/${linkItem.task.id}`}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('tasks.detail.noRelatedTasks')}
        </p>
      )}
    </div>
  );
};

export default TaskRelatedTasks;
