import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TaskPriorityChart } from '@/components/dashboard/TaskPriorityChart';
import { TestWrapper } from '@/test/TestWrapper';

const mockData = {
  high: 5,
  medium: 8,
  low: 3,
};

describe('TaskPriorityChart', () => {
  it('renders chart with all data', () => {
    render(
      <TestWrapper>
        <TaskPriorityChart data={mockData} />
      </TestWrapper>
    );

    expect(screen.getByText('Task Priority')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // High priority count
    expect(screen.getByText('8')).toBeInTheDocument(); // Medium priority count
    expect(screen.getByText('3')).toBeInTheDocument(); // Low priority count
  });

  it('renders with loading state', () => {
    render(
      <TestWrapper>
        <TaskPriorityChart data={mockData} loading />
      </TestWrapper>
    );

    // Should show skeleton loaders
    expect(screen.getAllByRole('generic')).toHaveLength(3); // 3 skeleton elements
  });

  it('renders with zero data', () => {
    const zeroData = { high: 0, medium: 0, low: 0 };

    render(
      <TestWrapper>
        <TaskPriorityChart data={zeroData} />
      </TestWrapper>
    );

    expect(screen.getByText('Task Priority')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(3); // All counts should be 0
  });

  it('applies custom className', () => {
    const { container } = render(
      <TestWrapper>
        <TaskPriorityChart data={mockData} className="custom-class" />
      </TestWrapper>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays priority labels correctly', () => {
    render(
      <TestWrapper>
        <TaskPriorityChart data={mockData} />
      </TestWrapper>
    );

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});
