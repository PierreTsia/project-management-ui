import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import React from 'react';

export type TaskActionsMenuProps = {
  onView?: () => void;
  onEdit?: () => void;
  onAssignToMe?: () => void;
  onDelete?: () => void;
  className?: string;
  onOpenChange: (open: boolean) => void;
};

export const TaskActionsMenu: React.FC<TaskActionsMenuProps> = ({
  onView,
  onEdit,
  onAssignToMe,
  onDelete,
  className,
  onOpenChange,
}) => {
  const noop = () => {};
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          onClick={e => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
        <DropdownMenuItem onClick={onView || noop}>
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit || noop}>Edit task</DropdownMenuItem>
        <DropdownMenuItem onClick={onAssignToMe || noop}>
          Assign to me
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete || noop}
          className="text-destructive"
        >
          Delete task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskActionsMenu;
