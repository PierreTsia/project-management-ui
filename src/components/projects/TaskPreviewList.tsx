import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { TaskRelationshipIndicator } from './TaskRelationshipIndicator';
import { useTranslations } from '@/hooks/useTranslations';
import type { TaskLinkType } from '@/types/task';

interface Task {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface Relationship {
  sourceTask: string;
  targetTask: string;
  type: TaskLinkType;
}

interface TaskPreviewListProps {
  tasks: Task[];
  relationships?: Relationship[] | undefined;
  selected: ReadonlyArray<boolean>;
  onSelectionChange: (selected: ReadonlyArray<boolean>) => void;
  onRelationshipRemove: (relationshipIndex: number) => void;
}

export function TaskPreviewList({
  tasks,
  relationships = [],
  selected,
  onSelectionChange,
  onRelationshipRemove,
}: TaskPreviewListProps) {
  const { t } = useTranslations();

  const getIncomingRelationships = (taskIndex: number) => {
    if (!relationships.length) return [];
    return relationships.filter(
      rel => rel.targetTask === `task_${taskIndex + 1}`
    );
  };

  const getOutgoingRelationships = (taskIndex: number) => {
    if (!relationships.length) return [];
    return relationships.filter(
      rel => rel.sourceTask === `task_${taskIndex + 1}`
    );
  };

  const getTaskTitle = (taskRef: string) => {
    const match = taskRef.match(/task_(\d+)/);
    if (match) {
      const idx = parseInt(match[1]) - 1;
      return tasks[idx]?.title || taskRef;
    }
    return taskRef;
  };

  const getGlobalRelationshipIndex = (rel: Relationship) => {
    return relationships.findIndex(
      r =>
        r.sourceTask === rel.sourceTask &&
        r.targetTask === rel.targetTask &&
        r.type === rel.type
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span>{t('ai.generate.results')}</span>
        {relationships.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {relationships.length === 1
              ? t('ai.generate.relationships_one', {
                  count: relationships.length,
                })
              : t('ai.generate.relationships_other', {
                  count: relationships.length,
                })}
          </Badge>
        )}
      </div>
      <div className="space-y-3 md:max-h-160 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {tasks.map((task, idx) => (
          <label
            key={idx}
            className="flex items-start gap-3 p-3 border rounded-md"
          >
            <input
              type="checkbox"
              checked={selected[idx] ?? true}
              onChange={e => {
                const next =
                  selected.length === tasks.length
                    ? [...selected]
                    : tasks.map(() => true);
                next[idx] = e.target.checked;
                onSelectionChange(next);
              }}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium">{task.title}</div>
                {task.priority && (
                  <PriorityBadge priority={task.priority} size="sm" readOnly />
                )}
              </div>
              {task.description && (
                <div className="text-sm text-muted-foreground">
                  {task.description}
                </div>
              )}

              {/* Relationship indicators for linked tasks */}
              {relationships.length > 0 && (
                <div className="mt-2 space-y-1">
                  {/* Incoming relationships */}
                  {getIncomingRelationships(idx).map((rel, relIdx) => (
                    <TaskRelationshipIndicator
                      key={`incoming-${relIdx}`}
                      type={rel.type}
                      taskTitle={getTaskTitle(rel.sourceTask)}
                      onRemove={() =>
                        onRelationshipRemove(getGlobalRelationshipIndex(rel))
                      }
                    />
                  ))}

                  {/* Outgoing relationships */}
                  {getOutgoingRelationships(idx).map((rel, relIdx) => (
                    <TaskRelationshipIndicator
                      key={`outgoing-${relIdx}`}
                      type={rel.type}
                      taskTitle={getTaskTitle(rel.targetTask)}
                      onRemove={() =>
                        onRelationshipRemove(getGlobalRelationshipIndex(rel))
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
