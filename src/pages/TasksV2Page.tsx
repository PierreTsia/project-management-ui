import { useMemo, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';
import { Filter, Kanban, Plus, Table } from 'lucide-react';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { useTasksQueryParams } from '@/hooks/useTasksQueryParams';
import { useSearchAllUserTasksV2 } from '@/hooks/useTasks';
import type { GlobalSearchTasksParams, TaskStatus } from '@/types/task';
import { TASK_STATUSES } from '@/types/task';
import { TaskTable } from '@/components/tasks/TaskTable';
import ProjectTasksKanbanView from '@/components/projects/ProjectTasksKanbanView';
import { useTasksKanban, type KanbanTaskItem } from '@/hooks/useTasksKanban';
import {
  useUpdateTaskStatus,
  useDeleteTask,
  useAssignTask,
  useUnassignTask,
} from '@/hooks/useTasks';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AssignTaskModal } from '@/components/projects/AssignTaskModal';
import { CreateTaskModal } from '@/components/projects/CreateTaskModal';
import type { TranslationKey } from '@/hooks/useTranslations';
import { createTruthyObject } from '@/lib/object-utils';

export type TasksV2ViewType = 'kanban' | 'list';

function getValidViewType(raw: string | null): TasksV2ViewType {
  if (raw === 'kanban' || raw === 'list') {
    return raw;
  }
  return 'list';
}

const TASK_STATUS_KEYS: Record<TaskStatus, TranslationKey> = {
  TODO: 'tasks.status.todo',
  IN_PROGRESS: 'tasks.status.in_progress',
  DONE: 'tasks.status.done',
};

export default function TasksV2Page() {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewType = useMemo<TasksV2ViewType>(
    () => getValidViewType(searchParams.get('viewType')),
    [searchParams]
  );

  const { filters, hasUrlParams, updateFilters, updatePage, clearFilters } =
    useTasksQueryParams();
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: tasksData,
    isLoading,
    error,
  } = useSearchAllUserTasksV2(filters);

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const handleFiltersChange = (
    newFilters: Partial<GlobalSearchTasksParams>
  ) => {
    const cleanFilters = createTruthyObject<GlobalSearchTasksParams>(
      Object.entries(newFilters) as Array<
        [keyof GlobalSearchTasksParams, unknown]
      >
    );
    if (Object.keys(cleanFilters).length === 0) {
      clearFilters();
    } else {
      updateFilters(cleanFilters, true);
    }
  };

  const handlePageChange = (page: number) => {
    updatePage(page);
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

  const { mutateAsync: updateTaskStatus } = useUpdateTaskStatus();
  const { mutateAsync: deleteTask } = useDeleteTask();
  const { mutateAsync: assignTask } = useAssignTask();
  const { mutateAsync: unassignTask } = useUnassignTask();

  const handleEditTask = (taskId: string) => {
    const task = tasksData?.tasks.find(t => t.id === taskId);
    if (!task?.projectId) return;
    navigate(`/projects/${task.projectId}/${taskId}`);
  };

  const handleAssignTask = (taskId: string) => {
    setTaskToAssign(taskId);
    setShowAssignTaskModal(true);
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

  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<string | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  const taskToAssignData = taskToAssign
    ? tasksData?.tasks.find(t => t.id === taskToAssign)
    : null;

  const handleAssignModalOpenChange = (open: boolean) => {
    if (!open) {
      setShowAssignTaskModal(false);
      setTaskToAssign(null);
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
      await unassignTask({ projectId: task.projectId, taskId });
      toast.success('Task unassigned successfully');
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(`Failed to unassign task: ${errorMessage}`);
    }
  };

  const handleCreateTask = () => {
    setShowCreateTaskModal(true);
  };

  const handleCloseCreateTaskModal = () => {
    setShowCreateTaskModal(false);
  };

  const columnHeaders = useMemo(() => {
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
      await updateTaskStatus({
        projectId,
        taskId: item.id,
        data: { status: to },
      });
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

  const onSwitchView = (next: TasksV2ViewType) => {
    const params = new URLSearchParams(searchParams);
    params.set('viewType', next);
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {t('navigation.tasks')}
            </h1>
            <p className="text-muted-foreground">Tasks V2</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={!hasUrlParams ? 'outline' : 'default'}
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
                variant={viewType === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onSwitchView('list')}
                className="rounded-r-none"
                aria-label="List view"
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onSwitchView('kanban')}
                className="rounded-l-none"
                aria-label="Kanban view"
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
            <Link to="/tasks">
              <Button variant="ghost" size="sm" aria-label="Back to Tasks">
                Back
              </Button>
            </Link>
          </div>
        </div>

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
              <p className="text-destructive mb-4">
                {t('tasks.page.loadError')}
              </p>
              <Button onClick={() => window.location.reload()}>
                {t('errorBoundary.tryAgain')}
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && viewType === 'list' && (
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

        {!isLoading && !error && viewType === 'kanban' && (
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
        />
      </div>
    </div>
  );
}
