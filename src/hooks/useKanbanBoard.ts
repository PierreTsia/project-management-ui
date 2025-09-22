import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import type { DragStartEvent } from '@dnd-kit/core';

type KanbanStatus = string;

export type KanbanItem<C extends KanbanStatus = KanbanStatus> = {
  id: string;
  column: C;
} & Record<string, unknown>;

export type UseKanbanBoardParams<
  C extends KanbanStatus,
  I extends KanbanItem<C>,
> = {
  items: I[];
  onMove?: (args: { item: I; from: C; to: C }) => Promise<void> | void;
  enableReorder?: boolean;
  isColumn?: (id: string) => id is C;
};

export function useKanbanBoard<
  C extends KanbanStatus,
  I extends KanbanItem<C>,
>({ items, onMove, isColumn }: UseKanbanBoardParams<C, I>) {
  const [boardItems, setBoardItems] = useState<I[]>(items);

  // Keep internal state in sync with external items
  useEffect(() => {
    setBoardItems(prevItems => {
      // Only update if the items have actually changed
      if (
        prevItems.length !== items.length ||
        !prevItems.every(
          (item, index) =>
            items[index] &&
            item.id === items[index].id &&
            item.column === items[index].column
        )
      ) {
        return items;
      }
      return prevItems;
    });
  }, [items]);

  const idToItem = useMemo(
    () => new Map(boardItems.map(i => [i.id, i])),
    [boardItems]
  );
  const dragStartFromRef = useRef<{ id: string; from: C } | null>(null);

  const resolveToStatus = useCallback(
    (event: DragEndEvent, fallback: C | undefined): C | undefined => {
      const { over } = event;
      if (!over) return undefined;
      const overId = String(over.id);
      // If the overId represents a column, prefer it
      if (isColumn && isColumn(overId)) {
        return overId as C;
      }
      const overItem = idToItem.get(overId) as I | undefined;
      const overColumnFromItem = overItem?.column as C | undefined;
      const overContainerId = (
        over as unknown as {
          data?: { current?: { sortable?: { containerId?: string } } };
        }
      )?.data?.current?.sortable?.containerId as C | undefined;
      if (isColumn && overContainerId && isColumn(String(overContainerId))) {
        return overContainerId as C;
      }
      return (overColumnFromItem as C | undefined) ?? fallback;
    },
    [idToItem, isColumn]
  );

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        return;
      }
      const activeId = String(active.id);
      const activeItem = idToItem.get(activeId);
      if (!activeItem) {
        return;
      }
      const from = (
        dragStartFromRef.current?.id === activeId
          ? dragStartFromRef.current?.from
          : (activeItem.column as C)
      ) as C;
      const to = resolveToStatus(event, undefined);
      if (!to) {
        return;
      }
      if (from === to) {
        return;
      }

      // Optimistic update
      setBoardItems(prev =>
        prev.map(i => (i.id === activeId ? ({ ...i, column: to } as I) : i))
      );

      try {
        await onMove?.({ item: activeItem as I, from, to });
      } catch (e) {
        console.error('[useKanbanBoard] onDragEnd', { e });
        // Rollback
        setBoardItems(prev =>
          prev.map(i => (i.id === activeId ? ({ ...i, column: from } as I) : i))
        );
      }
    },
    [idToItem, onMove, resolveToStatus]
  );

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeId = String(event.active.id);
      const activeItem = idToItem.get(activeId) as I | undefined;
      const from = activeItem?.column as C | undefined;
      dragStartFromRef.current =
        activeItem && from ? { id: activeId, from } : null;
    },
    [idToItem]
  );

  const moveOptimistic = useCallback((itemId: string, to: C) => {
    setBoardItems(prev =>
      prev.map(i => (i.id === itemId ? ({ ...i, column: to } as I) : i))
    );
  }, []);

  return {
    boardItems,
    setBoardItems,
    onDragStart,
    onDragEnd,
    moveOptimistic,
  } as const;
}

export default useKanbanBoard;
