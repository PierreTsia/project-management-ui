import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskLinkBadge } from './TaskLinkBadge';
import type { TaskLinkType } from '@/types/task';
import { TASK_LINK_TYPES } from '@/types/task';

interface LinkTypeSelectorProps {
  value?: TaskLinkType | undefined;
  onValueChange: (value: TaskLinkType) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const LinkTypeSelector = ({
  value,
  onValueChange,
  placeholder = 'Select link type',
  disabled = false,
  className,
}: LinkTypeSelectorProps) => {
  return (
    <Select
      value={value || ''}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {value && <TaskLinkBadge type={value} size="sm" />}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TASK_LINK_TYPES.map(type => (
          <SelectItem key={type} value={type}>
            <div className="flex items-center gap-2">
              <TaskLinkBadge type={type} size="sm" />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LinkTypeSelector;
