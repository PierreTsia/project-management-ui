import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { CalendarDays } from 'lucide-react';
import { TaskKanbanActionsMenu } from '@/components/projects/TaskKanbanActionsMenu';
import type { KanbanTask } from '@/components/projects/ProjectTasksKanbanView';

export type CompactKanbanCardProps = {
  item: KanbanTask;
  onEdit?: ((taskId: string) => void) | undefined;
  onAssign?: ((taskId: string) => void) | undefined;
  onDelete?: ((taskId: string) => void) | undefined;
};

export const CompactKanbanCard = ({
  item,
  onEdit,
  onAssign,
  onDelete,
}: CompactKanbanCardProps) => {
  return (
    <>
      <CardHeader className="p-3 pb-1">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium leading-tight truncate whitespace-nowrap overflow-hidden text-ellipsis">
              {item.name}
            </CardTitle>
          </div>
          <TaskKanbanActionsMenu
            item={item}
            onEdit={onEdit}
            onAssign={onAssign}
            onDelete={onDelete}
          />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {item.assignee && (
              <UserAvatar user={item.assignee} size="sm" className="shrink-0" />
            )}
          </div>
          {item.dueDate && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs shrink-0">
              <CalendarDays className="h-3 w-3" />
              <span>{new Date(item.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </>
  );
};

export default CompactKanbanCard;
