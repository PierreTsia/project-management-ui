import KanbanProvider, {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
} from '@/components/ui/shadcn-io/kanban';
import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import type { Task, TaskStatus } from '@/types/task';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { CompactKanbanCard } from '@/components/projects/CompactKanbanCard';
import { FullSizeKanbanCard } from '@/components/projects/FullSizeKanbanCard';

export type KanbanTask = {
  id: string;
  name: string;
  column: TaskStatus;
  assignee?: Task['assignee'];
  dueDate?: Task['dueDate'];
  raw: Task;
};

export type Props = {
  columns: { id: TaskStatus; name: string; count: number }[];
  mappedTasks: KanbanTask[];
  type?: 'global' | 'project';
  onDragEnd: (event: DragEndEvent) => void;
  onEdit?: (taskId: string) => void;
  onAssign?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  selectedTaskIds?: string[];
  onTaskSelectChange?: (taskId: string, selected: boolean) => void;
};

export const ProjectTasksKanbanView = ({
  columns,
  mappedTasks,
  onDragEnd,
  onEdit,
  onAssign,
  onDelete,
  type = 'project',
  selectedTaskIds,
  onTaskSelectChange,
}: Readonly<Props>): ReactNode => {
  void type;
  return (
    <div className="space-y-3">
      <KanbanProvider
        columns={columns}
        data={mappedTasks}
        onDragEnd={onDragEnd}
      >
        {column => (
          <KanbanBoard id={column.id} key={column.id}>
            <KanbanHeader>
              <div className="flex items-center justify-between gap-2 w-full">
                <span>{column.name}</span>
                <Badge className="text-xs">{column.count}</Badge>
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id}>
              {(item: (typeof mappedTasks)[number]) => (
                <KanbanCard
                  column={column.id}
                  id={item.id}
                  key={item.id}
                  name={item.name}
                  className="p-0"
                >
                  {type === 'global' ? (
                    <FullSizeKanbanCard
                      item={item}
                      onEdit={onEdit}
                      onAssign={onAssign}
                      onDelete={onDelete}
                      selected={selectedTaskIds?.includes(item.id)}
                      onSelectChange={onTaskSelectChange}
                    />
                  ) : (
                    <CompactKanbanCard
                      item={item}
                      onEdit={onEdit}
                      onAssign={onAssign}
                      onDelete={onDelete}
                    />
                  )}
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
};

export default ProjectTasksKanbanView;
