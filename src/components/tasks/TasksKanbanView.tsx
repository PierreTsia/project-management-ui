import { useMemo } from 'react';
import KanbanProvider, {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
} from '@/components/ui/shadcn-io/kanban';
import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import type { DragStartEvent } from '@dnd-kit/core';
import type { Task, TaskStatus } from '@/types/task';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { CompactKanbanCard } from '@/components/projects/CompactKanbanCard';
import { FullSizeKanbanCard } from '@/components/projects/FullSizeKanbanCard';
import { useKanbanTasks, type KanbanColumnData } from '@/hooks/useKanbanTasks';
import type { GlobalSearchTasksParams } from '@/types/task';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export type KanbanTask = {
  id: string;
  name: string;
  column: TaskStatus;
  assignee?: Task['assignee'];
  dueDate?: Task['dueDate'];
  raw: Task;
};

export type Props = {
  filters: Omit<GlobalSearchTasksParams, 'status' | 'page' | 'limit'>;
  onDragEnd: (event: DragEndEvent) => void;
  onDragStart: (event: DragStartEvent) => void;
  onEdit?: (taskId: string) => void;
  onAssign?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  selectedTaskIds?: string[];
  onTaskSelectChange?: (taskId: string, selected: boolean) => void;
  type?: 'global' | 'project';
};

// Column component with load more button
const KanbanColumn = ({
  column,
  onEdit,
  onAssign,
  onDelete,
  selectedTaskIds,
  onTaskSelectChange,
  onLoadMore,
}: {
  column: KanbanColumnData;
  onEdit?: (taskId: string) => void;
  onAssign?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  selectedTaskIds?: string[];
  onTaskSelectChange?: (taskId: string, selected: boolean) => void;
  onLoadMore: (status: TaskStatus) => void;
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <KanbanHeader>
        <div className="flex items-center justify-between w-full">
          <span className="font-medium">{column.status.replace('_', ' ')}</span>
          <Badge variant="secondary" className="ml-2">
            {column.total}
          </Badge>
        </div>
      </KanbanHeader>

      <KanbanCards
        id={column.status}
        className="min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto"
      >
        {(item: KanbanTask) => (
          <KanbanCard
            column={column.status}
            id={item.id}
            key={item.id}
            name={item.name}
            className="p-0"
          >
            {column.status === 'TODO' ? (
              <CompactKanbanCard
                item={item}
                onEdit={onEdit}
                onAssign={onAssign}
                onDelete={onDelete}
              />
            ) : (
              <FullSizeKanbanCard
                item={item}
                onEdit={onEdit}
                onAssign={onAssign}
                onDelete={onDelete}
                selected={selectedTaskIds?.includes(item.id) || false}
                onSelectChange={(taskId: string, selected: boolean) =>
                  onTaskSelectChange?.(taskId, selected)
                }
              />
            )}
          </KanbanCard>
        )}
      </KanbanCards>

      {/* Column Footer */}
      {column.hasMore && !column.isLoading && (
        <div className="pt-3">
          <Separator className="mb-3" />
          <div className="flex items-center justify-center">
            {column.hasMore && !column.isLoading && (
              <Button
                onClick={() => {
                  console.log('🔄 Load more clicked for:', column.status);
                  onLoadMore(column.status);
                }}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Load More ({column.tasks.length}/{column.total})
              </Button>
            )}

            {column.isLoading && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}

            {column.error && (
              <div className="text-center py-2 text-destructive text-xs">
                Error loading tasks
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const TasksKanbanView = ({
  filters,
  onDragEnd,
  onDragStart,
  onEdit,
  onAssign,
  onDelete,
  selectedTaskIds,
  onTaskSelectChange,
}: Readonly<Props>): ReactNode => {
  const { columns, hasError } = useKanbanTasks(filters);

  // Convert tasks to Kanban format
  const mappedTasks: KanbanTask[] = useMemo(
    () =>
      columns.flatMap(column =>
        column.tasks.map(task => ({
          id: task.id,
          name: task.title,
          column: task.status,
          assignee: task.assignee,
          dueDate: task.dueDate,
          raw: task,
        }))
      ),
    [columns]
  );

  // Convert columns to the format expected by KanbanProvider
  const kanbanColumns = useMemo(
    () =>
      columns.map(column => ({
        id: column.status,
        name: column.status.replace('_', ' '),
        count: column.total,
      })),
    [columns]
  );

  if (hasError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading kanban board</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="kanban-view">
      <KanbanProvider
        columns={kanbanColumns}
        data={mappedTasks}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        {column => {
          const columnData = columns.find(c => c.status === column.id);
          if (!columnData) return null;

          return (
            <KanbanBoard id={column.id} key={column.id}>
              <KanbanColumn
                column={columnData}
                onEdit={onEdit || (() => {})}
                onAssign={onAssign || (() => {})}
                onDelete={onDelete || (() => {})}
                selectedTaskIds={selectedTaskIds || []}
                onTaskSelectChange={onTaskSelectChange || (() => {})}
                onLoadMore={status => {
                  console.log('🔄 onLoadMore triggered for status:', status);
                  console.log('📊 Column data:', columnData);
                  console.log('📈 Has more:', columnData.hasMore);
                  console.log('⏳ Is loading:', columnData.isLoading);
                }} // TODO: Implement loadMore when infinite scroll is ready
              />
            </KanbanBoard>
          );
        }}
      </KanbanProvider>
    </div>
  );
};
