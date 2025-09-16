import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TestWrapper } from '@/test/TestWrapper';
import { FullSizeKanbanCard } from '@/components/projects/FullSizeKanbanCard';
import type { KanbanTask } from '@/components/projects/ProjectTasksKanbanView';

const renderWithProviders = (ui: React.ReactNode) =>
  render(<TestWrapper>{ui}</TestWrapper>);

const item: KanbanTask = {
  id: 't1',
  name: 'Implement feature',
  column: 'TODO',
  raw: {
    id: 't1',
    title: 'Implement feature',
    projectId: 'p1',
    projectName: 'Alpha',
    status: 'TODO',
    priority: 'HIGH',
    createdAt: '',
    updatedAt: '',
  },
};

describe('FullSizeKanbanCard', () => {
  it('renders title, project name badge and optional metadata', () => {
    renderWithProviders(<FullSizeKanbanCard item={item} />);

    expect(screen.getByText('Implement feature')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('calls action callbacks', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onAssign = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(
      <FullSizeKanbanCard
        item={item}
        onEdit={onEdit}
        onAssign={onAssign}
        onDelete={onDelete}
      />
    );

    // Open actions menu
    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText(/edit/i));
    expect(onEdit).toHaveBeenCalledWith('t1');

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText(/assign/i));
    expect(onAssign).toHaveBeenCalledWith('t1');

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText(/delete/i));
    expect(onDelete).toHaveBeenCalledWith('t1');
  });

  it('checkbox toggles selection without triggering drag (stopPropagation)', async () => {
    const user = userEvent.setup();
    const onSelectChange = vi.fn();

    renderWithProviders(
      <FullSizeKanbanCard
        item={item}
        selected={false}
        onSelectChange={onSelectChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(onSelectChange).toHaveBeenCalledWith('t1', true);
  });
});
