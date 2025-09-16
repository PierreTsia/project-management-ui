import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/ui/user-avatar';
import KanbanProvider, {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
} from '@/components/ui/shadcn-io/kanban';
import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import type { Task, TaskStatus } from '@/types/task';
import {
  CalendarDays,
  Edit3,
  MoreHorizontal,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';

export type Props = {
  columns: { id: TaskStatus; name: string; count: number }[];
  mappedTasks: {
    id: string;
    name: string;
    column: TaskStatus;
    assignee?: Task['assignee'];
    dueDate?: Task['dueDate'];
    raw: Task;
  }[];
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
  const { t } = useTranslations();

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
                      <div
                        className="shrink-0"
                        onMouseDown={e => e.stopPropagation()}
                        onTouchStart={e => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100 hover:bg-muted/50 transition-all duration-200"
                              data-testid={`kanban-task-${item.id}-actions-button`}
                              onClick={e => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                onEdit?.(item.raw.id);
                              }}
                              className="cursor-pointer"
                              data-testid={`kanban-task-${item.id}-edit-option`}
                            >
                              <Edit3 className="h-3 w-3 mr-2" />
                              {t('tasks.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                onAssign?.(item.raw.id);
                              }}
                              className="cursor-pointer"
                              data-testid={`kanban-task-${item.id}-assign-option`}
                            >
                              <UserPlus className="h-3 w-3 mr-2" />
                              {t('tasks.actions.assign')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                onDelete?.(item.raw.id);
                              }}
                              className="cursor-pointer text-destructive focus:text-destructive"
                              data-testid={`kanban-task-${item.id}-delete-option`}
                            >
                              <Trash2 className="h-3 w-3 mr-2 text-destructive" />
                              {t('tasks.actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
