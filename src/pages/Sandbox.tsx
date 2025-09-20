import { useTranslations } from '@/hooks/useTranslations';
import { useProjectTasks } from '@/hooks/useTasks';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardSnippets } from '@/components/DashboardSnippets';
import { ErrorDemo } from '@/components/ErrorDemo';
import { TaskCard } from '@/components/tasks/TaskCard';
import { LightTaskItem } from '@/components/tasks/LightTaskItem';
import { SmartTaskList } from '@/components/tasks/SmartTaskList';
import { AssignTaskModal } from '@/components/projects/AssignTaskModal';

// Hardcoded project ID for demonstration
const PROJECT_ID = 'bfa43664-ccf6-4b57-9798-2eaa4e654492';

export function Sandbox() {
  const { t } = useTranslations();
  const [__isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const [assignModalTaskId, setAssignModalTaskId] = useState<string | null>(
    null
  );

  // Fetch tasks using project tasks API
  const { data: tasks = [], isLoading, error } = useProjectTasks(PROJECT_ID);

  const handleOpenAssignModal = (taskId: string) => {
    setAssignModalTaskId(taskId);
    setIsAnyModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setAssignModalTaskId(null);
    setIsAnyModalOpen(false);
  };

  const handleAssign = async (taskId: string, assigneeId: string) => {
    console.log('Assign task', taskId, 'to user', assigneeId);
  };

  const handleUnassign = async (taskId: string) => {
    console.log('Unassign task', taskId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('sandbox.title')}</h1>
          <p className="text-muted-foreground">{t('sandbox.description')}</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('sandbox.title')}</h1>
          <p className="text-muted-foreground">{t('sandbox.description')}</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-3">
            <p className="text-sm text-destructive">
              Error loading tasks: {error.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('sandbox.title')}</h1>
        <p className="text-muted-foreground">{t('sandbox.description')}</p>
      </div>

      {/* Button showcase */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('test.showcase')}</h2>
        <div className="flex gap-2 flex-wrap">
          <Button>{t('buttons.default')}</Button>
          <Button variant="secondary">{t('buttons.secondary')}</Button>
          <Button variant="destructive">{t('buttons.destructive')}</Button>
          <Button variant="accent" size="lg">
            {t('buttons.accent')}
          </Button>
          <Button variant="warning" size="lg">
            {t('buttons.warning')}
          </Button>
          <Button variant="success" size="lg">
            {t('buttons.success')}
          </Button>
          <Button variant="outline">{t('buttons.outline')}</Button>
          <Button variant="ghost">{t('buttons.ghost')}</Button>
          <Button variant="link">{t('buttons.link')}</Button>
        </div>
      </div>

      {/* Color showcase */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('test.colorShowcase')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-primary text-primary-foreground">
            {t('colors.primary')}
          </div>
          <div className="p-4 rounded-lg bg-secondary text-secondary-foreground">
            {t('colors.secondary')}
          </div>
          <div className="p-4 rounded-lg bg-muted text-muted-foreground">
            {t('colors.muted')}
          </div>
          <div className="p-4 rounded-lg bg-accent text-accent-foreground">
            {t('colors.accent')}
          </div>
          <div className="p-4 rounded-lg bg-warning text-warning-foreground">
            {t('colors.warning')}
          </div>
          <div className="p-4 rounded-lg bg-success text-success-foreground">
            {t('colors.success')}
          </div>
        </div>
      </div>

      <DashboardSnippets />

      {/* Card showcase */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('test.cardShowcase')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-2">{t('cards.title')}</h3>
            <p className="text-muted-foreground">{t('cards.description')}</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              {t('cards.anotherCard')}
            </h3>
            <p className="text-muted-foreground">
              {t('cards.cardDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Error Boundary Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Error Boundary Testing</h2>
        <div className="flex justify-center">
          <ErrorDemo />
        </div>
      </div>

      {/* Assign Task Modal - Rendered outside task cards to prevent event bubbling */}
      {/* Smart Task List Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Smart Task List with Search & Sort
        </h2>
        <div className="border rounded-lg p-4">
          <SmartTaskList
            tasks={tasks}
            onStatusChange={(taskId, status) =>
              console.log('Status changed:', taskId, status)
            }
            onDelete={taskId => console.log('Delete task:', taskId)}
            onAssign={taskId => handleOpenAssignModal(taskId)}
            onEdit={taskId => console.log('Edit task:', taskId)}
            onCreate={() => console.log('Create new task')}
            renderItem={task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={status =>
                  console.log('Status changed:', status)
                }
                onOpenAssignModal={handleOpenAssignModal}
              />
            )}
            ctaLabel="Add New Task"
            emptyMessage="No tasks found"
            emptyCtaLabel="Create your first task"
            showSearch={true}
            showSort={true}
            showFilters={true}
            showFloatingButton={true}
          />
        </div>
      </div>

      {/* Compact Scrollable List Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Compact Scrollable List (300px)
        </h2>
        <div className="border rounded-lg p-4">
          <SmartTaskList
            tasks={tasks}
            onStatusChange={(taskId, status) =>
              console.log('Status changed:', taskId, status)
            }
            onDelete={taskId => console.log('Delete task:', taskId)}
            onAssign={taskId => handleOpenAssignModal(taskId)}
            onEdit={taskId => console.log('Edit task:', taskId)}
            onCreate={() => console.log('Create new task')}
            renderItem={task => (
              <LightTaskItem
                key={task.id}
                task={task}
                onStatusChange={status =>
                  console.log('Status changed:', status)
                }
                onOpenAssignModal={handleOpenAssignModal}
              />
            )}
            ctaLabel="Add Task"
            emptyMessage="No tasks found"
            emptyCtaLabel="Create your first task"
            showSearch={true}
            showSort={false}
            showFilters={true}
            showFloatingButton={true}
          />
        </div>
      </div>

      {assignModalTaskId && (
        <AssignTaskModal
          isOpen={!!assignModalTaskId}
          onOpenChange={handleCloseAssignModal}
          task={{
            id: assignModalTaskId,
            title: 'Loading...',
            description: '',
            status: 'TODO' as const,
            priority: 'MEDIUM' as const,
            projectId: PROJECT_ID,
            projectName: 'Loading...',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
          projectId={PROJECT_ID}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
        />
      )}
    </div>
  );
}
