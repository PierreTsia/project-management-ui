import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations, type TranslationKey } from '@/hooks/useTranslations';
import type { TaskLinkType } from '@/types/task';
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Link,
  Copy,
  RotateCcw,
} from 'lucide-react';

interface TaskLinkBadgeProps {
  type: TaskLinkType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
}

const getLinkTypeConfig = (
  t: (key: TranslationKey, options?: Record<string, unknown>) => string
) =>
  ({
    BLOCKS: {
      label: t('tasks.links.types.BLOCKS'),
      icon: AlertTriangle,
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 border-red-200',
    },
    IS_BLOCKED_BY: {
      label: t('tasks.links.types.IS_BLOCKED_BY'),
      icon: AlertTriangle,
      variant: 'secondary' as const,
      className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    SPLITS_TO: {
      label: t('tasks.links.types.SPLITS_TO'),
      icon: ArrowRight,
      variant: 'outline' as const,
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    SPLITS_FROM: {
      label: t('tasks.links.types.SPLITS_FROM'),
      icon: ArrowLeft,
      variant: 'outline' as const,
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    RELATES_TO: {
      label: t('tasks.links.types.RELATES_TO'),
      icon: Link,
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800 border-gray-200',
    },
    DUPLICATES: {
      label: t('tasks.links.types.DUPLICATES'),
      icon: Copy,
      variant: 'outline' as const,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    IS_DUPLICATED_BY: {
      label: t('tasks.links.types.IS_DUPLICATED_BY'),
      icon: RotateCcw,
      variant: 'outline' as const,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
  }) as const;

const sizeConfig = {
  sm: {
    icon: 'h-3 w-3',
    text: 'text-xs',
    padding: 'px-2 py-1',
  },
  md: {
    icon: 'h-4 w-4',
    text: 'text-sm',
    padding: 'px-2.5 py-1',
  },
  lg: {
    icon: 'h-5 w-5',
    text: 'text-base',
    padding: 'px-3 py-1.5',
  },
} as const;

export const TaskLinkBadge = ({
  type,
  className,
  size = 'md',
  showIcon = true,
  showLabel = true,
}: TaskLinkBadgeProps) => {
  const { t } = useTranslations();
  const linkTypeConfig = getLinkTypeConfig(t);
  const config = linkTypeConfig[type];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        config.className,
        sizeStyles.padding,
        sizeStyles.text,
        className
      )}
    >
      {showIcon && <Icon className={cn('flex-shrink-0', sizeStyles.icon)} />}
      {showLabel && <span className="whitespace-nowrap">{config.label}</span>}
    </Badge>
  );
};

export default TaskLinkBadge;
