import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const SimplePagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: SimplePaginationProps) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show pagination with ellipsis for larger page counts
      if (currentPage <= 3) {
        // Show first few pages
        for (let i = 1; i <= 4; i++) {
          pages.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => onPageChange(i)}
                isActive={currentPage === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      } else if (currentPage >= totalPages - 2) {
        // Show last few pages
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => onPageChange(i)}
                isActive={currentPage === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
      } else {
        // Show pages around current page
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => onPageChange(i)}
                isActive={currentPage === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrevious}
            className={
              currentPage <= 1
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer'
            }
          />
        </PaginationItem>
        {renderPageNumbers()}
        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            className={
              currentPage >= totalPages
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
