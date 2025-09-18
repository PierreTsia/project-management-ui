import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { PaginationItems } from '@/components/PaginationItems';
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
      <Pagination>
        <PaginationContent>
          <PaginationPrevious
            className="cursor-pointer"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          />
          <PaginationItems
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
          <PaginationNext
            className="cursor-pointer"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          />
        </PaginationContent>
      </Pagination>
    </>
  );
}
