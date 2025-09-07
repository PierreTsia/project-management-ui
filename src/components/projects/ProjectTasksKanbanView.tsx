import { UserAvatar } from '@/components/ui/user-avatar';
import KanbanProvider, {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
} from '@/components/ui/shadcn-io/kanban';
import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import type { Task, TaskStatus } from '@/types/task';
import type { ReactNode } from 'react';

export type Props = {
  columns: { id: TaskStatus; name: string }[];
  mappedTasks: {
    id: string;
    name: string;
    column: TaskStatus;
    assignee?: Task['assignee'];
    dueDate?: Task['dueDate'];
  }[];
  onDragEnd: (event: DragEndEvent) => void;
};

export const ProjectTasksKanbanView = ({
  columns,
  mappedTasks,
  onDragEnd,
}: Readonly<Props>): ReactNode => (
  <div className="space-y-3">
    <KanbanProvider columns={columns} data={mappedTasks} onDragEnd={onDragEnd}>
      {column => (
        <KanbanBoard id={column.id} key={column.id}>
          <KanbanHeader>
            <div className="flex items-center gap-2">
              <span>{column.name}</span>
            </div>
          </KanbanHeader>
          <KanbanCards id={column.id}>
            {(item: (typeof mappedTasks)[number]) => (
              <KanbanCard
                column={column.id}
                id={item.id}
                key={item.id}
                name={item.name}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="m-0 flex-1 font-medium text-sm">
                      {item.name}
                    </p>
                  </div>
                  {item.assignee && (
                    <UserAvatar
                      user={item.assignee}
                      size="sm"
                      className="shrink-0"
                    />
                  )}
                </div>
                {item.dueDate && (
                  <p className="m-0 text-muted-foreground text-xs">
                    {new Date(item.dueDate).toLocaleDateString()}
                  </p>
                )}
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  </div>
);

export default ProjectTasksKanbanView;
