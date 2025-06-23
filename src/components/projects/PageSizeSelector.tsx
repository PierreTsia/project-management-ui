import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/hooks/useTranslations';

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [3, 6, 9, 12, 24, 50, 100] as const;

export const PageSizeSelector = ({
  pageSize,
  onPageSizeChange,
}: PageSizeSelectorProps) => {
  const { t } = useTranslations();

  const getOptionLabel = (option: number) => {
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
          const newPageSize = parseInt(value, 10);
          onPageSizeChange(newPageSize);
        }}
      >
        <SelectTrigger className="max-w-36">
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
