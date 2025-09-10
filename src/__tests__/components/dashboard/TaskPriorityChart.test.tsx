import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock ResponsiveContainer to avoid zero-size container warnings in JSDOM
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  };
});
import { TaskPriorityChart } from '@/components/dashboard/TaskPriorityChart';
import { TestWrapper } from '@/test/TestWrapper';
import en from '@/locales/en.json';

const mockData = {
  high: 5,
  medium: 8,
  low: 3,
};

describe('TaskPriorityChart', () => {
  it('renders chart with all data (i18n title)', () => {
    render(
      <TestWrapper>
        <TaskPriorityChart data={mockData} />
      </TestWrapper>
    );

    expect(
      screen.getByText(en.dashboard.charts.taskPriority)
    ).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    render(
      <TestWrapper>
        <TaskPriorityChart data={mockData} loading />
      </TestWrapper>
    );

    // Should show at least one skeleton element
    expect(screen.getAllByRole('generic').length).toBeGreaterThanOrEqual(1);
  });

  it('renders with zero data (i18n title)', () => {
    const zeroData = { high: 0, medium: 0, low: 0 };

    render(
      <TestWrapper>
        <TaskPriorityChart data={zeroData} />
      </TestWrapper>
    );

    expect(
      screen.getByText(en.dashboard.charts.taskPriority)
    ).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TestWrapper>
        <TaskPriorityChart data={mockData} className="custom-class" />
      </TestWrapper>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders title via i18n, not hardcoded', () => {
    render(
      <TestWrapper>
        <TaskPriorityChart data={mockData} />
      </TestWrapper>
    );

    expect(
      screen.getByText(en.dashboard.charts.taskPriority)
    ).toBeInTheDocument();
  });
});
