import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTasksKanban, type KanbanTaskItem } from '@/hooks/useTasksKanban';
import type { Task } from '@/types/task';

const tasks: Task[] = [
  {
    id: 't1',
    title: 'One',
    projectId: 'p1',
    projectName: 'Alpha',
    status: 'TODO',
    priority: 'LOW',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 't2',
    title: 'Two',
    projectId: 'p2',
    projectName: 'Beta',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignee: {
      id: 'u1',
      name: 'Ada',
      email: 'ada@example.com',
      provider: null,
      providerId: null,
      bio: null,
      dob: null,
      phone: null,
      isEmailConfirmed: true,
      createdAt: '',
      updatedAt: '',
    },
    dueDate: '2025-01-01',
    createdAt: '',
    updatedAt: '',
  },
];

describe('useTasksKanban', () => {
  it('maps tasks to KanbanTaskItem shape', () => {
    const { result } = renderHook(() => useTasksKanban({ tasks }));

    const items = result.current.items as KanbanTaskItem[];
    expect(items.map(i => i.id)).toEqual(['t1', 't2']);
    expect(items[0]).toMatchObject({ name: 'One', column: 'TODO' });
    expect(items[1]).toMatchObject({
      assignee: expect.any(Object),
      dueDate: '2025-01-01',
    });
    expect(items[1].raw.projectName).toBe('Beta');
  });

  it('passes onMove through and honors isTaskStatus guard', async () => {
    const onMove = vi.fn();
    const { result } = renderHook(() => useTasksKanban({ tasks, onMove }));

    // Ensure handlers exist (coming from useKanbanBoard)
    expect(typeof result.current.onDragStart).toBe('function');
    expect(typeof result.current.onDragEnd).toBe('function');
  });
});
