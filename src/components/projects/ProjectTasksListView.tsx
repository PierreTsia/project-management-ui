import { Button } from '@/components/ui/button';
import { AnimatedList } from '@/components/ui/animated-list';
import { SquareCheckBig } from 'lucide-react';
import type { Task, TaskStatus } from '@/types/task';
import type { ReactNode } from 'react';

export type ProjectTasksListViewProps = {
  tasks: ReadonlyArray<Task>;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onCreate: () => void;
  renderItem: (task: Task) => ReactNode;
  ctaLabel: string;
  emptyMessage?: string;
  emptyCtaLabel?: string;
};

export const ProjectTasksListView = ({
  tasks,
  renderItem,
  onCreate,
  ctaLabel,
  emptyMessage,
  emptyCtaLabel,
}: ProjectTasksListViewProps): ReactNode => {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 pl-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {emptyMessage ?? 'No tasks yet'}
          </p>
          <Button variant="outline" size="sm" onClick={() => onCreate?.()}>
            <SquareCheckBig className="h-4 w-4 mr-2" />
            {emptyCtaLabel ?? 'Create a first task'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-2 sm:px-4">
      <AnimatedList
        items={[...tasks]}
        getKey={task => task.id}
        renderItem={renderItem}
      />
      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => onCreate?.()}
        >
          <SquareCheckBig className="h-3 w-3 mr-1" />
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
};

export default ProjectTasksListView;
