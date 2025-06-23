import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/useTranslations';

interface PageSizeSelectorProps {
  pageSize: number | 'all';
  totalItems: number;
  onPageSizeChange: (pageSize: number | 'all') => void;
}

const PAGE_SIZE_OPTIONS = [3, 6, 9, 12, 24, 'all'] as const;

export const PageSizeSelector = ({
  pageSize,
  totalItems,
  onPageSizeChange,
}: PageSizeSelectorProps) => {
  const { t } = useTranslations();

  const getOptionLabel = (option: number | 'all') => {
    if (option === 'all') {
      return `${t('projects.pageSize.all')} (${totalItems})`;
    }
    return `${option} ${t('projects.pageSize.perPage')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {t('projects.pageSize.show')}:
      </span>
      <Select
        value={pageSize.toString()}
        onValueChange={(value: string) => {
          const newPageSize = value === 'all' ? 'all' : parseInt(value, 10);
          onPageSizeChange(newPageSize);
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map(option => (
            <SelectItem key={option} value={option.toString()}>
              {getOptionLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
