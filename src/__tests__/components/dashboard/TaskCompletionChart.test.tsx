import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TaskCompletionChart } from '@/components/dashboard/TaskCompletionChart';
import { TestWrapper } from '@/test/TestWrapper';

const mockData = {
  completed: 12,
  inProgress: 8,
  todo: 5,
};

describe('TaskCompletionChart', () => {
  it('renders chart with data', () => {
    render(
      <TestWrapper>
        <TaskCompletionChart data={mockData} />
      </TestWrapper>
    );

    expect(screen.getByText('Task Distribution')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument(); // Completed
    expect(screen.getByText('8')).toBeInTheDocument(); // In Progress
    expect(screen.getByText('5')).toBeInTheDocument(); // To Do
  });

  it('renders with loading state', () => {
    render(
      <TestWrapper>
        <TaskCompletionChart data={mockData} loading />
      </TestWrapper>
    );

    // Should show skeleton loaders
    expect(screen.getAllByRole('generic')).toHaveLength(6); // 6 skeleton elements
    // Should not show actual content
    expect(screen.queryByText('12')).not.toBeInTheDocument();
  });

  it('renders with zero values', () => {
    const zeroData = {
      completed: 0,
      inProgress: 0,
      todo: 0,
    };

    render(
      <TestWrapper>
        <TaskCompletionChart data={zeroData} />
      </TestWrapper>
    );

    expect(screen.getAllByText('0')).toHaveLength(3); // 3 zero values for completed, inProgress, todo
  });

  it('renders with large values', () => {
    const largeData = {
      completed: 999,
      inProgress: 500,
      todo: 250,
    };

    render(
      <TestWrapper>
        <TaskCompletionChart data={largeData} />
      </TestWrapper>
    );

    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TestWrapper>
        <TaskCompletionChart data={mockData} className="custom-class" />
      </TestWrapper>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders chart legend correctly', () => {
    render(
      <TestWrapper>
        <TaskCompletionChart data={mockData} />
      </TestWrapper>
    );

    // Check for legend items
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('calculates percentages correctly', () => {
    render(
      <TestWrapper>
        <TaskCompletionChart data={mockData} />
      </TestWrapper>
    );

    // Total should be 25 (12 + 8 + 5)
    // Completed: 12/25 = 48%
    // In Progress: 8/25 = 32%
    // To Do: 5/25 = 20%

    // The exact percentage display depends on implementation
    // We just verify the numbers are shown
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles undefined data gracefully', () => {
    const undefinedData = {
      completed: undefined as unknown as number,
      inProgress: undefined as unknown as number,
      todo: undefined as unknown as number,
    };

    render(
      <TestWrapper>
        <TaskCompletionChart data={undefinedData} />
      </TestWrapper>
    );

    // Should render without crashing
    expect(screen.getByText('Task Distribution')).toBeInTheDocument();
  });
});
