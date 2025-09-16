import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Plus, Table, Kanban, Filter } from 'lucide-react';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskTable } from '@/components/tasks/TaskTable';
import ProjectTasksKanbanView from '@/components/projects/ProjectTasksKanbanView';
import type { TaskStatus } from '@/types/task';
import type { DragEndEvent } from '@/components/ui/shadcn-io/kanban';
import { useUpdateTaskStatus, useDeleteTask } from '@/hooks/useTasks';
import { getApiErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import { TaskBulkActions } from '@/components/tasks/TaskBulkActions';
import { useSearchAllUserTasks } from '@/hooks/useTasks';
import type { GlobalSearchTasksParams } from '@/types/task';
import { TASK_STATUSES } from '@/types/task';
import type { TranslationKey } from '@/hooks/useTranslations';
import { AssignTaskModal } from '@/components/projects/AssignTaskModal';

const TASK_STATUS_KEYS: Record<TaskStatus, TranslationKey> = {
  TODO: 'tasks.status.todo',
  IN_PROGRESS: 'tasks.status.in_progress',
  DONE: 'tasks.status.done',
};

type ViewType = 'table' | 'board';

type ColumnHeader = {
  id: TaskStatus;
  name: string;
  count: number;
};

export const Tasks = () => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<ViewType>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filters, setFilters] = useState<GlobalSearchTasksParams>({
    page: 1,
    limit: 20,
  });

  const { data: tasksData, isLoading, error } = useSearchAllUserTasks(filters);
  const updateTaskStatus = useUpdateTaskStatus();
  const { mutateAsync: deleteTask } = useDeleteTask();

  // Local Kanban items to allow optimistic UI moves
  type MappedKanbanItem = {
    id: string;
    name: string;
    column: TaskStatus;
    assignee?: ReturnType<typeof Object> | undefined;
    dueDate?: string | undefined;
    raw: ReturnType<typeof Object>;
  };
  const [kanbanItems, setKanbanItems] = useState<MappedKanbanItem[]>([]);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<string | null>(null);

  const columnHeaders: ColumnHeader[] = useMemo(() => {
    return TASK_STATUSES.map((status: TaskStatus) => ({
      id: status,
      name: t(TASK_STATUS_KEYS[status]),
      count:
        tasksData?.tasks.filter(task => task.status === status).length || 0,
    }));
  }, [tasksData, t]);

  useEffect(() => {
    if (!tasksData?.tasks) return;
    setKanbanItems(
      (tasksData?.tasks || []).map(t => ({
        id: t.id,
        name: t.title,
        column: t.status as TaskStatus,
        assignee: t.assignee,
        dueDate: t.dueDate,
        raw: t,
      }))
    );
  }, [tasksData]);

  const handleKanbanDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const taskId = String(active.id);
      const overId = String(over.id);
      const sourceTask = tasksData?.tasks.find(t => t.id === taskId);
      const source = sourceTask?.status as TaskStatus | undefined;
      const target: TaskStatus = (
        ['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]
      ).includes(overId as TaskStatus)
        ? (overId as TaskStatus)
        : (tasksData?.tasks.find(t => t.id === overId)?.status as TaskStatus) ||
          source!;
      if (!source || !target || source === target) return;
      if (!sourceTask?.projectId) return;
      // Optimistic local move
      setKanbanItems(prev =>
        prev.map(i => (i.id === taskId ? { ...i, column: target } : i))
      );
      updateTaskStatus.mutate(
        {
          projectId: sourceTask.projectId,
          taskId,
          data: { status: target },
        },
        {
          onError: (err: unknown) => {
            toast.error(getApiErrorMessage(err) || 'Unable to move task');
            // Revert UI explicitly to source column
            setKanbanItems(prev =>
              prev.map(i => (i.id === taskId ? { ...i, column: source } : i))
            );
          },
          onSuccess: () => {
            // Ensure UI reflects final server state
            setKanbanItems(prev =>
              prev.map(i => (i.id === taskId ? { ...i, column: target } : i))
            );
          },
        }
      );
    },
    [tasksData, updateTaskStatus]
  );

  const handleFiltersChange = (
    newFilters: Partial<GlobalSearchTasksParams>
  ) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    setSelectedTasks(prev =>
      selected ? [...prev, taskId] : prev.filter(id => id !== taskId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTasks(tasksData?.tasks.map(task => task.id) || []);
    } else {
      setSelectedTasks([]);
    }
  };

  const clearSelection = () => {
    setSelectedTasks([]);
  };

  // Actions for Kanban TaskActionsMenu
  const handleEditTask = (taskId: string) => {
    const task = tasksData?.tasks.find(t => t.id === taskId);
    if (!task?.projectId) return;
    navigate(`/projects/${task.projectId}/${taskId}`);
  };

  const handleAssignTask = (taskId: string) => {
    setTaskToAssign(taskId);
    setShowAssignTaskModal(true);
  };

  const handleCloseAssignModal = () => {
    setShowAssignTaskModal(false);
    setTaskToAssign(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = tasksData?.tasks.find(t => t.id === taskId);
    if (!task?.projectId) return;
    try {
      await deleteTask({ projectId: task.projectId, taskId });
      toast.success(t('tasks.delete.success'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.tasks')}</h1>
          <p className="text-muted-foreground">{t('tasks.page.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {t('tasks.filters.title')}
          </Button>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewType === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('table')}
              className="rounded-r-none"
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('board')}
              className="rounded-l-none"
            >
              <Kanban className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('tasks.create.submit')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <TaskFilters filters={filters} onFiltersChange={handleFiltersChange} />
      )}

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <TaskBulkActions
          selectedTasks={selectedTasks}
          onClearSelection={clearSelection}
        />
      )}

      {/* Tasks Content */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('tasks.loading')}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">{t('tasks.page.loadError')}</p>
            <Button onClick={() => window.location.reload()}>
              {t('errorBoundary.tryAgain')}
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !error && viewType === 'table' && (
        <TaskTable
          tasks={tasksData?.tasks || []}
          pagination={{
            page: tasksData?.page || 1,
            limit: tasksData?.limit || 20,
            total: tasksData?.total || 0,
            totalPages: tasksData?.totalPages || 0,
            hasNextPage: tasksData?.hasNextPage || false,
            hasPreviousPage: tasksData?.hasPreviousPage || false,
          }}
          selectedTasks={selectedTasks}
          onTaskSelect={handleTaskSelect}
          onSelectAll={handleSelectAll}
          onPageChange={handlePageChange}
        />
      )}

      {!isLoading && !error && viewType === 'board' && (
        <ProjectTasksKanbanView
          columns={columnHeaders}
          mappedTasks={kanbanItems}
          onDragEnd={handleKanbanDragEnd}
          onEdit={handleEditTask}
          onAssign={handleAssignTask}
          onDelete={handleDeleteTask}
        />
      )}

      {taskToAssign && tasksData?.tasks && (
        <AssignTaskModal
          isOpen={showAssignTaskModal}
          onOpenChange={open => {
            if (!open) handleCloseAssignModal();
          }}
          task={tasksData.tasks.find(t => t.id === taskToAssign)!}
          projectId={
            tasksData.tasks.find(t => t.id === taskToAssign)!.projectId
          }
        />
      )}
    </div>
  );
};
