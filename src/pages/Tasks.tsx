import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Plus, Table, Kanban, Filter } from 'lucide-react';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskTable } from '@/components/tasks/TaskTable';
import ProjectTasksKanbanView from '@/components/projects/ProjectTasksKanbanView';
import { useTasksKanban, type KanbanTaskItem } from '@/hooks/useTasksKanban';
import type { TaskStatus, TaskPriority } from '@/types/task';

import {
  useUpdateTaskStatus,
  useDeleteTask,
  useAssignTask,
  useUnassignTask,
} from '@/hooks/useTasks';
import { getApiErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import { TaskBulkActions } from '@/components/tasks/TaskBulkActions';
import { useSearchAllUserTasks } from '@/hooks/useTasks';
import type { GlobalSearchTasksParams } from '@/types/task';
import { TASK_STATUSES } from '@/types/task';
import type { TranslationKey } from '@/hooks/useTranslations';
import { AssignTaskModal } from '@/components/projects/AssignTaskModal';
import { CreateTaskModal } from '@/components/projects/CreateTaskModal';
import { AnimatePresence, motion } from 'framer-motion';
import { createTruthyObject } from '@/lib/object-utils';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [persistedViewType, setPersistedViewType] = usePersistedState<ViewType>(
    TASKS_VIEW_STORAGE_KEY,
    'table'
  );
  const [viewType, setViewType] = useState<ViewType>(persistedViewType);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Get all params from URL or use defaults
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('limit') || '20', 10);
  const query = searchParams.get('query') || '';
  const status = searchParams.get('status') as TaskStatus | undefined;
  const priority = searchParams.get('priority') as TaskPriority | undefined;
  const assigneeFilter = searchParams.get('assigneeFilter') as
    | GlobalSearchTasksParams['assigneeFilter']
    | undefined;
  const sortBy = searchParams.get('sortBy') as
    | GlobalSearchTasksParams['sortBy']
    | undefined;
  const dueDateFrom = searchParams.get('dueDateFrom') || undefined;
  const dueDateTo = searchParams.get('dueDateTo') || undefined;
  const isOverdue = searchParams.get('isOverdue') === 'true';
  const hasDueDate = searchParams.get('hasDueDate') === 'true';

  // Check if there are any active URL parameters to determine if filters should be shown
  const hasUrlParams = useMemo(() => {
    return (
      query ||
      status ||
      priority ||
      assigneeFilter ||
      sortBy ||
      dueDateFrom ||
      dueDateTo ||
      isOverdue ||
      hasDueDate
    );
  }, [
    query,
    status,
    priority,
    assigneeFilter,
    sortBy,
    dueDateFrom,
    dueDateTo,
    isOverdue,
    hasDueDate,
  ]);

  const [showFilters, setShowFilters] = useState(hasUrlParams);

  const [filters, setFilters] = useState<GlobalSearchTasksParams>({
    page: currentPage,
    limit: pageSize,
    ...(query && { query }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assigneeFilter && { assigneeFilter }),
    ...(sortBy && { sortBy }),
    ...(dueDateFrom && { dueDateFrom }),
    ...(dueDateTo && { dueDateTo }),
    ...(isOverdue && { isOverdue: true }),
    ...(hasDueDate && { hasDueDate: true }),
  });

  const { data: tasksData, isLoading, error } = useSearchAllUserTasks(filters);

  useEffect(() => {
    setPersistedViewType(viewType);
  }, [viewType, setPersistedViewType]);

  // Update showFilters when URL parameters change
  useEffect(() => {
    setShowFilters(hasUrlParams);
  }, [hasUrlParams]);

  // Sync URL parameters with local state when URL changes
  useEffect(() => {
    setFilters({
      page: currentPage,
      limit: pageSize,
      ...(query && { query }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeFilter && { assigneeFilter }),
      ...(sortBy && { sortBy }),
      ...(dueDateFrom && { dueDateFrom }),
      ...(dueDateTo && { dueDateTo }),
      ...(isOverdue && { isOverdue: true }),
      ...(hasDueDate && { hasDueDate: true }),
    });
  }, [
    currentPage,
    pageSize,
    query,
    status,
    priority,
    assigneeFilter,
    sortBy,
    dueDateFrom,
    dueDateTo,
    isOverdue,
    hasDueDate,
  ]);

  const updateUrlParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const updateTaskStatus = useUpdateTaskStatus();
  const { mutateAsync: deleteTask } = useDeleteTask();
  const { mutateAsync: assignTask } = useAssignTask();
  const { mutateAsync: unassignTask } = useUnassignTask();

  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<string | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  // Get the task to assign
  const taskToAssignData = taskToAssign
    ? tasksData?.tasks.find(t => t.id === taskToAssign)
    : null;

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
    const cleanFilters = createTruthyObject<GlobalSearchTasksParams>(
      Object.entries(newFilters) as Array<
        [keyof GlobalSearchTasksParams, unknown]
      >
    );

    // Update local state
    setFilters(prev => ({
      page: 1,
      limit: prev.limit ?? 20,
      ...cleanFilters,
    }));

    // Update URL parameters
    const urlUpdates: Record<string, string | undefined> = {
      page: '1', // Reset to first page when filtering
    };

    if (cleanFilters.query !== undefined) {
      urlUpdates.query = cleanFilters.query;
    }
    if (cleanFilters.status !== undefined) {
      urlUpdates.status = cleanFilters.status;
    }
    if (cleanFilters.priority !== undefined) {
      urlUpdates.priority = cleanFilters.priority;
    }
    if (cleanFilters.assigneeFilter !== undefined) {
      urlUpdates.assigneeFilter = cleanFilters.assigneeFilter;
    }
    if (cleanFilters.sortBy !== undefined) {
      urlUpdates.sortBy = cleanFilters.sortBy;
    }
    if (cleanFilters.dueDateFrom !== undefined) {
      urlUpdates.dueDateFrom = cleanFilters.dueDateFrom;
    }
    if (cleanFilters.dueDateTo !== undefined) {
      urlUpdates.dueDateTo = cleanFilters.dueDateTo;
    }
    if (cleanFilters.isOverdue !== undefined) {
      urlUpdates.isOverdue = cleanFilters.isOverdue ? 'true' : undefined;
    }
    if (cleanFilters.hasDueDate !== undefined) {
      urlUpdates.hasDueDate = cleanFilters.hasDueDate ? 'true' : undefined;
    }

    updateUrlParams(urlUpdates);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    updateUrlParams({ page: String(page) });
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

  const handleAssignModalOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseAssignModal();
    }
  };

  const handleAssign = async (taskId: string, assigneeId: string) => {
    try {
      const task = tasksData?.tasks.find(t => t.id === taskId);
      if (!task) return;

      await assignTask({
        projectId: task.projectId,
        taskId,
        data: { assigneeId },
      });
      toast.success('Task assigned successfully');
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to assign task: ${errorMessage}`);
    }
  };

  const handleUnassign = async (taskId: string) => {
    try {
      const task = tasksData?.tasks.find(t => t.id === taskId);
      if (!task) return;

      await unassignTask({
        projectId: task.projectId,
        taskId,
      });
      toast.success('Task unassigned successfully');
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to unassign task: ${errorMessage}`);
    }
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

  const handleCreateTask = () => {
    setShowCreateTaskModal(true);
  };

  const handleCloseCreateTaskModal = () => {
    setShowCreateTaskModal(false);
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
            variant={!showFilters ? 'outline' : 'default'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            aria-label={t('tasks.filters.title')}
            aria-expanded={!!showFilters}
            aria-controls="tasks-filters-panel"
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
            onClick={handleCreateTask}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">
              {t('tasks.create.submit')}
            </span>
          </Button>
        </div>
      </div>

      {/* Filters with smooth enter/exit */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            id="tasks-filters-panel"
            key="filters-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="overflow-hidden">
              <TaskFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClose={() => setShowFilters(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions (animated collapse, no fixed spacer) */}
      <AnimatePresence initial={false}>
        {selectedTasks.length > 0 && (
          <motion.div
            key="bulk-actions"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="sm:static sticky top-2 z-20">
              <TaskBulkActions
                selectedTasks={selectedTasks}
                onClearSelection={clearSelection}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {taskToAssignData && (
        <AssignTaskModal
          isOpen={showAssignTaskModal}
          onOpenChange={handleAssignModalOpenChange}
          task={taskToAssignData}
          projectId={taskToAssignData.projectId}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
        />
      )}

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={handleCloseCreateTaskModal}
        // No projectId prop = global mode
      />
    </div>
  );
};
