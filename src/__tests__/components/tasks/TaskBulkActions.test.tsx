import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskBulkActions } from '@/components/tasks/TaskBulkActions';
import { TestWrapper } from '@/test/TestWrapper';

vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({ data: { id: 'user-1' } }),
}));

const mockBulkUpdate = vi.fn();
const mockBulkAssign = vi.fn();
const mockBulkDelete = vi.fn();

vi.mock('@/hooks/useTasks', () => ({
  useBulkUpdateStatus: () => ({
    mutateAsync: mockBulkUpdate,
    isPending: false,
  }),
  useBulkAssignTasks: () => ({ mutateAsync: mockBulkAssign, isPending: false }),
  useBulkDeleteTasks: () => ({ mutateAsync: mockBulkDelete, isPending: false }),
}));

const renderWithProviders = (ui: React.ReactNode) =>
  render(<TestWrapper>{ui}</TestWrapper>);

const setup = (selected = ['t1', 't2'], onClearSelection = vi.fn()) => {
  return renderWithProviders(
    <TaskBulkActions
      selectedTasks={selected}
      onClearSelection={onClearSelection}
    />
  );
};

describe('TaskBulkActions', () => {
  beforeEach(() => {
    mockBulkUpdate.mockReset();
    mockBulkAssign.mockReset();
    mockBulkDelete.mockReset();
  });

  it('updates status via dropdown and clears selection', async () => {
    const user = userEvent.setup();
    mockBulkUpdate.mockResolvedValueOnce(undefined);
    const onClear = vi.fn();
    setup(['a', 'b'], onClear);

    await user.click(screen.getByRole('button', { name: /update status/i }));
    await user.click(await screen.findByText(/in progress/i));

    await waitFor(() => expect(mockBulkUpdate).toHaveBeenCalled());
    expect(mockBulkUpdate).toHaveBeenCalledWith({
      taskIds: ['a', 'b'],
      status: 'IN_PROGRESS',
      reason: expect.stringMatching(/bulk status update/i),
    });
    expect(onClear).toHaveBeenCalled();
  });

  it('assigns to current user and clears selection', async () => {
    const user = userEvent.setup();
    mockBulkAssign.mockResolvedValueOnce(undefined);
    const onClear = vi.fn();
    setup(['x'], onClear);

    await user.click(screen.getByRole('button', { name: /assign to me/i }));

    await waitFor(() => expect(mockBulkAssign).toHaveBeenCalled());
    expect(mockBulkAssign).toHaveBeenCalledWith({
      taskIds: ['x'],
      assigneeId: 'user-1',
      reason: expect.any(String),
    });
    expect(onClear).toHaveBeenCalled();
  });

  it('opens delete dialog and confirms deletion', async () => {
    const user = userEvent.setup();
    mockBulkDelete.mockResolvedValueOnce(undefined);
    const onClear = vi.fn();
    setup(['z1', 'z2'], onClear);

    await user.click(screen.getByRole('button', { name: /more actions/i }));
    await user.click(await screen.findByText(/delete tasks/i));

    expect(
      await screen.findByText(/are you sure you want to delete/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete tasks/i }));

    await waitFor(() => expect(mockBulkDelete).toHaveBeenCalled());
    expect(mockBulkDelete).toHaveBeenCalledWith({
      taskIds: ['z1', 'z2'],
      reason: expect.stringMatching(/bulk deletion/i),
    });
    expect(onClear).toHaveBeenCalled();
  });

  it('does not clear selection when status update fails', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    mockBulkUpdate.mockRejectedValueOnce(new Error('nope'));
    setup(['a'], onClear);

    await user.click(screen.getByRole('button', { name: /update status/i }));
    await user.click(await screen.findByText(/done/i));

    await waitFor(() => expect(mockBulkUpdate).toHaveBeenCalled());
    expect(onClear).not.toHaveBeenCalled();
  });
});
