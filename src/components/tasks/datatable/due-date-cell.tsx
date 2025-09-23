import { Calendar, AlertTriangle } from 'lucide-react';
import { formatDueDate, isOverdue } from './cell-utils';
import { useTranslations } from '@/hooks/useTranslations';

export const DueDateCell = ({ value }: { value?: string }) => {
  const { currentLanguage } = useTranslations();
  if (!value) {
    return <span className="text-sm whitespace-nowrap">-</span>;
  }
  const overdue = isOverdue(value);
  const Icon = overdue ? AlertTriangle : Calendar;
  return (
    <div className="flex items-center space-x-1">
      <Icon
        className={
          overdue ? 'h-4 w-4 text-red-500' : 'h-4 w-4 text-muted-foreground'
        }
      />
      <span
        className={`text-sm whitespace-nowrap ${overdue ? 'text-red-500 font-bold' : ''}`}
      >
        {formatDueDate(value, currentLanguage)}
      </span>
    </div>
  );
};

export default DueDateCell;
