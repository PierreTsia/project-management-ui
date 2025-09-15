import { render, screen, fireEvent } from '@testing-library/react';
import { vi, it, describe, expect } from 'vitest';
import { ProjectTasks } from '@/components/projects/ProjectTasks';
import type { Task } from '@/types/task';
import { TestWrapper } from '@/test/TestWrapper';
import { createMockUser } from '@/test/mock-factories';

// Minimal mock to expose DnD handlers for direct invocation
vi.mock('@dnd-kit/core', async (orig: unknown) => {
  const actual = (await (orig as () => unknown)()) as Record<string, unknown>;
  return {
    ...actual,
    DndContext: ({
      children,
      onDragEnd,
      onDragStart,
      onDragOver,
      ...rest
    }: Record<string, unknown>) => {
      (globalThis as unknown as { __dnd: Record<string, unknown> }).__dnd = {
        onDragEnd,
        onDragStart,
        onDragOver,
        rest,
      };
      return children;
    },
  };
});

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: overrides.id ?? 't1',
  title: overrides.title ?? 'Task 1',
  description: overrides.description ?? 'Task 1 description',
  status: overrides.status ?? 'TODO',
  priority: overrides.priority ?? 'MEDIUM',
  dueDate: overrides.dueDate ?? '2025-01-01',
  projectId: overrides.projectId ?? 'p1',
  projectName: overrides.projectName ?? 'Project 1',
  assignee: overrides.assignee ?? createMockUser(),
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
});

const renderWithWrapper = (ui: React.ReactNode) =>
  render(<TestWrapper>{ui}</TestWrapper>);

