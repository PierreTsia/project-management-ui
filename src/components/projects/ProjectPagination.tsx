import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { PaginationItems } from '@/components/PaginationItems';

interface ProjectPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ProjectPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: ProjectPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={`cursor-pointer ${
                currentPage === 1 ? 'pointer-events-none opacity-50' : ''
              }`}
            />
          </PaginationItem>

          <PaginationItems
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              className={`cursor-pointer ${
                currentPage === totalPages
                  ? 'pointer-events-none opacity-50'
                  : ''
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
