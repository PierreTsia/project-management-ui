import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/hooks/useTranslations';
import { getPriorityVariant } from '@/lib/task-helpers';
import type { Task } from '@/types/task';

type Props = {
  priority: Task['priority'];
  onPriorityChange?: (priority: Task['priority']) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
};

const getSizeClasses = (size: Props['size']) => {
  switch (size) {
    case 'sm':
      return 'h-5 px-2 text-xs';
    case 'lg':
      return 'h-7 px-4 text-sm';
    case 'md':
    default:
      return 'h-6 px-3 text-sm';
  }
};

export const PriorityBadge = ({
  priority,
  onPriorityChange,
  className = '',
  size = 'md',
  readOnly = false,
}: Props) => {
  const { t } = useTranslations();

  const getPriorityLabel = (priority: Task['priority']): string => {
    return t(`tasks.priority.${priority}`);
  };

  const badgeContent = (
    <Badge
      variant={getPriorityVariant(priority)}
      className={`font-medium ${getSizeClasses(size)} ${className} ${
        !readOnly ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
    >
      {getPriorityLabel(priority)}
    </Badge>
  );

  if (readOnly || !onPriorityChange) {
    return badgeContent;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{badgeContent}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-32">
        <DropdownMenuItem
          onClick={() => onPriorityChange('LOW')}
          className="cursor-pointer"
          data-testid="priority-option-low"
        >
          {getPriorityLabel('LOW')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onPriorityChange('MEDIUM')}
          className="cursor-pointer"
          data-testid="priority-option-medium"
        >
          {getPriorityLabel('MEDIUM')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onPriorityChange('HIGH')}
          className="cursor-pointer"
          data-testid="priority-option-high"
        >
          {getPriorityLabel('HIGH')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
