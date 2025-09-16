import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKanbanBoard, type KanbanItem } from '@/hooks/useKanbanBoard';
import type { DragStartEvent } from '@dnd-kit/core';
import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import type { Prettify } from '@/types/helpers';

// Minimal drag event shapes matching our hook usage
const createDragStartEvent = (id: string): DragStartEvent => ({
  active: { id } as unknown as DragStartEvent['active'],
  activatorEvent: undefined as unknown as DragStartEvent['activatorEvent'],
});

const createDragEndEvent = (activeId: string, over: unknown): DragEndEvent => ({
  active: { id: activeId } as unknown as DragEndEvent['active'],
  over: over as DragEndEvent['over'],
  activatorEvent: undefined as unknown as DragEndEvent['activatorEvent'],
  collisions: null as unknown as DragEndEvent['collisions'],
  delta: { x: 0, y: 0 } as DragEndEvent['delta'],
});

type Status = 'A' | 'B' | 'C';

type Item = Prettify<KanbanItem<Status> & { name: string }>;

const items: Item[] = [
  { id: '1', column: 'A', name: 'One' } as unknown as Item,
  { id: '2', column: 'B', name: 'Two' } as unknown as Item,
  { id: '3', column: 'C', name: 'Three' } as unknown as Item,
];

describe('useKanbanBoard', () => {
  it('keeps internal state in sync with external items', () => {
    const { result, rerender } = renderHook(
      ({ data }) =>
        useKanbanBoard<Status, Item>({
          items: data,
          isColumn: (id): id is Status => ['A', 'B', 'C'].includes(id),
        }),
      { initialProps: { data: items } }
    );

    expect(result.current.boardItems.map(i => i.id)).toEqual(['1', '2', '3']);

    const next = [
      ...items,
      { id: '4', column: 'A', name: 'Four' } as unknown as Item,
    ];
    rerender({ data: next });

    expect(result.current.boardItems.map(i => i.id)).toEqual([
      '1',
      '2',
      '3',
      '4',
    ]);
  });

  it('captures origin on drag start and updates optimistically on drag end success', async () => {
    const onMove = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useKanbanBoard<Status, Item>({
        items,
        onMove,
        isColumn: (id): id is Status => ['A', 'B', 'C'].includes(id),
      })
    );

    act(() => {
      result.current.onDragStart(createDragStartEvent('1'));
    });

    // Move item 1 from A -> B via containerId resolution
    const event = createDragEndEvent('1', {
      id: '2',
      data: { current: { sortable: { containerId: 'B' } } },
    });

    await act(async () => {
      await result.current.onDragEnd(event);
    });

    expect(result.current.boardItems.find(i => i.id === '1')!.column).toBe('B');
    expect(onMove).toHaveBeenCalledWith({
      item: expect.objectContaining({ id: '1' }),
      from: 'A',
      to: 'B',
    });
  });

  it('rolls back onMove failure after optimistic update', async () => {
    const onMove = vi.fn().mockRejectedValue(new Error('nope'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useKanbanBoard<Status, Item>({
        items,
        onMove,
        isColumn: (id): id is Status => ['A', 'B', 'C'].includes(id),
      })
    );

    act(() => {
      result.current.onDragStart(createDragStartEvent('2'));
    });

    const event = createDragEndEvent('2', {
      id: '3',
      data: { current: { sortable: { containerId: 'A' } } },
    });

    await act(async () => {
      await result.current.onDragEnd(event);
    });

    // Should roll back to original column B
    expect(result.current.boardItems.find(i => i.id === '2')!.column).toBe('B');
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('does nothing when dropping in same column or without target', async () => {
    const onMove = vi.fn();
    const { result } = renderHook(() =>
      useKanbanBoard<Status, Item>({
        items,
        onMove,
        isColumn: (id): id is Status => ['A', 'B', 'C'].includes(id),
      })
    );

    // same column
    await act(async () => {
      await result.current.onDragEnd(createDragEndEvent('3', { id: '3' }));
    });
    expect(onMove).not.toHaveBeenCalled();

    // no over target
    await act(async () => {
      await result.current.onDragEnd(
        createDragEndEvent('3', null as unknown as DragEndEvent['over'])
      );
    });
    expect(onMove).not.toHaveBeenCalled();
  });

  it('moveOptimistic updates item column immediately', () => {
    const { result } = renderHook(() =>
      useKanbanBoard<Status, Item>({
        items,
        isColumn: (id): id is Status => ['A', 'B', 'C'].includes(id),
      })
    );

    act(() => {
      result.current.moveOptimistic('1', 'C');
    });

    expect(result.current.boardItems.find(i => i.id === '1')!.column).toBe('C');
  });
});
