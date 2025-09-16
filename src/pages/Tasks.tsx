import { useEffect, useState, useMemo } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Plus, Table, Kanban, Filter } from 'lucide-react';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskTable } from '@/components/tasks/TaskTable';
import ProjectTasksKanbanView from '@/components/projects/ProjectTasksKanbanView';
import { useTasksKanban, type KanbanTaskItem } from '@/hooks/useTasksKanban';
import type { TaskStatus } from '@/types/task';

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
const TASKS_VIEW_STORAGE_KEY = 'tasks:viewType';

type ColumnHeader = {
  id: TaskStatus;
  name: string;
  count: number;
};

export const Tasks = () => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [persistedViewType, setPersistedViewType] = usePersistedState<ViewType>(
    TASKS_VIEW_STORAGE_KEY,
    'table'
  );
  const [viewType, setViewType] = useState<ViewType>(persistedViewType);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filters, setFilters] = useState<GlobalSearchTasksParams>({
    page: 1,
    limit: 20,
  });

  const { data: tasksData, isLoading, error } = useSearchAllUserTasks(filters);
  // Persist view type
  useEffect(() => {
    setPersistedViewType(viewType);
  }, [viewType, setPersistedViewType]);
  const updateTaskStatus = useUpdateTaskStatus();
  const { mutateAsync: deleteTask } = useDeleteTask();

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

  const handleTaskMove = async ({
    item,
    to,
  }: {
    item: KanbanTaskItem;
    to: TaskStatus;
  }) => {
    const projectId = item.raw?.projectId;
    if (!projectId) return;
    try {
      await new Promise<void>((resolve, reject) =>
        updateTaskStatus.mutate(
          { projectId, taskId: item.id, data: { status: to } },
          { onSuccess: () => resolve(), onError: err => reject(err) }
        )
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Unable to move task');
      throw err;
    }
  };

  const {
    items: boardItems,
    onDragStart,
    onDragEnd,
  } = useTasksKanban({
    tasks: tasksData?.tasks || [],
    onMove: handleTaskMove,
  });

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {t('navigation.tasks')}
          </h1>
          <p className="text-muted-foreground">{t('tasks.page.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            aria-label={t('tasks.filters.title')}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">
              {t('tasks.filters.title')}
            </span>
          </Button>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewType === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('table')}
              className="rounded-r-none"
              aria-label="Table view"
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('board')}
              className="rounded-l-none"
              aria-label="Board view"
            >
              <Kanban className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="sm"
            className="w-9 h-9 p-0 sm:w-auto sm:h-9 sm:px-3"
            aria-label={t('tasks.create.submit')}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">
              {t('tasks.create.submit')}
            </span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <TaskFilters filters={filters} onFiltersChange={handleFiltersChange} />
      )}

      {/* Bulk Actions (no layout shift, sticky on mobile) */}
      <div className="min-h-[56px] sm:min-h-[72px]">
        <div
          className={
            selectedTasks.length > 0
              ? 'opacity-100 transition-opacity duration-200'
              : 'opacity-0 pointer-events-none transition-opacity duration-200'
          }
        >
          <div className="sm:static sticky top-2 z-20">
            <TaskBulkActions
              selectedTasks={selectedTasks}
              onClearSelection={clearSelection}
            />
          </div>
        </div>
      </div>

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
          mappedTasks={boardItems}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onEdit={handleEditTask}
          onAssign={handleAssignTask}
          onDelete={handleDeleteTask}
          type="global"
          selectedTaskIds={selectedTasks}
          onTaskSelectChange={(taskId, selected) =>
            handleTaskSelect(taskId, selected)
          }
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
