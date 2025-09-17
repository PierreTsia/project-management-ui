import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import type { GlobalSearchTasksParams } from '@/types/task';
import { TestWrapper } from '@/test/TestWrapper';

const renderWithProviders = (ui: React.ReactNode) => {
  return render(<TestWrapper>{ui}</TestWrapper>);
};

describe('TaskFilters', () => {
  const baseFilters: GlobalSearchTasksParams = {
    page: 1,
    limit: 20,
  };

  it('renders title and actions', () => {
    const onFiltersChange = vi.fn();
    renderWithProviders(
      <TaskFilters filters={baseFilters} onFiltersChange={onFiltersChange} />
    );

    expect(screen.getByText(/^filters$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
  });

  it('applies search query via Apply button', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    renderWithProviders(
      <TaskFilters filters={baseFilters} onFiltersChange={onFiltersChange} />
    );

    const search = screen.getByLabelText(/search/i);
    await user.type(search, 'bug');

    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'bug' })
    );
  });

  it('clears filters and calls onFiltersChange with empty object', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    renderWithProviders(
      <TaskFilters filters={baseFilters} onFiltersChange={onFiltersChange} />
    );

    // Set a query to make clear button appear
    const search = screen.getByLabelText(/search/i);
    await user.type(search, 'foo');
    await user.click(screen.getByRole('button', { name: /apply/i }));

    // Clear
    await user.click(screen.getByRole('button', { name: /clear/i }));

    expect(onFiltersChange).toHaveBeenCalledWith({});
  });

  it('toggles quick filters (overdue and has due date) and applies', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    renderWithProviders(
      <TaskFilters filters={baseFilters} onFiltersChange={onFiltersChange} />
    );

    const overdue = screen.getByLabelText(/overdue only/i);
    const hasDueDate = screen.getByLabelText(/has due date/i);

    await user.click(overdue);
    await user.click(hasDueDate);

    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ isOverdue: true, hasDueDate: true })
    );
  });

  it('renders date picker components and can open them', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    renderWithProviders(
      <TaskFilters filters={baseFilters} onFiltersChange={onFiltersChange} />
    );

    // Verify DatePicker components are rendered
    const fromButton = screen.getByLabelText(/due date from/i);
    const toButton = screen.getByLabelText(/due date to/i);

    expect(fromButton).toBeInTheDocument();
    expect(toButton).toBeInTheDocument();

    // Test that clicking opens the popover
    await user.click(fromButton);

    // Look for calendar elements that should appear
    expect(screen.getByRole('grid')).toBeInTheDocument();

    // Close the popover by clicking outside or pressing escape
    await user.keyboard('{Escape}');
  });
});
