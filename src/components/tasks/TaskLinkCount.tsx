import { Badge } from '@/components/ui/badge';
import { useTaskLinks } from '@/hooks/useTasks';
import { Link } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskLinkCountProps {
  projectId: string;
  taskId: string;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'secondary' | 'outline';
}

export const TaskLinkCount = ({
  projectId,
  taskId,
  className,
  showIcon = true,
  variant = 'secondary',
}: TaskLinkCountProps) => {
  const { data: linksData, isLoading } = useTaskLinks(projectId, taskId);

  if (isLoading) {
    return (
      <Badge variant={variant} className={cn('animate-pulse', className)}>
        {showIcon && <Link className="h-3 w-3 mr-1" />}
        ...
      </Badge>
    );
  }

  const linkCount = linksData?.total || 0;

  if (linkCount === 0) {
    return null;
  }

  return (
    <Badge
      variant={variant}
      className={cn('inline-flex items-center gap-1 text-xs', className)}
    >
      {showIcon && <Link className="h-3 w-3" />}
      {linkCount}
    </Badge>
  );
};

export default TaskLinkCount;
