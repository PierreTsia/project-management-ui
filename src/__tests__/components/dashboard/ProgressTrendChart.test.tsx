import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressTrendChart } from '@/components/dashboard/ProgressTrendChart';
import { TestWrapper } from '@/test/TestWrapper';

const mockData = [
  { date: '2024-01-01', completionRate: 0, completedTasks: 0 },
  { date: '2024-01-02', completionRate: 25, completedTasks: 5 },
  { date: '2024-01-03', completionRate: 50, completedTasks: 10 },
  { date: '2024-01-04', completionRate: 75, completedTasks: 15 },
  { date: '2024-01-05', completionRate: 100, completedTasks: 20 },
];

describe('ProgressTrendChart', () => {
  it('renders chart with data', () => {
    render(
      <TestWrapper>
        <ProgressTrendChart data={mockData} />
      </TestWrapper>
    );

    expect(screen.getByText('Progress Trend')).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    render(
      <TestWrapper>
        <ProgressTrendChart data={mockData} loading />
      </TestWrapper>
    );

    // Should show skeleton loaders
    expect(screen.getAllByRole('generic')).toHaveLength(6); // 6 skeleton elements
    // Should not show actual content
    expect(screen.queryByText('Progress Trend')).not.toBeInTheDocument();
  });

  it('renders with empty data array', () => {
    render(
      <TestWrapper>
        <ProgressTrendChart data={[]} />
      </TestWrapper>
    );

    expect(screen.getByText('Progress Trend')).toBeInTheDocument();
  });

  it('renders with single data point', () => {
    const singleData = [
      { date: '2024-01-01', completionRate: 50, completedTasks: 10 },
    ];

    render(
      <TestWrapper>
        <ProgressTrendChart data={singleData} />
      </TestWrapper>
    );

    expect(screen.getByText('Progress Trend')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TestWrapper>
        <ProgressTrendChart data={mockData} className="custom-class" />
      </TestWrapper>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles malformed data gracefully', () => {
    const malformedData = [
      {
        date: '2024-01-01',
        completionRate: 'invalid' as unknown as number,
        completedTasks: 10,
      },
      {
        date: '2024-01-02',
        completionRate: 50,
        completedTasks: 'invalid' as unknown as number,
      },
    ];

    render(
      <TestWrapper>
        <ProgressTrendChart data={malformedData} />
      </TestWrapper>
    );

    // Should render without crashing
    expect(screen.getByText('Progress Trend')).toBeInTheDocument();
  });

  it('renders with large dataset', () => {
    const largeData = Array.from({ length: 30 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      completionRate: i * 3,
      completedTasks: i * 2,
    }));

    render(
      <TestWrapper>
        <ProgressTrendChart data={largeData} />
      </TestWrapper>
    );

    expect(screen.getByText('Progress Trend')).toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    const undefinedData = [
      {
        date: undefined as unknown as string,
        completionRate: 50,
        completedTasks: 10,
      },
      {
        date: '2024-01-02',
        completionRate: undefined as unknown as number,
        completedTasks: 20,
      },
    ];

    render(
      <TestWrapper>
        <ProgressTrendChart data={undefinedData} />
      </TestWrapper>
    );

    // Should render without crashing
    expect(screen.getByText('Progress Trend')).toBeInTheDocument();
  });
});
