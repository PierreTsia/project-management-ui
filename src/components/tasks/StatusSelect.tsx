import { useTranslations } from '@/hooks/useTranslations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAvailableStatuses, getStatusLabel } from '@/lib/task-status';
import type { TaskStatus } from '@/types/task';

type StatusSelectProps = {
  value: TaskStatus;
  onValueChange: (value: TaskStatus) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export const StatusSelect = ({
  value,
  onValueChange,
  size = 'md',
  className = '',
}: StatusSelectProps) => {
  const { t } = useTranslations();

  const getStatusStyles = (status: TaskStatus) => {
    if (status === 'TODO')
      return 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30';
    if (status === 'IN_PROGRESS')
      return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30';
    return 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-sm';
      case 'lg':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-8 h-8 text-base';
    }
  };

  const getShadowClasses = () => {
    switch (size) {
      case 'sm':
        return 'shadow-sm hover:shadow-md';
      case 'lg':
        return 'shadow-md hover:shadow-lg';
      default:
        return 'shadow-sm hover:shadow-md';
    }
  };

  const getStatusSymbol = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return '○';
      case 'IN_PROGRESS':
        return '◐';
      case 'DONE':
        return '●';
      default:
        return '○';
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`w-auto border-0 bg-transparent p-0 h-auto ${className}`}
      >
        <SelectValue>
          <div
            className={`
              ${getSizeClasses()} rounded-full flex items-center justify-center font-medium transition-all duration-200 hover:scale-110 cursor-pointer
              ${getStatusStyles(value)}
              ${getShadowClasses()}
            `}
          >
            {getStatusSymbol(value)}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map(status => {
          const isAvailable = getAvailableStatuses(value).includes(status);
          return (
            <SelectItem
              key={status}
              value={status}
              disabled={!isAvailable}
              className={!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`
                  w-4 h-4 rounded-full flex items-center justify-center text-sm
                  ${getStatusStyles(status)}
                  ${!isAvailable ? 'opacity-50' : ''}
                `}
                >
                  {getStatusSymbol(status)}
                </div>
                <span className={!isAvailable ? 'text-muted-foreground' : ''}>
                  {getStatusLabel(status, t)}
                </span>
                {!isAvailable && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    (not allowed)
                  </span>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
