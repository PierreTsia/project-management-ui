import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/hooks/useTranslations';
import { Edit3, MoreHorizontal, Trash2, UserPlus } from 'lucide-react';
import type { KanbanTask } from '@/components/projects/ProjectTasksKanbanView';

export type TaskKanbanActionsMenuProps = {
  onEdit?: ((taskId: string) => void) | undefined;
  onAssign?: ((taskId: string) => void) | undefined;
  onDelete?: ((taskId: string) => void) | undefined;
  item: KanbanTask;
  className?: string;
};

export const TaskKanbanActionsMenu = ({
  onEdit,
  onAssign,
  onDelete,
  item,
  className,
}: TaskKanbanActionsMenuProps) => {
  const { t } = useTranslations();

  return (
    <div
      className="shrink-0"
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={
              className ??
              'h-6 w-6 p-0 opacity-60 hover:opacity-100 hover:bg-muted/50 transition-all duration-200'
            }
            data-testid={`kanban-task-${item.id}-actions-button`}
            onClick={e => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={e => {
              e.stopPropagation();
              onEdit?.(item.raw.id);
            }}
            className="cursor-pointer"
            data-testid={`kanban-task-${item.id}-edit-option`}
          >
            <Edit3 className="h-3 w-3 mr-2" />
            {t('tasks.actions.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={e => {
              e.stopPropagation();
              onAssign?.(item.raw.id);
            }}
            className="cursor-pointer"
            data-testid={`kanban-task-${item.id}-assign-option`}
          >
            <UserPlus className="h-3 w-3 mr-2" />
            {t('tasks.actions.assign')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={e => {
              e.stopPropagation();
              onDelete?.(item.raw.id);
            }}
            className="cursor-pointer text-destructive focus:text-destructive"
            data-testid={`kanban-task-${item.id}-delete-option`}
          >
            <Trash2 className="h-3 w-3 mr-2 text-destructive" />
            {t('tasks.actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TaskKanbanActionsMenu;
