import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations, type TranslationKey } from '@/hooks/useTranslations';
import type { TaskLinkType } from '@/types/task';

interface TaskLinkBadgeProps {
  type: TaskLinkType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const getLinkTypeConfig = (
  t: (key: TranslationKey, options?: Record<string, unknown>) => string
) =>
  ({
    BLOCKS: {
      label: t('tasks.links.types.BLOCKS'),
      variant: 'secondary' as const,
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    },
    IS_BLOCKED_BY: {
      label: t('tasks.links.types.IS_BLOCKED_BY'),
      variant: 'secondary' as const,
      className:
        'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    },
    SPLITS_TO: {
      label: t('tasks.links.types.SPLITS_TO'),
      variant: 'secondary' as const,
      className:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    },
    SPLITS_FROM: {
      label: t('tasks.links.types.SPLITS_FROM'),
      variant: 'secondary' as const,
      className:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    },
    RELATES_TO: {
      label: t('tasks.links.types.RELATES_TO'),
      variant: 'secondary' as const,
      className:
        'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    },
    DUPLICATES: {
      label: t('tasks.links.types.DUPLICATES'),
      variant: 'secondary' as const,
      className:
        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    },
    IS_DUPLICATED_BY: {
      label: t('tasks.links.types.IS_DUPLICATED_BY'),
      variant: 'secondary' as const,
      className:
        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    },
  }) as const;

const sizeConfig = {
  sm: {
    text: 'text-xs',
    padding: 'px-2 py-1',
  },
  md: {
    text: 'text-sm',
    padding: 'px-2.5 py-1',
  },
  lg: {
    text: 'text-base',
    padding: 'px-3 py-1.5',
  },
} as const;

export const TaskLinkBadge = ({
  type,
  className,
  size = 'md',
}: TaskLinkBadgeProps) => {
  const { t } = useTranslations();
  const linkTypeConfig = getLinkTypeConfig(t);
  const config = linkTypeConfig[type];
  const sizeStyles = sizeConfig[size];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'inline-flex items-center font-medium',
        config.className,
        sizeStyles.padding,
        sizeStyles.text,
        className
      )}
    >
      <span className="whitespace-nowrap">{config.label}</span>
    </Badge>
  );
};

export default TaskLinkBadge;
