import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import KanbanProvider, {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
} from '@/components/ui/shadcn-io/kanban';
import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import type { Task, TaskStatus } from '@/types/task';
import { CalendarDays } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskKanbanActionsMenu } from '@/components/projects/TaskKanbanActionsMenu';

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
  onDragEnd: (event: DragEndEvent) => void;
  onEdit?: (taskId: string) => void;
  onAssign?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
};

export const ProjectTasksKanbanView = ({
  columns,
  mappedTasks,
  onDragEnd,
  onEdit,
  onAssign,
  onDelete,
}: Readonly<Props>): ReactNode => {
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
                  <CardHeader className="p-3 pb-1">
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium leading-tight truncate whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.name}
                        </CardTitle>
                      </div>
                      <TaskKanbanActionsMenu
                        item={item}
                        onEdit={onEdit}
                        onAssign={onAssign}
                        onDelete={onDelete}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.assignee && (
                          <UserAvatar
                            user={item.assignee}
                            size="sm"
                            className="shrink-0"
                          />
                        )}
                      </div>
                      {item.dueDate && (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs shrink-0">
                          <CalendarDays className="h-3 w-3" />
                          <span>
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
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
