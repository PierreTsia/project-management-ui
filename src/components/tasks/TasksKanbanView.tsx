import { useMemo, useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import KanbanProvider, {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
} from '@/components/ui/shadcn-io/kanban';

import type { KanbanTaskItem } from '@/hooks/useTasksKanban';
import type { Task, TaskStatus } from '@/types/task';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { FullSizeKanbanCard } from '@/components/projects/FullSizeKanbanCard';
import {
  useKanbanTasksInfinite,
  type KanbanColumnData,
} from '@/hooks/useKanbanTasks';
import { useTasksKanban } from '@/hooks/useTasksKanban';
import type { GlobalSearchTasksParams } from '@/types/task';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

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
  onMove?: (args: {
    item: KanbanTaskItem;
    from: TaskStatus;
    to: TaskStatus;
  }) => Promise<void> | void;
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
  onLoadMore?: (status: TaskStatus) => void;
}) => {
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [previousTaskCount, setPreviousTaskCount] = useState(
    column.tasks.length
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset loading state when new tasks arrive
  useEffect(() => {
    if (isLoadingMore && column.tasks.length > previousTaskCount) {
      setIsLoadingMore(false);
    }
  }, [column.tasks.length, isLoadingMore, previousTaskCount]);

  const handleLoadMore = async () => {
    // Prevent multiple simultaneous requests
    if (isLoadingMore || column.isLoading) return;

    setIsLoadingMore(true);
    setPreviousTaskCount(column.tasks.length);

    // Call the load more function
    onLoadMore?.(column.status);
  };
  return (
    <div className="flex flex-col h-full">
      <KanbanHeader>
        <div className="flex items-center justify-between w-full">
          <span className="font-medium">{column.status.replace('_', ' ')}</span>
          <Badge variant="secondary" className="ml-2">
            {column.total}
          </Badge>
        </div>
      </KanbanHeader>

      <div ref={cardsContainerRef} className="flex-1 min-h-0 overflow-y-auto">
        <KanbanCards id={column.status} className="h-full">
          {(item: KanbanTask) => {
            const index = column.tasks.findIndex(task => task.id === item.id);
            const isNewCard = index >= previousTaskCount;
            return (
              <AnimatePresence initial={false}>
                <motion.div
                  key={item.id}
                  initial={
                    isNewCard
                      ? {
                          opacity: 0,
                          y: 30,
                          scale: 0.95,
                        }
                      : false
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for "pinch" effect
                    delay: isNewCard ? 0.05 : 0,
                  }}
                  style={{
                    transformOrigin: 'center bottom',
                  }}
                >
                  <KanbanCard
                    column={column.status}
                    id={item.id}
                    name={item.name}
                    className="p-0"
                  >
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
                  </KanbanCard>
                </motion.div>
              </AnimatePresence>
            );
          }}
        </KanbanCards>
      </div>

      {/* Column Footer - Fixed height and pinned to bottom */}
      <div className="h-16 flex-shrink-0 border-t border-border/50">
        <div className="h-full flex items-center justify-center px-2">
          {column.hasMore && !column.isLoading && !isLoadingMore && (
            <Button
              onClick={handleLoadMore}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <Plus className="h-3 w-3 mr-1" />
              Load More ({column.tasks.length}/{column.total})
            </Button>
          )}

          {isLoadingMore && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              <span className="text-xs text-muted-foreground">
                Loading more...
              </span>
            </div>
          )}

          {column.isLoading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}

          {column.error && (
            <div className="text-center text-destructive text-xs">
              Error loading tasks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TasksKanbanView = ({
  filters,
  onMove,
  onEdit,
  onAssign,
  onDelete,
  selectedTaskIds,
  onTaskSelectChange,
}: Readonly<Props>): ReactNode => {
  const { columns, hasError, loadMore } = useKanbanTasksInfinite(filters);

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

  const { onDragStart, onDragEnd } = useTasksKanban({
    tasks: columns.flatMap(column => column.tasks),
    ...(onMove && { onMove }),
  });

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
                onLoadMore={loadMore}
              />
            </KanbanBoard>
          );
        }}
      </KanbanProvider>
    </div>
  );
};
