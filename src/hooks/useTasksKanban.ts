import { useMemo } from 'react';
import { useKanbanBoard, type KanbanItem } from '@/hooks/useKanbanBoard';
import type { Task, TaskStatus } from '@/types/task';
import { isTaskStatus } from '@/types/guards';
import type { Prettify } from '@/types/helpers';

export type KanbanTaskItem = Prettify<
  KanbanItem<TaskStatus> & {
    id: string;
    name: string;
    assignee?: Task['assignee'];
    dueDate?: Task['dueDate'];
    raw: Task;
  }
>;

export function useTasksKanban({
  tasks,
  onMove,
}: {
  tasks: Task[];
  onMove?: (args: {
    item: KanbanTaskItem;
    from: TaskStatus;
    to: TaskStatus;
  }) => Promise<void> | void;
}) {
  const mapped = useMemo<KanbanTaskItem[]>(
    () =>
      (tasks || []).map(task => ({
        id: task.id,
        name: task.title,
        column: task.status,
        assignee: task.assignee,
        dueDate: task.dueDate,
        raw: task,
      })),
    [tasks]
  );

  const { boardItems, onDragStart, onDragEnd } = useKanbanBoard<
    TaskStatus,
    KanbanTaskItem
  >({
    items: mapped,
    isColumn: (id: string): id is TaskStatus => isTaskStatus(id),
    ...(onMove ? { onMove } : {}),
  });

  return { items: boardItems, onDragStart, onDragEnd } as const;
}

export default useTasksKanban;
