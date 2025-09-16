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
  onOpenChange?: (open: boolean) => void;
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
    <DropdownMenu onOpenChange={onOpenChange || noop}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => (onView || noop)()}>
          {t('tasks.actions.viewDetails')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => (onEdit || noop)()}>
          {t('tasks.actions.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => (onAssignToMe || noop)()}>
          {t('tasks.actions.assign')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => (onDelete || noop)()}
          className="text-destructive"
        >
          {t('tasks.actions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskActionsMenu;
