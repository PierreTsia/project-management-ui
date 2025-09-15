import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

export type TaskActionsMenuProps = {
  onView?: () => void;
  onEdit?: () => void;
  onAssignToMe?: () => void;
  onDelete?: () => void;
  className?: string;
  onOpenChange: (open: boolean) => void;
};

export const TaskActionsMenu = ({
  onView,
  onEdit,
  onAssignToMe,
  onDelete,
  className,
  onOpenChange,
}: TaskActionsMenuProps) => {
  const { t } = useTranslations();
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
          {t('tasks.actions.viewDetails')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit || noop}>
          {t('tasks.actions.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAssignToMe || noop}>
          {t('tasks.actions.assignToMe')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete || noop}
          className="text-destructive"
        >
          {t('tasks.actions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskActionsMenu;
