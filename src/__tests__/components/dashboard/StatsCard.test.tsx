import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TestWrapper } from '@/test/TestWrapper';
import { FolderOpen } from 'lucide-react';

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Total Projects',
    value: 12,
    description: 'Total number of projects',
    icon: <FolderOpen className="h-4 w-4" />,
  };

  it('renders with all props', () => {
    render(
      <TestWrapper>
        <StatsCard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Total number of projects')).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    render(
      <TestWrapper>
        <StatsCard {...defaultProps} loading />
      </TestWrapper>
    );

    // Should show skeleton loaders
    expect(screen.getAllByRole('generic')).toHaveLength(8); // 8 skeleton elements
    // Should not show actual content
    expect(screen.queryByText('12')).not.toBeInTheDocument();
  });

  it('renders with zero value', () => {
    render(
      <TestWrapper>
        <StatsCard {...defaultProps} value={0} />
      </TestWrapper>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders with large value', () => {
    render(
      <TestWrapper>
        <StatsCard {...defaultProps} value={9999} />
      </TestWrapper>
    );

    expect(screen.getByText('9999')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TestWrapper>
        <StatsCard {...defaultProps} className="custom-class" />
      </TestWrapper>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders without description', () => {
    const { description: _description, ...propsWithoutDescription } =
      defaultProps;

    render(
      <TestWrapper>
        <StatsCard {...propsWithoutDescription} />
      </TestWrapper>
    );

    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(
      screen.queryByText('Total number of projects')
    ).not.toBeInTheDocument();
  });

  it('renders icon correctly', () => {
    const { container } = render(
      <TestWrapper>
        <StatsCard {...defaultProps} />
      </TestWrapper>
    );

    // Check that the icon is rendered (FolderOpen has specific classes)
    const iconElement = container.querySelector('.h-4.w-4');
    expect(iconElement).toBeInTheDocument();
  });

  it('handles undefined value gracefully', () => {
    render(
      <TestWrapper>
        <StatsCard {...defaultProps} value={''} />
      </TestWrapper>
    );

    // When value is undefined, it should render as empty
    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    // The value div should be empty
    const valueDiv = screen
      .getByText('Total Projects')
      .closest('.bg-card')
      ?.querySelector('.text-xl');
    expect(valueDiv).toBeEmptyDOMElement();
  });

  it('renders as clickable link when href is provided', () => {
    render(
      <TestWrapper>
        <StatsCard {...defaultProps} href="/projects" />
      </TestWrapper>
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/projects');
    expect(link).toHaveClass('block');
  });

  it('renders as clickable button when onClick is provided', () => {
    const mockOnClick = vi.fn();
    render(
      <TestWrapper>
        <StatsCard {...defaultProps} onClick={mockOnClick} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('tabIndex', '0');

    // Test click functionality
    button.click();
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation for onClick', () => {
    const mockOnClick = vi.fn();
    render(
      <TestWrapper>
        <StatsCard {...defaultProps} onClick={mockOnClick} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');

    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('applies hover styles when clickable', () => {
    const { container } = render(
      <TestWrapper>
        <StatsCard {...defaultProps} href="/projects" />
      </TestWrapper>
    );

    const card = container.querySelector('.cursor-pointer');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('hover:shadow-md', 'transition-shadow');
  });

  it('does not apply clickable styles when neither href nor onClick provided', () => {
    const { container } = render(
      <TestWrapper>
        <StatsCard {...defaultProps} />
      </TestWrapper>
    );

    const card = container.querySelector('.cursor-pointer');
    expect(card).not.toBeInTheDocument();
  });
});
