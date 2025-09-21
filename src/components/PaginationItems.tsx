import {
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationItemsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationItems = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationItemsProps) => {
  const maxVisiblePages = 5;

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
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      return Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <PaginationItem key={page}>
          <PaginationLink
            onClick={() => onPageChange(page)}
            isActive={currentPage === page}
            className="cursor-pointer"
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      ));
    }

    // Show pagination with ellipsis for larger page counts
    if (currentPage <= 3) {
      // Show first few pages
      return (
        <>
          {Array.from({ length: 4 }, (_, i) => i + 1).map(page => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        </>
      );
    }

    if (currentPage >= totalPages - 2) {
      // Show last few pages
      return (
        <>
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
          {Array.from({ length: 4 }, (_, i) => totalPages - 3 + i).map(page => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
        </>
      );
    }

    // Show pages around current page
    return (
      <>
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
        {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i).map(page => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => onPageChange(page)}
              isActive={currentPage === page}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      </>
    );
  };

  return (
    <>
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
    </>
  );
};
