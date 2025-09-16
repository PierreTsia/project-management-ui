import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UserAvatar } from '@/components/ui/user-avatar';
import { CalendarDays } from 'lucide-react';
import { TaskKanbanActionsMenu } from '@/components/projects/TaskKanbanActionsMenu';
import { stringToColorHex } from '@/lib/color';
import type { KanbanTask } from '@/components/projects/ProjectTasksKanbanView';

export type FullSizeKanbanCardProps = {
  item: KanbanTask;
  onEdit?: ((taskId: string) => void) | undefined;
  onAssign?: ((taskId: string) => void) | undefined;
  onDelete?: ((taskId: string) => void) | undefined;
  selected?: boolean | undefined;
  onSelectChange?: ((taskId: string, selected: boolean) => void) | undefined;
};

export const FullSizeKanbanCard = ({
  item,
  onEdit,
  onAssign,
  onDelete,
  selected,
  onSelectChange,
}: FullSizeKanbanCardProps) => {
  const borderColor = stringToColorHex(item.raw.projectName || 'default');

  return (
    <Card className="p-0 relative border-none">
      <div
        aria-hidden
        className="absolute left-1 top-1 bottom-1 w-1 rounded-full"
        style={{ backgroundColor: borderColor }}
      />
      <CardHeader className="p-3 pb-1 pl-5">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              onMouseDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
            >
              <Checkbox
                checked={!!selected}
                onCheckedChange={(checked: boolean) =>
                  onSelectChange?.(item.id, !!checked)
                }
              />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold leading-snug truncate whitespace-nowrap overflow-hidden text-ellipsis">
                {item.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: borderColor }}
                />
                <span className="truncate">{item.raw.projectName}</span>
              </div>
            </div>
          </div>
          <TaskKanbanActionsMenu
            item={item}
            onEdit={onEdit}
            onAssign={onAssign}
            onDelete={onDelete}
          />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 pl-5">
        {item.raw.description && (
          <CardDescription className="text-sm line-clamp-3 mb-3">
            {item.raw.description}
          </CardDescription>
        )}
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
    </Card>
  );
};

export default FullSizeKanbanCard;
