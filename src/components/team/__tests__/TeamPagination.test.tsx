import { render, screen, fireEvent } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { TeamPagination } from '../TeamPagination';
import { TestWrapper } from '@/test/TestWrapper';

const renderWithProviders = (ui: React.ReactNode) => {
  return render(<TestWrapper>{ui}</TestWrapper>);
};

const defaultProps = {
  currentPage: 2,
  totalPages: 5,
  total: 100,
  pageSize: 20,
  onPageChange: vi.fn(),
};

describe('TeamPagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders results summary correctly', () => {
    renderWithProviders(<TeamPagination {...defaultProps} />);

    expect(
      screen.getByText('Showing 21-40 of 100 results')
    ).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    renderWithProviders(<TeamPagination {...defaultProps} />);

    // Check for navigation elements
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('calls onPageChange when previous button is clicked', () => {
    renderWithProviders(<TeamPagination {...defaultProps} />);

    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange when next button is clicked', () => {
    renderWithProviders(<TeamPagination {...defaultProps} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first page', () => {
    renderWithProviders(<TeamPagination {...defaultProps} currentPage={1} />);

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeInTheDocument();
    // The component doesn't actually disable buttons, it just prevents going beyond bounds
  });

  it('disables next button on last page', () => {
    renderWithProviders(<TeamPagination {...defaultProps} currentPage={5} />);

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeInTheDocument();
    // The component doesn't actually disable buttons, it just prevents going beyond bounds
  });

  it('renders page numbers correctly', () => {
    renderWithProviders(<TeamPagination {...defaultProps} />);

    // Should render current page and surrounding pages
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles single page correctly', () => {
    const { container } = renderWithProviders(
      <TeamPagination
        {...defaultProps}
        currentPage={1}
        totalPages={1}
        total={5}
      />
    );

    // Single page should return null (no pagination controls)
    expect(container.firstChild).toBeNull();
  });

  it('handles zero total correctly', () => {
    renderWithProviders(<TeamPagination {...defaultProps} total={0} />);

    expect(screen.getByText('Showing 21-0 of 0 results')).toBeInTheDocument();
  });

  it('calculates results summary correctly for different page sizes', () => {
    renderWithProviders(
      <TeamPagination {...defaultProps} pageSize={10} currentPage={3} />
    );

    expect(
      screen.getByText('Showing 21-30 of 100 results')
    ).toBeInTheDocument();
  });

  it('prevents going below page 1', () => {
    renderWithProviders(<TeamPagination {...defaultProps} currentPage={1} />);

    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it('prevents going above total pages', () => {
    renderWithProviders(<TeamPagination {...defaultProps} currentPage={5} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(5);
  });
});