describe('ProjectTasks Kanban view', () => {
  it('renders toggle buttons and switches between list and kanban', () => {
    const tasks = [makeTask({ id: 't1', title: 'First', status: 'TODO' })];
    const onTaskStatusChange = vi.fn();
    const onDeleteTask = vi.fn();
    const onAssignTask = vi.fn();
    const onEditTask = vi.fn();
    const onCreateTask = vi.fn();

    renderWithWrapper(
      <ProjectTasks
        tasks={tasks}
        onTaskStatusChange={onTaskStatusChange}
        onDeleteTask={onDeleteTask}
        onAssignTask={onAssignTask}
        onEditTask={onEditTask}
        onCreateTask={onCreateTask}
      />
    );

    const listBtn = screen.getByTestId('toggle-list-view');
    const kanbanBtn = screen.getByTestId('toggle-kanban-view');
    expect(listBtn).toBeInTheDocument();
    expect(kanbanBtn).toBeInTheDocument();
    expect(listBtn).toHaveAttribute('aria-pressed', 'true');
    expect(kanbanBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(kanbanBtn);
    expect(kanbanBtn).toHaveAttribute('aria-pressed', 'true');
    expect(listBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onTaskStatusChange when a card is dropped on a column', () => {
    const tasks = [makeTask({ id: 't1', title: 'First', status: 'TODO' })];
    const onTaskStatusChange = vi.fn();

    renderWithWrapper(
      <ProjectTasks
        tasks={tasks}
        onTaskStatusChange={onTaskStatusChange}
        onDeleteTask={vi.fn()}
        onAssignTask={vi.fn()}
        onEditTask={vi.fn()}
        onCreateTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('toggle-kanban-view'));

    const { onDragEnd } = (
      globalThis as unknown as { __dnd: { onDragEnd: (e: unknown) => void } }
    ).__dnd;
    onDragEnd({ active: { id: 't1' }, over: { id: 'IN_PROGRESS' } });
    expect(onTaskStatusChange).toHaveBeenCalledWith('t1', 'IN_PROGRESS');
  });

  it('does nothing when dropped without over target', () => {
    const tasks = [makeTask({ id: 't1', title: 'First', status: 'TODO' })];
    const onTaskStatusChange = vi.fn();

    renderWithWrapper(
      <ProjectTasks
        tasks={tasks}
        onTaskStatusChange={onTaskStatusChange}
        onDeleteTask={vi.fn()}
        onAssignTask={vi.fn()}
        onEditTask={vi.fn()}
        onCreateTask={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId('toggle-kanban-view'));
    const { onDragEnd } = (
      globalThis as unknown as { __dnd: { onDragEnd: (e: unknown) => void } }
    ).__dnd;
    onDragEnd({ active: { id: 't1' }, over: null });
    expect(onTaskStatusChange).not.toHaveBeenCalled();
  });

  it('uses target card column when dropping onto another card', () => {
    const t1 = makeTask({ id: 't1', title: 'First', status: 'TODO' });
    const t2 = makeTask({ id: 't2', title: 'Second', status: 'IN_PROGRESS' });
    const onTaskStatusChange = vi.fn();

    renderWithWrapper(
      <ProjectTasks
        tasks={[t1, t2]}
        onTaskStatusChange={onTaskStatusChange}
        onDeleteTask={vi.fn()}
        onAssignTask={vi.fn()}
        onEditTask={vi.fn()}
        onCreateTask={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId('toggle-kanban-view'));
    const { onDragEnd } = (
      globalThis as unknown as { __dnd: { onDragEnd: (e: unknown) => void } }
    ).__dnd;
    onDragEnd({ active: { id: 't1' }, over: { id: 't2' } });
    expect(onTaskStatusChange).toHaveBeenCalledWith('t1', 'IN_PROGRESS');
  });

  it('does not call status change when dropping within same column', () => {
    const t1 = makeTask({ id: 't1', title: 'First', status: 'TODO' });
    const t3 = makeTask({ id: 't3', title: 'Third', status: 'TODO' });
    const onTaskStatusChange = vi.fn();

    renderWithWrapper(
      <ProjectTasks
        tasks={[t1, t3]}
        onTaskStatusChange={onTaskStatusChange}
        onDeleteTask={vi.fn()}
        onAssignTask={vi.fn()}
        onEditTask={vi.fn()}
        onCreateTask={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId('toggle-kanban-view'));
    const { onDragEnd } = (
      globalThis as unknown as { __dnd: { onDragEnd: (e: unknown) => void } }
    ).__dnd;
    onDragEnd({ active: { id: 't1' }, over: { id: 't3' } });
    expect(onTaskStatusChange).not.toHaveBeenCalled();
  });

  it('renders assignee avatar initials and due date in card', () => {
    const tasks = [
      makeTask({
        id: 't1',
        title: 'First',
        status: 'TODO',
        dueDate: '2025-06-01',
      }),
    ];
    renderWithWrapper(
      <ProjectTasks
        tasks={tasks}
        onTaskStatusChange={vi.fn()}
        onDeleteTask={vi.fn()}
        onAssignTask={vi.fn()}
        onEditTask={vi.fn()}
        onCreateTask={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId('toggle-kanban-view'));
    // Avatar initials from createMockUser() are typically first 2 letters of name
    // We assert due date text exists
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(document.querySelector('.h-4.w-4')).toBeTruthy();
    expect(
      screen.getByText(new Date('2025-06-01').toLocaleDateString())
    ).toBeInTheDocument();
  });

  it('applies mobile-friendly classes on the grid and columns', () => {
    const tasks = [makeTask({ id: 't1', title: 'First', status: 'TODO' })];
    renderWithWrapper(
      <ProjectTasks
        tasks={tasks}
        onTaskStatusChange={vi.fn()}
        onDeleteTask={vi.fn()}
        onAssignTask={vi.fn()}
        onEditTask={vi.fn()}
        onCreateTask={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId('toggle-kanban-view'));
    const grid = document.querySelector('.snap-x.snap-mandatory');
    expect(grid).toBeTruthy();
    const column = document.querySelector('.snap-start');
    expect(column).toBeTruthy();
    const stickyHeader = document.querySelector('.sticky.top-0');
    expect(stickyHeader).toBeTruthy();
  });
});
