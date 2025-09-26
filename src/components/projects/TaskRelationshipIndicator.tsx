import { Button } from '@/components/ui/button';
import { TaskLinkBadge } from '@/components/tasks/TaskLinkBadge';
import { Unlink } from 'lucide-react';
import type { TaskLinkType } from '@/types/task';

interface TaskRelationshipIndicatorProps {
  type: TaskLinkType;
  taskTitle: string;
  onRemove: () => void;
}

export function TaskRelationshipIndicator({
  type,
  taskTitle,
  onRemove,
}: TaskRelationshipIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs group">
      <TaskLinkBadge type={type} size="sm" />
      <span className="text-muted-foreground">{taskTitle}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0"
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
      >
        <Unlink className="h-3 w-3" />
      </Button>
    </div>
  );
}
