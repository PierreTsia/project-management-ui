import { SimplePagination } from '@/components/SimplePagination';
import { useTranslations } from '@/hooks/useTranslations';

interface TeamPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function TeamPagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: TeamPaginationProps) {
  const { t } = useTranslations();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {t('projects.results.showing', {
            start: (currentPage - 1) * pageSize + 1,
            end: Math.min(currentPage * pageSize, total),
            total,
          })}
        </span>
      </div>
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
}
