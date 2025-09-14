import { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Plus, Table, Kanban, Filter } from 'lucide-react';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskTable } from '@/components/tasks/TaskTable';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskBulkActions } from '@/components/tasks/TaskBulkActions';
import { useSearchAllUserTasks } from '@/hooks/useTasks';
import type { GlobalSearchTasksParams } from '@/types/task';

type ViewType = 'table' | 'board';

export const Tasks = () => {
  const { t } = useTranslations();
  const [viewType, setViewType] = useState<ViewType>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filters, setFilters] = useState<GlobalSearchTasksParams>({
    page: 1,
    limit: 20,
  });

  const { data: tasksData, isLoading, error } = useSearchAllUserTasks(filters);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.tasks')}</h1>
          <p className="text-muted-foreground">
            Manage all your tasks across projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
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
            New Task
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
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load tasks</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
        <TaskBoard
          tasks={tasksData?.tasks || []}
          selectedTasks={selectedTasks}
          onTaskSelect={handleTaskSelect}
        />
      )}
    </div>
  );
};
